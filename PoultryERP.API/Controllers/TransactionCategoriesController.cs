using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionCategoriesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransactionCategoriesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // 1. GET ALL CATEGORIES: api/TransactionCategories
        // ड्रॉपडाऊनसाठी सर्व ॲक्टिव्ह कॅटेगरीज मिळवण्यासाठी
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransactionCategory>>> GetAll()
        {
            try
            {
                var categories = await _unitOfWork.TransactionCategories.GetAllAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Categories लोड करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 2. GET BY ID: api/TransactionCategories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionCategory>> GetById(int id)
        {
            var category = await _unitOfWork.TransactionCategories.GetByIdAsync(id);
            if (category == null) return NotFound(new { Message = "कॅटेगरी सापडली नाही." });
            return Ok(category);
        }

        // 3. CREATE CATEGORY: api/TransactionCategories
        [HttpPost]
        public async Task<ActionResult<TransactionCategory>> Create([FromBody] TransactionCategory category)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await _unitOfWork.TransactionCategories.AddAsync(category);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "कॅटेगरी जतन करता आली नाही.", Error = ex.Message });
            }
        }

        // 4. UPDATE CATEGORY: api/TransactionCategories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TransactionCategory category)
        {
            if (id != category.Id) return BadRequest(new { Message = "ID मॅच होत नाही." });

            try
            {
                _unitOfWork.TransactionCategories.Update(category);
                await _unitOfWork.CompleteAsync();
                return Ok(new { Message = "कॅटेगरी अपडेट झाली.", Data = category });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "अपडेट करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 5. DELETE/DEACTIVATE: api/TransactionCategories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var category = await _unitOfWork.TransactionCategories.GetByIdAsync(id);
                if (category == null) return NotFound();

                // जर ही सीड डेटा (1-6) मधील कॅटेगरी असेल तर ती डिलीट होऊ नये असा नियम लावू शकता
                if (id <= 6)
                {
                    return BadRequest(new { Message = "सिस्टमच्या डीफॉल्ट कॅटेगरीज डिलीट करता येत नाहीत. तुम्ही त्यांना 'IsActive = false' करू शकता." });
                }

                _unitOfWork.TransactionCategories.Delete(category);
                await _unitOfWork.CompleteAsync();
                return Ok(new { Message = "कॅटेगरी यशस्वीरीत्या डिलीट केली." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "ही कॅटेगरी ट्रान्झॅक्शन्समध्ये वापरली गेली असल्याने डिलीट करता येणार नाही.", Error = ex.Message });
            }
        }
    }
}