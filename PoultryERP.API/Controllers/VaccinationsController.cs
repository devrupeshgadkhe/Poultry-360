using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VaccinationsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public VaccinationsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("flock/{flockId}")]
        public async Task<ActionResult<IEnumerable<Vaccination>>> GetByFlock(int flockId)
        {
            var vaccinations = await _unitOfWork.Vaccinations.GetByFlockIdAsync(flockId);
            return Ok(vaccinations);
        }

        [HttpPost]
        public async Task<ActionResult<Vaccination>> Create(Vaccination vaccination)
        {
            await _unitOfWork.Vaccinations.AddAsync(vaccination);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(GetByFlock), new { flockId = vaccination.FlockId }, vaccination);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Vaccination vaccination)
        {
            if (id != vaccination.Id) return BadRequest();

            _unitOfWork.Vaccinations.Update(vaccination);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var vaccination = await _unitOfWork.Vaccinations.GetByIdAsync(id);
            if (vaccination == null) return NotFound();

            _unitOfWork.Vaccinations.Delete(vaccination);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}