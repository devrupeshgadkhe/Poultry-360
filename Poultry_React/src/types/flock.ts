/**
 * Poultry 360 ERP - Flock Interface
 * Backend Entity: Flock.cs शी सुसंगत
 */
export interface Flock {
  id: number;
  breed: string;
  initialCount: number;
  currentCount: number;
  startDate: string;
  arrivalDate: string;
  endDate: string | null;
  totalPurchasePrice: number;
  perBirdPurchasePrice: number;
  totalFeedCost: number;
  totalVaccineCost: number;
  isActive: boolean;
  status: string | null;
}