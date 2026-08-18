export const mockStores = [
  { storeId: 101, storeName: 'Auction Fuel Amazon', marketplaceName: 'Amazon' },
  { storeId: 102, storeName: 'Auction Fuel eBay', marketplaceName: 'eBay' },
  { storeId: 103, storeName: 'Auction Fuel Walmart', marketplaceName: 'Walmart' },
  { storeId: 104, storeName: 'Auction Fuel Shopify', marketplaceName: 'Shopify' }
];

export const mockOrders = [
  { orderId: 1, storeId: 101, orderDate: '2026-08-16T12:00:00Z', items: [{ sku: 'WAHL-9818', name: 'Wahl Trimmer', quantity: 2, unitPrice: 48.99 }] },
  { orderId: 2, storeId: 102, orderDate: '2026-08-14T12:00:00Z', items: [{ sku: 'WAHL-9818', name: 'Wahl Trimmer', quantity: 1, unitPrice: 46.5 }] },
  { orderId: 3, storeId: 103, orderDate: '2026-08-11T12:00:00Z', items: [{ sku: '3M-1860', name: '3M 1860 Respirator', quantity: 12, unitPrice: 23.99 }] },
  { orderId: 4, storeId: 104, orderDate: '2026-08-09T12:00:00Z', items: [{ sku: '3M-1860', name: '3M 1860 Respirator', quantity: 5, unitPrice: 24.99 }] },
  { orderId: 5, storeId: 101, orderDate: '2026-07-29T12:00:00Z', items: [{ sku: 'GLOVE-XL', name: 'Disposable Gloves XL', quantity: 1, unitPrice: 14.99 }] }
];

export const mockVariants = [
  { sku: 'WAHL-9818', title: 'Wahl Trimmer', inventoryQuantity: 126 },
  { sku: '3M-1860', title: '3M 1860 Respirator', inventoryQuantity: 547 },
  { sku: 'GLOVE-XL', title: 'Disposable Gloves XL', inventoryQuantity: 600 }
];
