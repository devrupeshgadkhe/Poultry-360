using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using PoultryERP.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FeedPrecisionController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly PoultryDbContext _context;

        // IUnitOfWork आणि DbContext दोन्ही इंजेक्शनद्वारे घेतले आहेत
        public FeedPrecisionController(IUnitOfWork unitOfWork, PoultryDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        /// <summary>
        /// सर्व Food Formations (Recipes) मिळवण्यासाठी
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodFormation>>> GetAll()
        {
            try
            {
                var formations = await _unitOfWork.FoodFormations.GetAllAsync(includeProperties: "FormationItems.InventoryItem");
                return Ok(formations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving formations", error = ex.Message });
            }
        }

        /// <summary>
        /// थेट DbContext वापरून विशिष्ट ID नुसार Food Formation चे डिटेल्स मिळवण्यासाठी
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<FoodFormation>> GetById(int id)
        {
            try
            {
                // थेट DbContext वापरून FormationItems आणि InventoryItem इंक्लूड केले आहे
                var formation = await _context.FoodFormations
                    .Include(f => f.FormationItems)
                        .ThenInclude(fi => fi.InventoryItem)
                    .FirstOrDefaultAsync(f => f.Id == id);

                if (formation == null)
                    return NotFound(new { message = "Formation not found" });

                return Ok(formation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving formation details", error = ex.Message });
            }
        }

        /// <summary>
        /// प्रत्येक घटकाची सरासरी खरेदी किंमत मिळवण्यासाठी (Live Costing)
        /// </summary>
        [HttpGet("average-price/{inventoryItemId}")]
        public async Task<ActionResult<decimal>> GetAveragePrice(int inventoryItemId)
        {
            try
            {
                var price = await _unitOfWork.FoodFormations.GetAveragePriceAsync(inventoryItemId);
                return Ok(price);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching price", error = ex.Message });
            }
        }

        /// <summary>
        /// 'FeedPrecision' मधील प्रोडक्शन प्रोसेस रन करण्यासाठी
        /// </summary>
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] ProductionRequest request)
        {
            if (request == null || request.Formation == null)
                return BadRequest("Invalid request data.");

            try
            {
                await _unitOfWork.FoodFormations.ProduceAsync(request.Formation, request.SalesPrice, request.IsSaveAsNew);
                await _unitOfWork.CompleteAsync();

                return Ok(new { message = "Production completed and inventory updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during production swap.", error = ex.Message });
            }
        }
    }

    public class ProductionRequest
    {
        public FoodFormation Formation { get; set; } = new FoodFormation();
        public decimal SalesPrice { get; set; }
        public bool IsSaveAsNew { get; set; }
    }
}