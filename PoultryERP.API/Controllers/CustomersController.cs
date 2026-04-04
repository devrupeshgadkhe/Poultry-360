using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // फक्त अधिकृत युजर्सना प्रवेश मिळेल
    public class CustomersController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public CustomersController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // 1. सर्व कस्टमर्सची यादी मिळवण्यासाठी
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            var customers = await _unitOfWork.Customers.GetAllAsync();
            return Ok(customers.OrderByDescending(c => c.CreatedAt));
        }

        // 2. एका विशिष्ट कस्टमरची माहिती मिळवण्यासाठी
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(id);

            if (customer == null)
            {
                return NotFound(new { Message = "Customer सापडला नाही." });
            }

            return Ok(customer);
        }

        // 3. नवीन कस्टमर रजिस्टर करण्यासाठी
        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // नवीन कस्टमर तयार करताना CurrentBalance सुरुवातीला OpeningBalance इतकाच असेल
                customer.CurrentBalance = customer.OpeningCreditBalance;
                customer.CreatedAt = DateTime.Now;

                await _unitOfWork.Customers.AddAsync(customer);
                await _unitOfWork.CompleteAsync();

                return CreatedAtAction("GetCustomer", new { id = customer.Id }, customer);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Customer सेव्ह करताना एरर आली: " + ex.Message });
            }
        }

        // 4. कस्टमरची माहिती अपडेट करण्यासाठी
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCustomer(int id, Customer customer)
        {
            if (id != customer.Id)
            {
                return BadRequest(new { Message = "ID mismatch." });
            }

            var existingCustomer = await _unitOfWork.Customers.GetByIdAsync(id);
            if (existingCustomer == null)
            {
                return NotFound(new { Message = "Customer सापडला नाही." });
            }

            try
            {
                // शेती व्यवसायातील हिशोबानुसार Opening Balance बदलला तर Current Balance मध्ये फरक पडू शकतो 
                // म्हणून फक्त आवश्यक फील्ड्स अपडेट करत आहोत.
                existingCustomer.Name = customer.Name;
                existingCustomer.Phone = customer.Phone;
                existingCustomer.Email = customer.Email;
                existingCustomer.Address = customer.Address;
                existingCustomer.IsActive = customer.IsActive;

                _unitOfWork.Customers.Update(existingCustomer);
                await _unitOfWork.CompleteAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // 5. कस्टमर डिलीट करण्यासाठी (किंवा इन-ऍक्टिव्ह करण्यासाठी)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _unitOfWork.Customers.GetByIdAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            try
            {
                // जर कस्टमरचे जुने व्यवहार (Sales) असतील तर सरळ डिलीट करण्याऐवजी IsActive = false करणे चांगले
                _unitOfWork.Customers.Delete(customer);
                await _unitOfWork.CompleteAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "हा कस्टमर डिलीट करता येत नाही कारण त्याचे सेल्स रेकॉर्ड्स असू शकतात. त्याऐवजी त्याला Deactivate करा." });
            }
        }
    }
}