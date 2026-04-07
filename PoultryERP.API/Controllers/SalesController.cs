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
                sale.Date = sale.Date == default ? DateTime.Now : sale.Date;
                var itemsToProcess = sale.SaleItems.ToList();
                sale.SaleItems = new List<SaleItem>();

                await _unitOfWork.Repository<Sale>().AddAsync(sale);
                await _unitOfWork.CompleteAsync();

                decimal calculatedSubTotal = 0;
                foreach (var item in itemsToProcess)
                {
                    item.Id = 0;
                    item.SaleId = sale.Id;
                    await HandleStockAdjustment(item, isAddition: false);
                    calculatedSubTotal += (item.Quantity * item.PricePerUnit);
                    await _unitOfWork.Repository<SaleItem>().AddAsync(item);
                }

                sale.SubTotal = calculatedSubTotal;
                sale.GrandTotal = sale.SubTotal - sale.Discount;
                _unitOfWork.Repository<Sale>().Update(sale);

                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return CreatedAtAction("GetSale", new { id = sale.Id }, sale);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return BadRequest(new { Message = ex.InnerException?.Message ?? ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutSale(int id, Sale sale)
        {
            if (id != sale.Id) return BadRequest(new { Message = "ID mismatch." });

            var existingSale = await _unitOfWork.Sales.GetSaleWithItemsAsync(id);
            if (existingSale == null) return NotFound(new { Message = "Sale record not found." });

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                foreach (var oldItem in existingSale.SaleItems)
                {
                    await HandleStockAdjustment(oldItem, isAddition: true);
                }

                var saleToUpdate = await _unitOfWork.Repository<Sale>().GetByIdAsync(id);
                if (saleToUpdate == null) throw new Exception("Sale record load error.");

                saleToUpdate.CustomerId = sale.CustomerId;
                saleToUpdate.Date = sale.Date;
                saleToUpdate.Discount = sale.Discount;
                saleToUpdate.ReceivedAmount = sale.ReceivedAmount;
                saleToUpdate.Notes = sale.Notes;
                saleToUpdate.PaymentMode = sale.PaymentMode;
                saleToUpdate.Status = sale.Status;

                var dbItems = (await _unitOfWork.Repository<SaleItem>().GetAllAsync())
                                .Where(si => si.SaleId == id).ToList();
                foreach (var item in dbItems) _unitOfWork.Repository<SaleItem>().Delete(item);
                await _unitOfWork.CompleteAsync();

                decimal calculatedSubTotal = 0;
                foreach (var newItem in sale.SaleItems)
                {
                    newItem.Id = 0;
                    newItem.SaleId = id;
                    await HandleStockAdjustment(newItem, isAddition: false);
                    calculatedSubTotal += (newItem.Quantity * newItem.PricePerUnit);
                    await _unitOfWork.Repository<SaleItem>().AddAsync(newItem);
                }

                saleToUpdate.SubTotal = calculatedSubTotal;
                saleToUpdate.GrandTotal = saleToUpdate.SubTotal - saleToUpdate.Discount;
                _unitOfWork.Repository<Sale>().Update(saleToUpdate);

                await _unitOfWork.CompleteAsync();
                await _unitOfWork.CommitTransactionAsync();

                return Ok(new { Message = "Sale updated successfully." });
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return BadRequest(new { Message = ex.InnerException?.Message ?? ex.Message });
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
                foreach (var item in sale.SaleItems) await HandleStockAdjustment(item, isAddition: true);
                var dbSale = await _unitOfWork.Repository<Sale>().GetByIdAsync(id);
                if (dbSale != null) _unitOfWork.Repository<Sale>().Delete(dbSale);

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
                    if (isAddition) egg.CurrentStock += qty;
                    else
                    {
                        if (egg.CurrentStock < qty) throw new Exception($"Egg: अपुरा स्टॉक ({egg.CurrentStock})");
                        egg.CurrentStock -= qty;
                    }
                    egg.LastUpdated = DateTime.Now;
                    _unitOfWork.EggInventories.Update(egg);
                }
            }
            else if (item.FlockId.HasValue && item.FlockId > 0)
            {
                var flock = await _unitOfWork.Flocks.GetByIdAsync(item.FlockId.Value);
                if (flock != null)
                {
                    int qty = (int)item.Quantity;
                    if (isAddition) flock.CurrentCount += qty;
                    else
                    {
                        if (flock.CurrentCount < qty) throw new Exception($"Flock: अपुरा स्टॉक ({flock.CurrentCount})");
                        flock.CurrentCount -= qty;
                    }
                    _unitOfWork.Flocks.Update(flock);
                }
            }
            else if (item.InventoryItemId.HasValue && item.InventoryItemId > 0)
            {
                var inv = await _unitOfWork.Inventory.GetByIdAsync(item.InventoryItemId.Value);
                if (inv != null)
                {
                    if (isAddition) inv.Quantity += item.Quantity;
                    else
                    {
                        if (inv.Quantity < item.Quantity) throw new Exception("Inventory: अपुरा स्टॉक.");
                        inv.Quantity -= item.Quantity;
                    }
                    inv.LastUpdated = DateTime.Now;
                    _unitOfWork.Inventory.Update(inv);
                }
            }
        }
    }
}