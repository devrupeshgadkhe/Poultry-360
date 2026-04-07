using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Domain.Interfaces;
using PoultryERP.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.Persistence.Repositories
{
    // 1. Generic Repository Implementation
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly PoultryDbContext _context;
        internal DbSet<T> dbSet;

        public GenericRepository(PoultryDbContext context)
        {
            _context = context;
            this.dbSet = _context.Set<T>();
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync(string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;
            if (includeProperties != null)
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp);
                }
            }
            return await query.ToListAsync();
        }

        public virtual async Task<T?> GetByIdAsync(int id, string? includeProperties = null)
        {
            IQueryable<T> query = dbSet;
            if (includeProperties != null)
            {
                foreach (var includeProp in includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(includeProp);
                }
            }
            return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, "Id") == id);
        }

        public virtual async Task AddAsync(T entity)
        {
            await dbSet.AddAsync(entity);
        }

        public virtual void Update(T entity)
        {
            dbSet.Update(entity);
        }

        public virtual void Delete(T entity)
        {
            dbSet.Remove(entity);
        }

        public virtual async Task<bool> ExistsAsync(int id)
        {
            return await dbSet.AnyAsync(e => EF.Property<int>(e, "Id") == id);
        }
    }

    // 2. Specific Repositories
    public class SalesRepository : GenericRepository<Sale>, ISaleRepository
    {
        public SalesRepository(PoultryDbContext context) : base(context) { }

        public async Task<Sale?> GetSaleWithItemsAsync(int id)
        {
            return await _context.Sales
                .Include(s => s.Customer)
                .Include(s => s.SaleItems)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }
    }

    public class FlockRepository : GenericRepository<Flock>, IFlockRepository
    {
        public FlockRepository(PoultryDbContext context) : base(context) { }

        public async Task UpdateAsync(Flock flock)
        {
            _context.Flocks.Update(flock);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(int id)
        {
            var flock = await _context.Flocks.FindAsync(id);
            if (flock != null) _context.Flocks.Remove(flock);
        }
    }

    public class InventoryRepository : GenericRepository<InventoryItem>, IInventoryRepository
    {
        public InventoryRepository(PoultryDbContext context) : base(context) { }

        public async Task UpdateStockAsync(int id, decimal quantity, bool isAddition)
        {
            var item = await _context.Inventory.FindAsync(id);
            if (item != null)
            {
                if (isAddition) item.Quantity += quantity;
                else item.Quantity -= quantity;
                item.LastUpdated = DateTime.Now;
            }
        }
    }

    // 3. Unit of Work Implementation
    public class UnitOfWork : IUnitOfWork
    {
        private readonly PoultryDbContext _context;

        public UnitOfWork(PoultryDbContext context)
        {
            _context = context;
            Sales = new SalesRepository(_context);
            Flocks = new FlockRepository(_context);
            Inventory = new InventoryRepository(_context);
        }

        public ISaleRepository Sales { get; private set; }
        public IFlockRepository Flocks { get; private set; }
        public IInventoryRepository Inventory { get; private set; }

        public IGenericRepository<T> Repository<T>() where T : class => new GenericRepository<T>(_context);

        // Map correctly to specialized interfaces if they exist, otherwise cast Generic
        public IVaccinationRepository Vaccinations => (IVaccinationRepository)new GenericRepository<Vaccination>(_context);
        public IFoodFormationRepository FoodFormations => (IFoodFormationRepository)new GenericRepository<FoodFormation>(_context);
        public IStaffRepository Staffs => (IStaffRepository)new GenericRepository<Staff>(_context);
        public IFinancialTransactionRepository FinancialTransactions => (IFinancialTransactionRepository)new GenericRepository<FinancialTransaction>(_context);

        public IGenericRepository<Customer> Customers => Repository<Customer>();
        public IGenericRepository<TransactionCategory> TransactionCategories => Repository<TransactionCategory>();
        public IGenericRepository<EggInventory> EggInventories => Repository<EggInventory>();
        public IGenericRepository<Warehouse> Warehouses => Repository<Warehouse>();
        public IGenericRepository<Supplier> Suppliers => Repository<Supplier>();
        public IGenericRepository<DailyLog> DailyLogs => Repository<DailyLog>();
        

        public async Task<int> CompleteAsync() => await _context.SaveChangesAsync();
        public async Task BeginTransactionAsync() => await _context.Database.BeginTransactionAsync();

        public async Task CommitTransactionAsync()
        {
            if (_context.Database.CurrentTransaction != null)
                await _context.Database.CommitTransactionAsync();
        }

        public async Task RollbackTransactionAsync()
        {
            if (_context.Database.CurrentTransaction != null)
                await _context.Database.RollbackTransactionAsync();
        }

        public void Dispose() => _context.Dispose();
    }
}