using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PoultryERP.Api.Controllers
{
    [Authorize] // संपूर्ण कंट्रोलरसाठी ऑथोरायझेशन अनिवार्य केले आहे
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoriesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionCategory>>> GetCategories()
        {
            // फक्त ऍक्टिव्ह कॅटेगरी मिळवण्यासाठी फिल्टर वापरू शकता
            var categories = await _unitOfWork.TransactionCategories.GetAllAsync();
            return Ok(categories);
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionCategory>> GetCategory(int id)
        {
            var category = await _unitOfWork.TransactionCategories.GetByIdAsync(id);

            if (category == null)
            {
                return NotFound(new { message = "कॅटेगरी सापडली नाही." });
            }

            return Ok(category);
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<TransactionCategory>> PostCategory(TransactionCategory category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _unitOfWork.TransactionCategories.AddAsync(category);
            await _unitOfWork.CompleteAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, TransactionCategory category)
        {
            if (id != category.Id)
            {
                return BadRequest(new { message = "ID mismatch." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _unitOfWork.TransactionCategories.Update(category);
                await _unitOfWork.CompleteAsync();
            }
            catch (System.Exception)
            {
                if (!await CategoryExists(id))
                {
                    return NotFound(new { message = "कॅटेगरी अस्तित्वात नाही." });
                }
                throw;
            }

            return Ok(new { message = "कॅटेगरी अपडेट झाली." });
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _unitOfWork.TransactionCategories.GetByIdAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "कॅटेगरी सापडली नाही." });
            }

            _unitOfWork.TransactionCategories.Delete(category);
            await _unitOfWork.CompleteAsync();

            return Ok(new { message = "कॅटेगरी डिलीट करण्यात आली." });
        }

        private async Task<bool> CategoryExists(int id)
        {
            var category = await _unitOfWork.TransactionCategories.GetByIdAsync(id);
            return category != null;
        }

        // --- Helper: ऑथोराईज्ड युजरची माहिती मिळवण्यासाठी ---
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }
    }
}