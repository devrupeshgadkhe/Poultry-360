using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Persistence.Context;
using PoultryERP.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly PoultryDbContext _context;

        public InventoryController(PoultryDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryItem>>> Get()
        {
            return await _context.Inventory
                .Include(i => i.Warehouse)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryItem>> Get(int id)
        {
            var item = await _context.Inventory.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<InventoryItem>> Post(InventoryItem item)
        {
            item.LastUpdated = DateTime.Now;
            _context.Inventory.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, InventoryItem item)
        {
            if (id != item.Id) return BadRequest("ID mismatch");

            item.LastUpdated = DateTime.Now;
            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventoryItemExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.Inventory.FindAsync(id);
            if (item == null) return NotFound();

            _context.Inventory.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool InventoryItemExists(int id)
        {
            return _context.Inventory.Any(e => e.Id == id);
        }
    }
}