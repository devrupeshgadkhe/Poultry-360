using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EggInventoryController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public EggInventoryController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/EggInventory
        // सर्व Egg Inventory रेकॉर्ड्स मिळवा
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EggInventory>>> GetAllEggInventory()
        {
            try
            {
                var eggInventories = await _unitOfWork.EggInventories.GetAllAsync();

                if (!eggInventories.Any())
                {
                    return Ok(new List<EggInventory>());
                }

                return Ok(eggInventories.OrderByDescending(e => e.LastUpdated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Egg Inventory fetch करताना एरर आली.", Error = ex.Message });
            }
        }

        // GET: api/EggInventory/5
        // एका विशिष्ट Egg Inventory रेकॉर्ड मिळवा
        [HttpGet("{id}")]
        public async Task<ActionResult<EggInventory>> GetEggInventory(int id)
        {
            try
            {
                var eggInventory = await _unitOfWork.EggInventories.GetByIdAsync(id);

                if (eggInventory == null)
                {
                    return NotFound(new { Message = "Egg Inventory सापडली नाही." });
                }

                return Ok(eggInventory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Egg Inventory fetch करताना एरर आली.", Error = ex.Message });
            }
        }

        // POST: api/EggInventory
        // नवीन Egg Inventory रेकॉर्ड तयार करा
        [HttpPost]
        public async Task<ActionResult<EggInventory>> CreateEggInventory(EggInventory eggInventory)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(eggInventory.EggType))
                {
                    eggInventory.EggType = "Good"; // Default value
                }

                eggInventory.LastUpdated = DateTime.Now;

                await _unitOfWork.EggInventories.AddAsync(eggInventory);
                await _unitOfWork.CompleteAsync();

                return CreatedAtAction("GetEggInventory", new { id = eggInventory.Id }, eggInventory);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Egg Inventory तयार करताना एरर आली.", Error = ex.Message });
            }
        }

        // PUT: api/EggInventory/5
        // Egg Inventory अपडेट करा
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEggInventory(int id, EggInventory eggInventory)
        {
            try
            {
                if (id != eggInventory.Id)
                {
                    return BadRequest(new { Message = "ID mismatch: URL ID आणि body ID सारख्या नाहीत." });
                }

                var existingEggInventory = await _unitOfWork.EggInventories.GetByIdAsync(id);

                if (existingEggInventory == null)
                {
                    return NotFound(new { Message = $"ID {id} साठी Egg Inventory सापडली नाही." });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // अपडेट करायचे फील्ड्स
                existingEggInventory.EggType = eggInventory.EggType ?? existingEggInventory.EggType;
                existingEggInventory.CurrentStock = eggInventory.CurrentStock;
                existingEggInventory.LastUpdated = DateTime.Now;

                _unitOfWork.EggInventories.Update(existingEggInventory);
                await _unitOfWork.CompleteAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Egg Inventory अपडेट कर��ाना एरर आली.", Error = ex.Message });
            }
        }

        // DELETE: api/EggInventory/5
        // Egg Inventory डिलीट करा
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEggInventory(int id)
        {
            try
            {
                var eggInventory = await _unitOfWork.EggInventories.GetByIdAsync(id);

                if (eggInventory == null)
                {
                    return NotFound(new { Message = $"ID {id} साठी Egg Inventory सापडली नाही." });
                }

                _unitOfWork.EggInventories.Delete(eggInventory);
                await _unitOfWork.CompleteAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Egg Inventory डिलीट करताना एरर आली.", Error = ex.Message });
            }
        }

        // PATCH: api/EggInventory/5/adjust-stock
        // Stock adjust करा (add/subtract)
        [HttpPatch("{id}/adjust-stock")]
        public async Task<IActionResult> AdjustStock(int id, [FromBody] StockAdjustmentRequest request)
        {
            try
            {
                if (request == null || request.Quantity == 0)
                {
                    return BadRequest(new { Message = "Quantity 0 पेक्षा वेगळी असणे आवश्यक आहे." });
                }

                var eggInventory = await _unitOfWork.EggInventories.GetByIdAsync(id);

                if (eggInventory == null)
                {
                    return NotFound(new { Message = $"ID {id} साठी Egg Inventory सापडली नाही." });
                }

                // Stock adjust करा
                int previousStock = eggInventory.CurrentStock;
                eggInventory.CurrentStock += (int)request.Quantity;

                // Negative stock check
                if (eggInventory.CurrentStock < 0)
                {
                    return BadRequest(new { Message = $"Stock negative होऊ शकत नाही. उपलब्ध stock: {previousStock}" });
                }

                eggInventory.LastUpdated = DateTime.Now;
                _unitOfWork.EggInventories.Update(eggInventory);
                await _unitOfWork.CompleteAsync();

                return Ok(new { Message = "Stock adjust केला गेला.", PreviousStock = previousStock, NewStock = eggInventory.CurrentStock });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Stock adjust करताना एरर आली.", Error = ex.Message });
            }
        }

        // GET: api/EggInventory/by-type/Good
        // EggType द्वारे filter करा
        [HttpGet("by-type/{eggType}")]
        public async Task<ActionResult<IEnumerable<EggInventory>>> GetByEggType(string eggType)
        {
            try
            {
                var allEggInventories = await _unitOfWork.EggInventories.GetAllAsync();
                var filtered = allEggInventories
                    .Where(e => e.EggType.Equals(eggType, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (!filtered.Any())
                {
                    return Ok(new List<EggInventory>());
                }

                return Ok(filtered);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Egg Inventory filter करताना एरर आली.", Error = ex.Message });
            }
        }
    }

    // Request model for stock adjustment
    public class StockAdjustmentRequest
    {
        public decimal Quantity { get; set; }
        public string? Reason { get; set; }
    }
}