using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PoultryERP.Domain.Entities
{
    public class Staff
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Designation { get; set; } = string.Empty; // उदा. Supervisor, Labour, Manager

        [MaxLength(15)]
        public string? ContactNumber { get; set; }

        public string? Address { get; set; }

        // पगार संरचना
        public decimal MonthlySalary { get; set; } // जर फिक्स पगार असेल तर
        public decimal DailyWages { get; set; }   // जर रोजंदारीवर असेल तर

        public DateTime JoiningDate { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;

        // बँक डिटेल्स (पगारासाठी आवश्यक)
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? IFSCCode { get; set; }

        // Navigation Properties
        // एका स्टाफचे अनेक ट्रान्झॅक्शन्स (Salary/Advance) असू शकतात
        public virtual ICollection<FinancialTransaction>? Transactions { get; set; }
    }
}