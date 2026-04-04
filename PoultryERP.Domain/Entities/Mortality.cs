using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities
{
    public class Mortality
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FlockId { get; set; }

        [Required]
        public int Count { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public string? Reason { get; set; }

        [ForeignKey("FlockId")]
        public virtual Flock? Flock { get; set; }
    }
}