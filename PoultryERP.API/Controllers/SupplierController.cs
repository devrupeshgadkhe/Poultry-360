using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SuppliersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Supplier>>> Get()
            => Ok(await _unitOfWork.Repository<Supplier>().GetAllAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> Get(int id)
        {
            var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(id);
            return supplier == null ? NotFound() : Ok(supplier);
        }

        [HttpPost]
        public async Task<ActionResult<Supplier>> Post(Supplier supplier)
        {
            await _unitOfWork.Repository<Supplier>().AddAsync(supplier);
            await _unitOfWork.CompleteAsync(); // [cite: 2026-03-12]
            return CreatedAtAction(nameof(Get), new { id = supplier.Id }, supplier);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Supplier supplier)
        {
            if (id != supplier.Id) return BadRequest();

            _unitOfWork.Repository<Supplier>().Update(supplier);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _unitOfWork.Repository<Supplier>().GetByIdAsync(id);
            if (existing == null) return NotFound();

            _unitOfWork.Repository<Supplier>().Delete(existing);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}