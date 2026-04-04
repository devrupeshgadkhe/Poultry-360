using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FlocksController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public FlocksController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Flocks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Flock>>> GetFlocks()
        {
            try
            {
                var flocks = await _unitOfWork.Flocks.GetAllAsync();
                return Ok(flocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Flocks fetch करताना त्रुटी आली.", error = ex.Message });
            }
        }

        // GET: api/Flocks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Flock>> GetFlock(int id)
        {
            var flock = await _unitOfWork.Flocks.GetByIdAsync(id);
            if (flock == null) return NotFound(new { message = "दिलेला Flock सापडला नाही." });
            return Ok(flock);
        }

        // POST: api/Flocks
        [HttpPost]
        public async Task<ActionResult<Flock>> CreateFlock(Flock flock)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                // नवीन पिल्ले आल्यावर InitialCount आणि CurrentCount सारखेच हवेत
                if (flock.CurrentCount == 0) flock.CurrentCount = flock.InitialCount;

                await _unitOfWork.Flocks.AddAsync(flock);
                await _unitOfWork.CompleteAsync(); // डेटाबेसमध्ये सेव्ह करण्यासाठी अनिवार्य

                return CreatedAtAction(nameof(GetFlock), new { id = flock.Id }, flock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Flock तयार करताना त्रुटी आली.", error = ex.Message });
            }
        }

        // PUT: api/Flocks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFlock(int id, Flock flock)
        {
            if (id != flock.Id) return BadRequest(new { message = "ID mismatch" });

            try
            {
                _unitOfWork.Flocks.Update(flock);
                await _unitOfWork.CompleteAsync(); // डेटाबेसमध्ये बदल सेव्ह करण्यासाठी
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Flock अपडेट करताना त्रुटी आली.", error = ex.Message });
            }
        }

        // DELETE: api/Flocks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFlock(int id)
        {
            try
            {
                var flock = await _unitOfWork.Flocks.GetByIdAsync(id);
                if (flock == null) return NotFound();

                _unitOfWork.Flocks.Delete(flock);
                await _unitOfWork.CompleteAsync(); // बदल पर्मनंट करण्यासाठी

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Flock डिलीट करताना त्रुटी आली.", error = ex.Message });
            }
        }

        // GET: api/Flocks/Active
        [HttpGet("Active")]
        public async Task<ActionResult<IEnumerable<Flock>>> GetActiveFlocks()
        {
            var allFlocks = await _unitOfWork.Flocks.GetAllAsync();
            var activeFlocks = allFlocks.Where(f => f.IsActive).ToList();
            return Ok(activeFlocks);
        }
    }
}