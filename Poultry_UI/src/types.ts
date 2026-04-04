/**
 * Represents a group of birds in the poultry farm.
 * Matches PoultryERP.Domain.Entities.Flock
 */
export interface Flock {
  Id: number;
  Breed: string;
  InitialCount: number;
  CurrentCount: number;
  ArrivalDate: string;
  Status: string;
}

/**
 * Represents an item in the warehouse (Feed, Medicine, Equipment).
 * Matches PoultryERP.Domain.Entities.InventoryItem
 */
export interface InventoryItem {
  Id: number;
  Name: string;
  Category: string;
  Quantity: number;
  Unit: string;
  MinThreshold: number;
}

/**
 * Represents a vendor/supplier for farm inputs.
 * Matches PoultryERP.Domain.Entities.Supplier
 */
export interface Supplier {
  Id: number;
  Name: string;
  ContactPerson: string;
  Phone: string;
  Email: string;
  Address: string;
  GSTIN?: string;
  Balance?: number;
  IsActive?: boolean;
}

/**
 * Represents a purchase transaction.
 * NOTE: Per PurchaseRepository.cs, each record handles one Inventory Item.
 * Matches PoultryERP.Domain.Entities.Purchase
 */
export interface Purchase {
  Id?: number;
  SupplierId: number;
  InventoryItemId: number;
  Quantity: number;
  UnitPrice: number;
  TotalAmount: number;
  PurchaseDate: string;
  Notes: string;
  // Navigation properties for UI display
  Supplier?: Supplier;
  InventoryItem?: InventoryItem;
}

/**
 * Represents a legacy or complex purchase item if used in different contexts.
 * Included for full compatibility with previous snippets.
 */
export interface PurchaseItem {
  PurchaseItemId?: number;
  PurchaseId?: number;
  ItemId: number;
  Quantity: number;
  ReturnedQuantity: number;
  PurchaseRate: number;
  ItemName?: string;
}

/**
 * Represents daily farm metrics.
 * Matches PoultryERP.Domain.Entities.DailyLog
 */
export interface DailyLog {
  Id?: number;
  FlockId: number;
  LogDate: string;
  Mortality: number;
  FeedConsumed: number;
  WaterConsumed: number;
  AverageBirdWeightGm: number;
  Notes: string;
}

/**
 * Standard API Response Wrapper
 */
export interface ApiResponse<T> {
  Data: T;
  Message?: string;
  Success: boolean;
}