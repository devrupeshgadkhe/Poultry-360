using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace PoultryERP.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalesController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SalesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Sale>>> GetSales()
        {
            var sales = await _unitOfWork.Sales.GetAllAsync(includeProperties: "Customer,SaleItems");
            return Ok(sales.OrderByDescending(s => s.Date));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> GetSale(int id)
        {
            var sale = await _unitOfWork.Sales.GetSaleWithItemsAsync(id);
            if (sale == null) return NotFound(new { Message = "Sale record sapadla nahi." });
            return Ok(sale);
        }

        [HttpPost]
        public async Task<ActionResult<Sale>> PostSale(Sale sale)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // १. Sale ची मूळ माहिती तयार करा
                sale.Date = sale.Date == default ? DateTime.Now : sale.Date;
                var itemsToProcess = sale.SaleItems.ToList(); // Items बॅकअप घ्या
                sale.SaleItems = new List<SaleItem>(); // तात्पुरते रिकामे करा जेणेकरून Sale आधी सेव्ह होईल

                await _unitOfWork.Repository<Sale>().AddAsync(sale);
                await _unitOfWork.CompleteAsync(); // इथे Sale ID जनरेट होतो

                decimal calculatedSubTotal = 0;

                foreach (var item in itemsToProcess)
                {
                    item.Id = 0; // <--- ही ओळ सर्वात महत्त्वाची आहे. यामुळे IDENTITY एरर येणार नाही.
                    item.SaleId = sale.Id;

                    // २. स्टॉक अपडेट करा
                    await HandleStockAdjustment(item, isAddition: false);

                    calculatedSubTotal += (item.Quantity * item.PricePerUnit);
                    await _unitOfWork.Repository<SaleItem>().AddAsync(item);
                }

                sale.SubTotal = calculatedSubTotal;
                sale.GrandTotal = sale.SubTotal - sale.Discount;

                // ३. कॅल्क्युलेशन अपडेट करा
                _unitOfWork.Repository<Sale>().Update(sale);

                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return CreatedAtAction("GetSale", new { id = sale.Id }, sale);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                // Inner exception मधील नेमकी चूक दाखवण्यासाठी
                var message = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new { Message = message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSale(int id, Sale sale)
        {
            if (id != sale.Id)
            {
                return BadRequest(new { Message = "ID mismatch: The ID in the URL does not match the ID in the request body." });
            }

            // १. अस्तित्वात असलेला सेल आणि त्याचे आयटम्स मिळवा
            var existingSale = await _unitOfWork.Sales.GetSaleWithItemsAsync(id);
            if (existingSale == null)
            {
                return NotFound(new { Message = $"Sale record with ID {id} was not found in the system." });
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // २. जुन्या आयटम्सचा स्टॉक रिव्हर्ट करा (परत वाढवा)
                foreach (var oldItem in existingSale.SaleItems)
                {
                    await HandleStockAdjustment(oldItem, isAddition: true);
                }

                // ३. मुख्य सेलची माहिती अपडेट करा
                existingSale.CustomerId = sale.CustomerId;
                existingSale.Date = sale.Date;
                existingSale.Discount = sale.Discount;
                existingSale.ReceivedAmount = sale.ReceivedAmount;
                existingSale.Notes = sale.Notes;
                existingSale.PaymentMode = sale.PaymentMode;
                existingSale.Status = sale.Status;

                // ४. जुने आयटम्स काढून नवीन ॲड करा (Delete and Re-add strategy)
                var currentItems = (await _unitOfWork.Repository<SaleItem>().GetAllAsync())
                                    .Where(si => si.SaleId == id).ToList();

                foreach (var item in currentItems)
                {
                    _unitOfWork.Repository<SaleItem>().Delete(item);
                }

                decimal calculatedSubTotal = 0;
                foreach (var newItem in sale.SaleItems)
                {
                    newItem.Id = 0; // IDENTITY_INSERT एरर टाळण्यासाठी
                    newItem.SaleId = id;

                    // ५. नवीन स्टॉक ॲडजस्टमेंट (घट करणे)
                    await HandleStockAdjustment(newItem, isAddition: false);

                    calculatedSubTotal += (newItem.Quantity * newItem.PricePerUnit);
                    await _unitOfWork.Repository<SaleItem>().AddAsync(newItem);
                }

                existingSale.SubTotal = calculatedSubTotal;
                existingSale.GrandTotal = existingSale.SubTotal - existingSale.Discount;

                _unitOfWork.Repository<Sale>().Update(existingSale);

                // ६. सर्व बदल सेव्ह करा आणि ट्रान्झॅक्शन कमिट करा
                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return Ok(new { Message = "Sale record and stock inventory updated successfully." });
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                // तांत्रिक एररसाठी स्पष्ट मेसेज
                var errorMessage = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest(new
                {
                    Message = "An error occurred while updating the sale record.",
                    Details = errorMessage
                });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            var sale = await _unitOfWork.Sales.GetSaleWithItemsAsync(id);
            if (sale == null) return NotFound();

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var item in sale.SaleItems)
                {
                    await HandleStockAdjustment(item, isAddition: true);
                }

                _unitOfWork.Repository<Sale>().Delete(sale);

                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return BadRequest(new { Message = ex.Message });
            }
        }

        private async Task HandleStockAdjustment(SaleItem item, bool isAddition)
        {
            if (item.EggInventoryId.HasValue && item.EggInventoryId > 0)
            {
                var egg = await _unitOfWork.EggInventories.GetByIdAsync(item.EggInventoryId.Value);
                if (egg != null)
                {
                    int qty = (int)item.Quantity;
                    egg.CurrentStock = isAddition ? egg.CurrentStock + qty : egg.CurrentStock - qty;
                    _unitOfWork.EggInventories.Update(egg);
                }
            }
            else if (item.FlockId.HasValue && item.FlockId > 0)
            {
                var flock = await _unitOfWork.Flocks.GetByIdAsync(item.FlockId.Value);
                if (flock != null)
                {
                    int qty = (int)item.Quantity;
                    flock.CurrentCount = isAddition ? flock.CurrentCount + qty : flock.CurrentCount - qty;
                    _unitOfWork.Flocks.Update(flock);
                }
            }
            else if (item.InventoryItemId.HasValue && item.InventoryItemId > 0)
            {
                var inv = await _unitOfWork.Inventory.GetByIdAsync(item.InventoryItemId.Value);
                if (inv != null)
                {
                    inv.Quantity = isAddition ? inv.Quantity + item.Quantity : inv.Quantity - item.Quantity;
                    _unitOfWork.Inventory.Update(inv);
                }
            }
        }
    }
}