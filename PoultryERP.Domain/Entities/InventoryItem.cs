using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities
{
    public class InventoryItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        // Categorization (Feed, Medicine, Consumables, Raw Materials)
        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Required]
        [StringLength(20)]
        public string Unit { get; set; } = "kg";

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinThreshold { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PurchasePrice { get; set; } // For FeedPrecision: Production Cost

        [Column(TypeName = "decimal(18,2)")]
        public decimal SellingPrice { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;

        // Flag to identify if it's a produced recipe
        public bool IsFinishedGood { get; set; } = false;

        // NEW: Link to the Recipe/Formation used to create this item
        public int? FoodFormationId { get; set; }

        [ForeignKey("FoodFormationId")]
        public virtual FoodFormation? FoodFormation { get; set; }

        // Foreign Key to Warehouse
        public int? WarehouseId { get; set; }

        [ForeignKey("WarehouseId")]
        public virtual Warehouse? Warehouse { get; set; }
    }
}