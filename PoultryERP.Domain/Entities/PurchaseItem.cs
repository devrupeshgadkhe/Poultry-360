using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities;

public class PurchaseItem
{
    [Key]
    public int PurchaseItemId { get; set; }

    [Required]
    public int PurchaseId { get; set; }

    [Required]
    public int ItemId { get; set; } // FK to InventoryItem (matches Id in InventoryItem.cs)

    public decimal Quantity { get; set; }

    public decimal ReturnedQuantity { get; set; } = 0;

    public decimal PurchaseRate { get; set; }

    // Navigation Properties
    [ForeignKey("PurchaseId")]
    public virtual Purchase? Purchase { get; set; }

    [ForeignKey("ItemId")]
    public virtual InventoryItem? Item { get; set; }
}