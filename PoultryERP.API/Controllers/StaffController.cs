using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using PoultryERP.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.API.Controllers
{
    [Authorize] // सर्व एंडपॉइंट्ससाठी JWT टोकन अनिवार्य आहे
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly PoultryDbContext _context;

        public StaffController(IUnitOfWork unitOfWork, PoultryDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        // 1. GET ALL STAFF: api/staff
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Staff>>> GetAll()
        {
            try
            {
                var staffList = await _unitOfWork.Staffs.GetAllAsync();
                return Ok(staffList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Staff मिळवताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 2. GET BY ID: api/staff/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Staff>> GetById(int id)
        {
            var staff = await _unitOfWork.Staffs.GetByIdAsync(id);
            if (staff == null)
            {
                return NotFound(new { Message = $"आयडी {id} असलेला स्टाफ सापडला नाही." });
            }
            return Ok(staff);
        }

        // 3. GET STAFF SUMMARY: api/staff/{id}/summary
        // मजुराचा पूर्ण हिशोब (Summary) मिळवण्यासाठी
        [HttpGet("{id}/summary")]
        public async Task<IActionResult> GetStaffSummary(int id)
        {
            try
            {
                var staff = await _unitOfWork.Staffs.GetByIdAsync(id);
                if (staff == null) return NotFound(new { Message = "स्टाफ सापडला नाही." });

                // DbContext वापरून जटिल गणना करणे
                var transactions = await _context.FinancialTransactions
                    .Where(t => t.StaffId == id)
                    .Include(t => t.Category)
                    .OrderByDescending(t => t.TransactionDate)
                    .ToListAsync();

                // एकूण दिलेली रक्कम (पगार + ॲडव्हान्स)
                var totalPaid = transactions.Sum(t => t.Amount);

                // शेवटचे ५ व्यवहार
                var recentLogs = transactions.Take(5).Select(t => new {
                    t.TransactionDate,
                    t.Amount,
                    Category = t.Category?.Name,
                    t.Description,
                    t.Mode
                });

                return Ok(new
                {
                    StaffInfo = new
                    {
                        staff.Name,
                        staff.Designation,
                        staff.MonthlySalary,
                        staff.DailyWages,
                        staff.JoiningDate,
                        staff.IsActive
                    },
                    FinancialSummary = new
                    {
                        TotalTransactions = transactions.Count,
                        TotalAmountPaid = totalPaid,
                        RecentHistory = recentLogs
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Summary लोड करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 4. CREATE STAFF: api/staff
        [HttpPost]
        public async Task<ActionResult<Staff>> Create([FromBody] Staff staff)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await _unitOfWork.Staffs.AddAsync(staff);
                await _unitOfWork.CompleteAsync();
                return CreatedAtAction(nameof(GetById), new { id = staff.Id }, staff);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "स्टाफ सेव्ह करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 5. UPDATE STAFF: api/staff/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Staff staff)
        {
            if (id != staff.Id) return BadRequest(new { Message = "ID मॅच होत नाही." });

            try
            {
                var exists = await _unitOfWork.Staffs.ExistsAsync(id);
                if (!exists) return NotFound(new { Message = "स्टाफ सापडला नाही." });

                await _unitOfWork.Staffs.UpdateAsync(staff);
                await _unitOfWork.CompleteAsync();

                return Ok(new { Message = "स्टाफ माहिती यशस्वीरीत्या अपडेट झाली.", Data = staff });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "अपडेट करताना त्रुटी आली.", Error = ex.Message });
            }
        }

        // 6. DELETE STAFF: api/staff/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var staff = await _unitOfWork.Staffs.GetByIdAsync(id);
                if (staff == null) return NotFound();

                // जर स्टाफचे ट्रान्झॅक्शन्स असतील तर डिलीट करण्याऐवजी डी-ॲक्टिव्हेट करणे चांगले
                var hasTransactions = await _context.FinancialTransactions.AnyAsync(t => t.StaffId == id);
                if (hasTransactions)
                {
                    return BadRequest(new { Message = "या स्टाफचे आर्थिक व्यवहार रेकॉर्डमध्ये असल्याने डिलीट करता येणार नाही. त्याऐवजी तुम्ही त्यांना 'Inactive' करू शकता." });
                }

                _unitOfWork.Staffs.Delete(staff);
                await _unitOfWork.CompleteAsync();

                return Ok(new { Message = "स्टाफ यशस्वीरीत्या काढून टाकला." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "स्टाफ डिलीट करताना त्रुटी आली.", Error = ex.Message });
            }
        }
    }
}