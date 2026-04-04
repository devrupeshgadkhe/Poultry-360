using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities
{
    public enum SaleItemType { Egg = 1, Bird = 2, InventoryProduct = 3 }

    public class SaleItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int SaleId { get; set; }

        [Required]
        public SaleItemType ItemType { get; set; }

        // Eggs sathi mapping
        public int? EggInventoryId { get; set; }

        // Birds sathi mapping
        public int? FlockId { get; set; }

        // Itar items sathi mapping
        public int? InventoryItemId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerUnit { get; set; }

        [NotMapped]
        public decimal TotalPrice => Quantity * PricePerUnit;

        [ForeignKey("SaleId")]
        public virtual Sale? Sale { get; set; }

        [ForeignKey("EggInventoryId")]
        public virtual EggInventory? EggInventory { get; set; }

        [ForeignKey("FlockId")]
        public virtual Flock? Flock { get; set; }

        [ForeignKey("InventoryItemId")]
        public virtual InventoryItem? InventoryItem { get; set; }
    }
}