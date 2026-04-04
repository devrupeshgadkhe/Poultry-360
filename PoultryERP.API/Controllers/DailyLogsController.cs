using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoultryERP.Persistence.Context;
using PoultryERP.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DailyLogsController : ControllerBase
    {
        private readonly PoultryDbContext _context;

        public DailyLogsController(PoultryDbContext context)
        {
            _context = context;
        }

        // GET: api/DailyLogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DailyLog>>> GetDailyLogs()
        {
            return await _context.DailyLogs
                .Include(l => l.Flock)
                .Include(l => l.FeedItem)
                .OrderByDescending(l => l.Date)
                .ToListAsync();
        }

        // POST: api/DailyLogs
        [HttpPost]
        public async Task<ActionResult<DailyLog>> PostDailyLog(DailyLog log)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (log.Date == default) log.Date = DateTime.Now;
                var logDate = log.Date.Date;

                // Duplicate Check
                var isDuplicate = await _context.DailyLogs
                    .AnyAsync(l => l.FlockId == log.FlockId && l.Date.Date == logDate);

                if (isDuplicate)
                {
                    return BadRequest(new { message = $"या फ्लॉकसाठी {logDate:dd-MM-yyyy} तारखेची एन्ट्री आधीच केलेली आहे." });
                }

                var flock = await _context.Flocks.FindAsync(log.FlockId);
                if (flock == null) return NotFound(new { message = "Flock not found" });

                var feedItem = await _context.Inventory.FindAsync(log.FeedItemId);
                if (feedItem == null) return BadRequest(new { message = "निवडलेले Feed इन्व्हेंटरीमध्ये सापडले नाही." });

                if (feedItem.Quantity < log.FeedConsumedKg)
                {
                    return BadRequest(new { message = $"पुरेसा स्टॉक उपलब्ध नाही. शिल्लक: {feedItem.Quantity} Kg" });
                }

                // १. स्टॉक कमी करा आणि फ्लॉक मधील पक्षी संख्या अपडेट करा
                feedItem.Quantity -= log.FeedConsumedKg;
                flock.CurrentCount -= log.MortalityCount;

                // २. खाद्याचा आजचा खर्च (Current Purchase Price नुसार)
                log.FeedCost = log.FeedConsumedKg * feedItem.PurchasePrice;

                // ३. DYNAMIC BIRD COST CALCULATION LOGIC
                // अ. बॅचसाठी आतापर्यंत झालेला इतर खर्च (FinancialTransactions मधून)
                // टीप: FinancialTransaction मध्ये BatchId (FlockId) असणे आवश्यक आहे.
                var otherBatchExpenses = await _context.FinancialTransactions
                    .Where(t => t.BatchId == log.FlockId && t.TransactionDate <= log.Date)
                    .SumAsync(t => t.Amount);

                // ब. आतापर्यंतचा एकूण खाद्याचा खर्च (DailyLogs मधून)
                var totalFeedCostSoFar = await _context.DailyLogs
                    .Where(l => l.FlockId == log.FlockId && l.Date < log.Date)
                    .SumAsync(l => l.FeedCost);

                // क. सुरुवातीची पक्षी खरेदी किंमत
                decimal initialPurchaseInvestment = flock.InitialCount * flock.PerBirdPurchasePrice;

                // ड. एकूण गुंतवणूक = (पक्षी खरेदी + जुना फीड खर्च + आजचा फीड खर्च + इतर खर्च)
                decimal totalInvestment = initialPurchaseInvestment + totalFeedCostSoFar + log.FeedCost + otherBatchExpenses;

                // इ. एका पक्ष्याची आजची किंमत (Total Investment / Current Living Birds)
                if (flock.CurrentCount > 0)
                {
                    log.DailyBirdCost = totalInvestment / flock.CurrentCount;
                }
                else
                {
                    log.DailyBirdCost = 0; // जर पक्षी शिल्लक नसतील तर
                }

                // ४. अंडी स्टॉक अपडेट (नवीन लॉजिक)
                if (log.EggsCollected > 0) await UpdateEggStock("Good", log.EggsCollected);
                if (log.DamagedEggsCollected > 0) await UpdateEggStock("Damaged", log.DamagedEggsCollected);

                _context.DailyLogs.Add(log);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetDailyLog), new { id = log.Id }, log);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "डेटा सेव्ह करताना त्रुटी आली.", error = ex.Message });
            }
        }

        // अंडी स्टॉक अपडेट करण्यासाठी खाजगी मेथड
        private async Task UpdateEggStock(string type, int count)
        {
            var eggInv = await _context.EggInventories.FirstOrDefaultAsync(e => e.EggType == type);
            if (eggInv == null)
            {
                _context.EggInventories.Add(new EggInventory
                {
                    EggType = type,
                    CurrentStock = count,
                    LastUpdated = DateTime.Now
                });
            }
            else
            {
                eggInv.CurrentStock += count;
                eggInv.LastUpdated = DateTime.Now;
            }
        }

        // DELETE: api/DailyLogs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDailyLog(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var log = await _context.DailyLogs.FindAsync(id);
                if (log == null) return NotFound();

                var flock = await _context.Flocks.FindAsync(log.FlockId);
                var feedItem = await _context.Inventory.FindAsync(log.FeedItemId);

                // १. Stock Revert
                if (feedItem != null) feedItem.Quantity += log.FeedConsumedKg;
                if (flock != null) flock.CurrentCount += log.MortalityCount;

                // २. अंडी स्टॉक वजा करा
                if (log.EggsCollected > 0) await UpdateEggStock("Good", -log.EggsCollected);
                if (log.DamagedEggsCollected > 0) await UpdateEggStock("Damaged", -log.DamagedEggsCollected);

                _context.DailyLogs.Remove(log);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "एन्ट्री यशस्वीरित्या डिलीट केली आणि स्टॉक अपडेट केला." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "डिलीट करताना त्रुटी आली.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DailyLog>> GetDailyLog(int id)
        {
            var log = await _context.DailyLogs
                .Include(l => l.Flock)
                .Include(l => l.FeedItem)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (log == null) return NotFound();
            return log;
        }

        [HttpGet("Flock/{flockId}")]
        public async Task<ActionResult<IEnumerable<DailyLog>>> GetFlockLogs(int flockId)
        {
            return await _context.DailyLogs
                .Include(l => l.FeedItem)
                .Where(l => l.FlockId == flockId)
                .OrderByDescending(l => l.Date)
                .ToListAsync();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutDailyLog(int id, DailyLog log)
        {
            if (id != log.Id) return BadRequest();
            _context.Entry(log).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException) { if (!_context.DailyLogs.Any(e => e.Id == id)) return NotFound(); throw; }
            return NoContent();
        }
    }
}