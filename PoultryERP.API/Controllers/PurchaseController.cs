using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PurchaseController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Purchase>>> GetAll()
        {
            try
            {
                var purchases = await _unitOfWork.Repository<Purchase>().GetAllAsync(
                    includeProperties: "Supplier,PurchaseItems"
                );
                return Ok(purchases);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving purchases", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Purchase>> GetById(int id)
        {
            var purchase = await _unitOfWork.Repository<Purchase>().GetByIdAsync(
                id,
                includeProperties: "Supplier,PurchaseItems"
            );

            if (purchase == null) return NotFound(new { message = "Purchase record not found" });
            return Ok(purchase);
        }

        [HttpPost]
        public async Task<ActionResult<Purchase>> Create(Purchase purchase)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // १. मुख्य खरेदी रेकॉर्ड ऍड करा (इथे ID 0 असावा)
                await _unitOfWork.Repository<Purchase>().AddAsync(purchase);

                // २. स्टॉक वाढवा
                foreach (var item in purchase.PurchaseItems)
                {
                    await _unitOfWork.Inventory.UpdateStockAsync(item.ItemId, item.Quantity, isAddition: true);
                }

                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return CreatedAtAction(nameof(GetById), new { id = purchase.PurchaseId }, purchase);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return StatusCode(500, new { message = "Failed to create purchase", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Purchase purchase)
        {
            if (id != purchase.PurchaseId) return BadRequest(new { message = "ID mismatch" });

            try
            {
                await _unitOfWork.BeginTransactionAsync();

                // १. डेटाबेस मधून जुना डेटा "With Tracking" मिळवा (Include Items सह)
                var existingPurchase = await _unitOfWork.Repository<Purchase>().GetByIdAsync(id, "PurchaseItems");
                if (existingPurchase == null) return NotFound();

                // २. जुना स्टॉक रिव्हर्स करा (वजा करा)
                foreach (var oldItem in existingPurchase.PurchaseItems)
                {
                    await _unitOfWork.Inventory.UpdateStockAsync(oldItem.ItemId, oldItem.Quantity, isAddition: false);
                }

                // ३. 'Existing' रेकॉर्डच्या व्हॅल्यूज अपडेट करा (हा Identity Insert Error टाळतो)
                existingPurchase.SupplierId = purchase.SupplierId;
                existingPurchase.PurchaseNumber = purchase.PurchaseNumber;
                existingPurchase.SupplierInvoiceNumber = purchase.SupplierInvoiceNumber;
                existingPurchase.PurchaseDate = purchase.PurchaseDate;
                existingPurchase.PaymentMode = purchase.PaymentMode;
                existingPurchase.Notes = purchase.Notes;
                existingPurchase.TotalAmount = purchase.TotalAmount;

                // ४. जुन्या आयटम्सना मॅनेज करा (सोपा मार्ग: आधीचे आयटम्स काढून नवीन टाकणे)
                existingPurchase.PurchaseItems.Clear();
                foreach (var newItem in purchase.PurchaseItems)
                {
                    existingPurchase.PurchaseItems.Add(new PurchaseItem
                    {
                        ItemId = newItem.ItemId,
                        Quantity = newItem.Quantity,
                        PurchaseRate = newItem.PurchaseRate,
                        ReturnedQuantity = newItem.ReturnedQuantity
                    });

                    // ५. नवीन स्टॉक ऍड करा
                    await _unitOfWork.Inventory.UpdateStockAsync(newItem.ItemId, newItem.Quantity, isAddition: true);
                }

                // ६. फक्त 'existingPurchase' अपडेट करा
                _unitOfWork.Repository<Purchase>().Update(existingPurchase);

                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return Ok(new { message = "Purchase updated successfully" });
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return StatusCode(500, new { message = "Update failed", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _unitOfWork.BeginTransactionAsync();

                var existing = await _unitOfWork.Repository<Purchase>().GetByIdAsync(id, "PurchaseItems");
                if (existing == null) return NotFound();

                // स्टॉक रिव्हर्स करा
                foreach (var item in existing.PurchaseItems)
                {
                    await _unitOfWork.Inventory.UpdateStockAsync(item.ItemId, item.Quantity, isAddition: false);
                }

                _unitOfWork.Repository<Purchase>().Delete(existing);
                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return StatusCode(500, new { message = "Error deleting purchase", details = ex.Message });
            }
        }
    }
}