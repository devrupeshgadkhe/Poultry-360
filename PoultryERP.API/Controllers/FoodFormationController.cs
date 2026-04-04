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
    [Authorize] // 🔐 JWT Authentication साठी अनिवार्य
    [ApiController]
    [Route("api/[controller]")]
    public class FoodFormationController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly PoultryDbContext _context; // थेट DbContext वापरण्यासाठी

        public FoodFormationController(IUnitOfWork unitOfWork, PoultryDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        // १. सर्व फॉर्मेशन्स मिळवणे (सहजपणे InventoryItem सह)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodFormation>>> GetFormations()
        {
            try
            {
                // थेट कॉन्टेक्स्ट वापरून रिलेशनमधील डेटा (InventoryItem) लोड करणे सोपे जाते
                var formations = await _context.FoodFormations
                    .Include(f => f.FormationItems)
                        .ThenInclude(i => i.InventoryItem)
                    .AsNoTracking() // रेंडरिंग स्पीड वाढवण्यासाठी
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();

                return Ok(formations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving formations", details = ex.Message });
            }
        }

        // २. ID नुसार विशिष्ट फॉर्मेशन मिळवणे
        [HttpGet("{id}")]
        public async Task<ActionResult<FoodFormation>> GetFormation(int id)
        {
            try
            {
                var formation = await _context.FoodFormations
                    .Include(f => f.FormationItems)
                        .ThenInclude(i => i.InventoryItem)
                    .FirstOrDefaultAsync(f => f.Id == id);

                if (formation == null) return NotFound(new { message = "Formation not found" });

                return Ok(formation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error", details = ex.InnerException?.Message ?? ex.Message });
            }
        }

        // ३. नवीन फॉर्मेशन तयार करणे
        [HttpPost]
        public async Task<ActionResult<FoodFormation>> CreateFormation([FromBody] FoodFormation formation)
        {
            if (formation == null) return BadRequest(new { message = "Data is null" });

            try
            {
                // ट्रान्झॅक्शन सुरू करणे जेणेकरून मास्टर आणि डिटेल्स दोन्ही सेव्ह होतील
                await _unitOfWork.BeginTransactionAsync();

                formation.Id = 0; // नवीन रेकॉर्ड सुनिश्चित करण्यासाठी
                formation.CreatedAt = DateTime.Now;

                if (formation.FormationItems != null)
                {
                    foreach (var item in formation.FormationItems)
                    {
                        item.Id = 0;
                    }
                }

                await _context.FoodFormations.AddAsync(formation);
                await _context.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();

                return CreatedAtAction(nameof(GetFormation), new { id = formation.Id }, formation);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return StatusCode(500, new { message = "Failed to create", details = ex.Message });
            }
        }

        // ४. फॉर्मेशन अपडेट करणे (आधीचे आयटम्स डिलीट करून नवीन टाकणे - 'Wipe and Replace' पद्धत)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFormation(int id, [FromBody] FoodFormation formation)
        {
            if (id != formation.Id) return BadRequest(new { message = "ID mismatch" });

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // डेटाबेस मधून आयटम्ससह जुना डेटा लोड करा
                var existing = await _context.FoodFormations
                    .Include(f => f.FormationItems)
                    .FirstOrDefaultAsync(f => f.Id == id);

                if (existing == null) return NotFound(new { message = "Recipe not found" });

                // मुख्य माहिती अपडेट करा
                existing.Name = formation.Name;
                existing.TargetQuantity = formation.TargetQuantity;
                existing.Unit = formation.Unit;
                existing.Description = formation.Description;
                existing.IsActive = formation.IsActive;

                // १. जुने सर्व FormationItems काढून टाका
                if (existing.FormationItems != null && existing.FormationItems.Any())
                {
                    _context.FoodFormationItems.RemoveRange(existing.FormationItems);
                }

                // २. नवीन पाठवलेले आयटम्स जोडा
                if (formation.FormationItems != null)
                {
                    foreach (var newItem in formation.FormationItems)
                    {
                        existing.FormationItems.Add(new FoodFormationItem
                        {
                            Id = 0,
                            FoodFormationId = id,
                            InventoryItemId = newItem.InventoryItemId,
                            Percentage = newItem.Percentage
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await _unitOfWork.CommitTransactionAsync();

                return Ok(new { message = "Food Formation updated successfully" });
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return StatusCode(500, new { message = "Update failed", details = ex.InnerException?.Message ?? ex.Message });
            }
        }

        // ५. फॉर्मेशन डिलीट करणे
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormation(int id)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var formation = await _context.FoodFormations
                    .Include(f => f.FormationItems)
                    .FirstOrDefaultAsync(f => f.Id == id);

                if (formation == null) return NotFound(new { message = "Formation not found" });

                _context.FoodFormations.Remove(formation);
                await _context.SaveChangesAsync();

                await _unitOfWork.CommitTransactionAsync();
                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return StatusCode(500, new { message = "Delete failed", details = ex.Message });
            }
        }
    }
}