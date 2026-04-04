using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using System;
using System.Linq;

namespace PoultryERP.Persistence.Context
{
    public class PoultryDbContext : DbContext
    {
        public PoultryDbContext(DbContextOptions<PoultryDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Flock> Flocks { get; set; }
        public DbSet<DailyLog> DailyLogs { get; set; }
        public DbSet<InventoryItem> Inventory { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<SaleItem> SaleItems { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Vaccination> Vaccinations { get; set; }
        public DbSet<Purchase> Purchases { get; set; }
        public DbSet<PurchaseItem> PurchaseItems { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Warehouse> Warehouse { get; set; }
        public DbSet<EggProduction> Production { get; set; }
        public DbSet<FoodFormation> FoodFormations { get; set; }
        public DbSet<FoodFormationItem> FoodFormationItems { get; set; }

        // Daily Transaction related Tables
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<TransactionCategory> TransactionCategories { get; set; }
        public DbSet<FinancialTransaction> FinancialTransactions { get; set; }

        // Egg Inventory Table
        public DbSet<EggInventory> EggInventories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User Mapping
            modelBuilder.Entity<User>(entity => {
                entity.HasIndex(u => u.Username).IsUnique();
            });

            // Purchase Mapping
            modelBuilder.Entity<Purchase>(entity =>
            {
                entity.HasKey(p => p.PurchaseId);
            });

            // --- Sales & SaleItems Configuration ---
            modelBuilder.Entity<SaleItem>(entity =>
            {
                // SaleItem chi EggInventory sobat link
                entity.HasOne(si => si.EggInventory)
                    .WithMany()
                    .HasForeignKey(si => si.EggInventoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                // SaleItem chi Flock sobat link (For Bird Sales)
                entity.HasOne(si => si.Flock)
                    .WithMany()
                    .HasForeignKey(si => si.FlockId)
                    .OnDelete(DeleteBehavior.Restrict);

                // SaleItem chi InventoryItem sobat link
                entity.HasOne(si => si.InventoryItem)
                    .WithMany()
                    .HasForeignKey(si => si.InventoryItemId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // FoodFormation & FoodFormationItem Relationship
            modelBuilder.Entity<FoodFormationItem>()
                .HasOne(ffi => ffi.FoodFormation)
                .WithMany(ff => ff.FormationItems)
                .HasForeignKey(ffi => ffi.FoodFormationId)
                .OnDelete(DeleteBehavior.Cascade);

            // FoodFormationItem & InventoryItem Relationship
            modelBuilder.Entity<FoodFormationItem>()
                .HasOne(ffi => ffi.InventoryItem)
                .WithMany()
                .HasForeignKey(ffi => ffi.InventoryItemId)
                .OnDelete(DeleteBehavior.Restrict);

            // --- TransactionCategory Seed Data ---
            modelBuilder.Entity<TransactionCategory>().HasData(
                // Expenses (IsIncome = false)
                new TransactionCategory { Id = 1, Name = "Staff Payment", IsIncome = false, Description = "Salary and Advances" },
                new TransactionCategory { Id = 2, Name = "Utility Bill", IsIncome = false, Description = "Electricity, Water, Internet" },
                new TransactionCategory { Id = 3, Name = "Maintenance", IsIncome = false, Description = "Repairs and Servicing" },
                new TransactionCategory { Id = 5, Name = "General Expense", IsIncome = false, Description = "Small farm daily expenses" },

                // Incomes (IsIncome = true) - Only Non-Sale related income
                new TransactionCategory { Id = 4, Name = "Misc Income", IsIncome = true, Description = "Gunny bags or Manure sales" },
                new TransactionCategory { Id = 6, Name = "Gift Received", IsIncome = true, Description = "External funds or monetary gifts" }
            );

            // --- EggInventory Seed Data ---
            modelBuilder.Entity<EggInventory>().HasData(
                new EggInventory { Id = 1, EggType = "Good", CurrentStock = 0, LastUpdated = DateTime.Now },
                new EggInventory { Id = 2, EggType = "Damaged", CurrentStock = 0, LastUpdated = DateTime.Now }
            );

            // FinancialTransaction Relationships Configuration
            modelBuilder.Entity<FinancialTransaction>(entity =>
            {
                entity.HasOne(ft => ft.Staff)
                    .WithMany(s => s.Transactions)
                    .HasForeignKey(ft => ft.StaffId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(ft => ft.Category)
                    .WithMany()
                    .HasForeignKey(ft => ft.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Batch (Flock) सोबतचा संबंध
                entity.HasOne(ft => ft.Batch)
                    .WithMany()
                    .HasForeignKey(ft => ft.BatchId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Decimal Precision for All Fields (18,2)
            foreach (var property in modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(18,2)");
            }
        }
    }
}