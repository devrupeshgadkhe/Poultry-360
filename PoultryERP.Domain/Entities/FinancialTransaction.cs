using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PoultryERP.Domain.Entities
{
    /// <summary>
    /// पेमेंट मोडचे प्रकार
    /// </summary>
    public enum PaymentMode
    {
        Cash = 1,
        UPI = 2,
        NetBanking = 3,
        Cheque = 4,
        Other = 5
    }

    public class FinancialTransaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime TransactionDate { get; set; } = DateTime.Now;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        // Category Table सोबतचा संबंध
        [Required]
        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual TransactionCategory? Category { get; set; }

        [Required]
        public PaymentMode Mode { get; set; }

        // PRECAUTION: Ensuring Description is never null at Database and Entity level
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        // स्टाफ सोबतचा संबंध (पगार किंवा ॲडव्हान्ससाठी)
        public int? StaffId { get; set; }

        [ForeignKey("StaffId")]
        public virtual Staff? Staff { get; set; }

        // सप्लायर सोबतचा संबंध
        public int? SupplierId { get; set; }

        [ForeignKey("SupplierId")]
        public virtual Supplier? Supplier { get; set; }

        // विशिष्ट बॅचशी संबंधित खर्च
        public int? BatchId { get; set; }

        [ForeignKey("BatchId")]
        public virtual Flock? Batch { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}