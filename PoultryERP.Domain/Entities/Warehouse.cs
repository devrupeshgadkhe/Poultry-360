using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PoultryERP.Domain.Entities
{
    public class Warehouse
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(200)]
        public string Location { get; set; } = string.Empty;

        // This allows you to see all items inside a warehouse easily
        public virtual ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
    }
}