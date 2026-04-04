using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using PoultryERP.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FinancialTransactionsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly PoultryDbContext _context;

        public FinancialTransactionsController(IUnitOfWork unitOfWork, PoultryDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        // 1. GET ALL TRANSACTIONS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FinancialTransaction>>> GetAll()
        {
            try
            {
                var transactions = await _context.FinancialTransactions
                    .Include(t => t.Category)
                    .Include(t => t.Staff)
                    .Include(t => t.Batch)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "व्यवहार लोड करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 2. GET BY ID
        [HttpGet("{id}")]
        public async Task<ActionResult<FinancialTransaction>> GetById(int id)
        {
            var transaction = await _context.FinancialTransactions
                .Include(t => t.Category)
                .Include(t => t.Staff)
                .Include(t => t.Batch)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (transaction == null) return NotFound(new { Message = "व्यवहार सापडला नाही." });
            return Ok(transaction);
        }

        // 3. CREATE TRANSACTION
        [HttpPost]
        public async Task<ActionResult<FinancialTransaction>> Create([FromBody] FinancialTransaction transaction)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Description null चेक
                transaction.Description = string.IsNullOrWhiteSpace(transaction.Description)
                                           ? string.Empty
                                           : transaction.Description.Trim();

                // १. कॅटेगरीची पडताळणी
                var category = await _unitOfWork.TransactionCategories.GetByIdAsync(transaction.CategoryId);
                if (category == null) return BadRequest(new { Message = "निवडलेली कॅटेगरी अवैध आहे." });

                // २. स्टाफ पेमेंट व्हॅलिडेशन (Category Id 1 = Staff Payment)
                if (category.Id == 1 && !transaction.StaffId.HasValue)
                {
                    return BadRequest(new { Message = "स्टाफ पेमेंटसाठी कर्मचारी निवडणे अनिवार्य आहे." });
                }

                transaction.CreatedAt = DateTime.Now;

                await _unitOfWork.FinancialTransactions.AddAsync(transaction);
                await _unitOfWork.CompleteAsync();

                return CreatedAtAction(nameof(GetById), new { id = transaction.Id }, transaction);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "व्यवहार जतन करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 4. UPDATE TRANSACTION
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FinancialTransaction transaction)
        {
            if (id != transaction.Id) return BadRequest(new { Message = "ID विसंगती आढळली." });
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // १. ट्रान्झॅक्शन अस्तित्वात आहे का ते तपासणे
                var existingTransaction = await _context.FinancialTransactions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
                if (existingTransaction == null) return NotFound(new { Message = "अपडेट करण्यासाठी व्यवहार सापडला नाही." });

                // २. कॅटेगरी व्हॅलिडेशन
                var category = await _unitOfWork.TransactionCategories.GetByIdAsync(transaction.CategoryId);
                if (category == null) return BadRequest(new { Message = "निवडलेली कॅटेगरी अवैध आहे." });

                if (category.Id == 1 && !transaction.StaffId.HasValue)
                {
                    return BadRequest(new { Message = "स्टाफ पेमेंटसाठी कर्मचारी निवडणे अनिवार्य आहे." });
                }

                // ३. डेटा क्लीनिंग
                transaction.Description = string.IsNullOrWhiteSpace(transaction.Description)
                                           ? string.Empty
                                           : transaction.Description.Trim();

                // ४. DbContext चा वापर करून थेट अपडेट (Tracking issues टाळण्यासाठी)
                _context.Entry(transaction).State = EntityState.Modified;

                // CreatedAt बदलू नये म्हणून त्याला Unchanged ठेवणे
                _context.Entry(transaction).Property(x => x.CreatedAt).IsModified = false;

                await _context.SaveChangesAsync();
                return Ok(new { Message = "व्यवहार यशस्वीरीत्या अपडेट केला.", Data = transaction });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "व्यवहार अपडेट करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 5. GET STAFF LEDGER
        [HttpGet("staff/{staffId}")]
        public async Task<IActionResult> GetStaffLedger(int staffId)
        {
            var ledger = await _context.FinancialTransactions
                .Where(t => t.StaffId == staffId)
                .Include(t => t.Category)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            var totalPaid = ledger.Sum(t => t.Amount);

            return Ok(new
            {
                StaffId = staffId,
                TotalPaid = totalPaid,
                Transactions = ledger
            });
        }

        // 6. DELETE TRANSACTION
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var transaction = await _unitOfWork.FinancialTransactions.GetByIdAsync(id);
                if (transaction == null) return NotFound();

                _unitOfWork.FinancialTransactions.Delete(transaction);
                await _unitOfWork.CompleteAsync();

                return Ok(new { Message = "व्यवहार यशस्वीरीत्या डिलीट केला." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "डिलीट करताना त्रुटी आली.", Error = ex.Message });
            }
        }
    }
}