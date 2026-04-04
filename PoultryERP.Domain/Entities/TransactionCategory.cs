using System.ComponentModel.DataAnnotations;

namespace PoultryERP.Domain.Entities
{
    public class TransactionCategory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public bool IsIncome { get; set; } // True = Income (+), False = Expense (-)

        [MaxLength(200)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}