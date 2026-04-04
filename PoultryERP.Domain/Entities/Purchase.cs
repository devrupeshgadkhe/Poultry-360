using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PoultryERP.Domain.Entities;

public class Purchase
{
    [Key]
    public int PurchaseId { get; set; }

    [Required]
    public string PurchaseNumber { get; set; } = string.Empty;

    public string? SupplierInvoiceNumber { get; set; }

    [Required]
    public int SupplierId { get; set; }

    public DateTime PurchaseDate { get; set; } = DateTime.Now;

    public decimal TotalAmount { get; set; }

    public int CreatedBy { get; set; }

    public string? Notes { get; set; }

    public string PaymentMode { get; set; } = "Cash";

    // Navigation Properties
    public virtual Supplier? Supplier { get; set; }
    public virtual ICollection<PurchaseItem> PurchaseItems { get; set; } = new List<PurchaseItem>();
}