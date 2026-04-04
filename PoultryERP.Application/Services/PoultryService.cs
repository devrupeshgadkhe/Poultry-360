using Microsoft.EntityFrameworkCore;
using PoultryERP.Domain.Entities;
using PoultryERP.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PoultryERP.Application.Services
{
    public class PoultryService
    {
        private readonly PoultryDbContext _context;

        public PoultryService(PoultryDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Flock>> GetActiveFlocksAsync()
        {
            return await _context.Flocks
                .Where(f => f.IsActive)
                .OrderByDescending(f => f.StartDate)
                .ToListAsync();
        }

        public async Task<object> GetDashboardDataAsync()
        {
            var activeFlocks = await _context.Flocks.Where(f => f.IsActive).ToListAsync();

            // Calculation logic
            var activeBirdsCount = activeFlocks.Sum(f => f.CurrentCount > 0 ? f.CurrentCount : f.InitialCount);

            // FIX: Sale.cs मध्ये 'GrandTotal' प्रॉपर्टी आहे, ती इथे वापरली आहे.
            var totalRevenueAmount = await _context.Sales.SumAsync(s => s.GrandTotal);

            return new
            {
                ActiveBirds = activeBirdsCount,
                TotalFlocks = activeFlocks.Count,
                TotalRevenue = totalRevenueAmount
            };
        }

        public async Task LogProductionAsync(EggProduction production)
        {
            // टीप: तुमच्या DbContext मध्ये Production टेबलचे नाव 'Productions' असू शकते, ते तपासा.
            await _context.Set<EggProduction>().AddAsync(production);
            await _context.SaveChangesAsync();
        }

        public async Task LogDailyActivityAsync(DailyLog dailyLog)
        {
            await _context.DailyLogs.AddAsync(dailyLog);

            var flock = await _context.Flocks.FindAsync(dailyLog.FlockId);
            if (flock != null && dailyLog.MortalityCount > 0)
            {
                flock.CurrentCount -= dailyLog.MortalityCount;
                _context.Entry(flock).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RecordSaleAsync(Sale sale)
        {
            await _context.Sales.AddAsync(sale);
            await _context.SaveChangesAsync();
        }
    }
}