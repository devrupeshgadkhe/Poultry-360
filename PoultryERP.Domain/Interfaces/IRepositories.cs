using PoultryERP.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PoultryERP.Domain.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync(string? includeProperties = null);
        Task<T?> GetByIdAsync(int id, string? includeProperties = null);
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(T entity);
        Task<bool> ExistsAsync(int id);
    }

    public interface IFlockRepository : IGenericRepository<Flock>
    {
        Task UpdateAsync(Flock flock);
        Task DeleteAsync(int id);
    }

    public interface IInventoryRepository : IGenericRepository<InventoryItem>
    {
        Task UpdateStockAsync(int itemId, decimal quantity, bool isAddition);
    }

    public interface ISaleRepository : IGenericRepository<Sale>
    {
        // Sale sobat tyache items ani items che details (Egg/Bird/Product) fetch karnyathi
        Task<Sale?> GetSaleWithItemsAsync(int id);
    }

    public interface IVaccinationRepository : IGenericRepository<Vaccination>
    {
        Task<IEnumerable<Vaccination>> GetByFlockIdAsync(int flockId);
    }

    public interface IFoodFormationRepository : IGenericRepository<FoodFormation>
    {
        Task<decimal> GetAveragePriceAsync(int inventoryItemId);
        Task ProduceAsync(FoodFormation formation, decimal salesPrice, bool isSaveAsNew);
    }

    public interface IStaffRepository : IGenericRepository<Staff>
    {
        Task UpdateAsync(Staff staff);
    }

    public interface IFinancialTransactionRepository : IGenericRepository<FinancialTransaction> { }

    public interface IUnitOfWork : IDisposable
    {
        IGenericRepository<T> Repository<T>() where T : class;

        IFlockRepository Flocks { get; }
        IInventoryRepository Inventory { get; }
        ISaleRepository Sales { get; }
        IGenericRepository<Warehouse> Warehouses { get; }
        IGenericRepository<Supplier> Suppliers { get; }
        IGenericRepository<Customer> Customers { get; }
        IGenericRepository<DailyLog> DailyLogs { get; }
        IVaccinationRepository Vaccinations { get; }
        IFoodFormationRepository FoodFormations { get; }
        IStaffRepository Staffs { get; }
        IFinancialTransactionRepository FinancialTransactions { get; }
        IGenericRepository<TransactionCategory> TransactionCategories { get; }
        IGenericRepository<EggInventory> EggInventories { get; }

        Task<int> CompleteAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}