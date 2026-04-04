using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WarehousesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public WarehousesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Warehouse>>> Get()
        {
            var warehouses = await _unitOfWork.Repository<Warehouse>().GetAllAsync();
            return Ok(warehouses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Warehouse>> Get(int id)
        {
            var warehouse = await _unitOfWork.Repository<Warehouse>().GetByIdAsync(id);
            if (warehouse == null) return NotFound();
            return Ok(warehouse);
        }

        [HttpPost]
        public async Task<ActionResult<Warehouse>> Post(Warehouse warehouse)
        {
            await _unitOfWork.Repository<Warehouse>().AddAsync(warehouse);
            await _unitOfWork.CompleteAsync();
            return CreatedAtAction(nameof(Get), new { id = warehouse.Id }, warehouse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Warehouse warehouse)
        {
            if (id != warehouse.Id) return BadRequest();

            _unitOfWork.Repository<Warehouse>().Update(warehouse);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var warehouse = await _unitOfWork.Repository<Warehouse>().GetByIdAsync(id);
            if (warehouse == null) return NotFound();

            _unitOfWork.Repository<Warehouse>().Delete(warehouse);
            await _unitOfWork.CompleteAsync();
            return NoContent();
        }
    }
}