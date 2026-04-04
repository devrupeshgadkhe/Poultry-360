using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Application.Services;
using PoultryERP.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Ensures JWT-based authentication is enforced [cite: 2026-03-12]
    public class DashboardController : ControllerBase
    {
        private readonly PoultryService _poultryService;

        public DashboardController(PoultryService poultryService)
        {
            _poultryService = poultryService;
        }

        // GET: api/Dashboard
        [HttpGet]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                // Retrieve data from service
                var data = await _poultryService.GetDashboardDataAsync();

                if (data == null)
                {
                    return Ok(new { totalBirds = 0, activeFlocks = 0, totalRevenue = 0m });
                }

                // Reflection (GetPropertyValue) वापरण्याऐवजी थेट कास्टिंग किंवा डायनॅमिक हाताळणी.
                // टीप: PoultryService मधून येणाऱ्या 'data' च्या प्रॉब्लेम्सना नलेबल चेकने फिक्स केले आहे.
                var result = new
                {
                    totalBirds = GetSafeValue(data, "ActiveBirds"),
                    activeFlocks = GetSafeValue(data, "TotalFlocks"),
                    totalRevenue = GetSafeValue(data, "TotalRevenue")
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Returns 500 error with details if calculation fails
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }
        }

        /// <summary>
        /// रिफ्लेक्शनमधील नलेबल वॉर्निंग्स फिक्स करण्यासाठी मदतनीस पद्धत. [cite: 2026-03-12]
        /// </summary>
        private object GetSafeValue(object obj, string propertyName)
        {
            if (obj == null) return 0;
            var prop = obj.GetType().GetProperty(propertyName);
            return prop?.GetValue(obj, null) ?? 0;
        }

        // POST: api/Dashboard/production
        [HttpPost("production")]
        public async Task<IActionResult> LogProduction([FromBody] EggProduction production)
        {
            if (production == null) return BadRequest(new { message = "Production data is required" });
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _poultryService.LogProductionAsync(production);
            return Ok(new { message = "Production logged successfully" });
        }

        // POST: api/Dashboard/sale
        [HttpPost("sale")]
        public async Task<IActionResult> RecordSale([FromBody] Sale sale)
        {
            if (sale == null) return BadRequest(new { message = "Sale data is required" });
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _poultryService.RecordSaleAsync(sale);
            return Ok(new { message = "Sale recorded successfully" });
        }
    }
}