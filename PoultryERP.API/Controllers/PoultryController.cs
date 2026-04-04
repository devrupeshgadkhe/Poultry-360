using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Application.Services;
using PoultryERP.Domain.Entities;
using System.Threading.Tasks;
using System;

namespace PoultryERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PoultryController : ControllerBase
    {
        private readonly PoultryService _poultryService;

        public PoultryController(PoultryService poultryService)
        {
            _poultryService = poultryService;
        }

        [HttpGet("active-flocks")]
        public async Task<IActionResult> GetActiveFlocks()
        {
            try
            {
                var flocks = await _poultryService.GetActiveFlocksAsync();
                return Ok(flocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error: " + ex.Message });
            }
        }

        [HttpPost("production")]
        public async Task<IActionResult> LogProduction([FromBody] EggProduction production)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _poultryService.LogProductionAsync(production);
            return Ok(new { message = "Production logged" });
        }

        [HttpPost("mortality")]
        public async Task<IActionResult> LogMortality([FromBody] DailyLog mortalityLog)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            // Calling updated service method
            await _poultryService.LogDailyActivityAsync(mortalityLog);
            return Ok(new { message = "Mortality logged" });
        }
    }
}