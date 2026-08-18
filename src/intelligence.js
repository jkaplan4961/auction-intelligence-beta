function normalizeChannel(store) {
  const text = `${store?.storeName || ''} ${store?.marketplaceName || ''}`.toLowerCase();
  if (text.includes('amazon')) return 'Amazon';
  if (text.includes('ebay')) return 'eBay';
  if (text.includes('walmart')) return 'Walmart';
  if (text.includes('shopify')) return 'Shopify';
  return store?.marketplaceName || store?.storeName || 'Other';
}

function recommendation(inventory, monthlyVelocity) {
  if (monthlyVelocity <= 0) {
    return { recommendation: 'AUCTION', monthsOfInventory: null, ecommerceQty: 0, auctionQty: inventory };
  }

  const monthsOfInventory = inventory / monthlyVelocity;
  if (monthsOfInventory <= 3) {
    return { recommendation: 'ECOMMERCE', monthsOfInventory, ecommerceQty: inventory, auctionQty: 0 };
  }

  if (monthsOfInventory <= 6) {
    const keep = Math.min(inventory, Math.ceil(monthlyVelocity * 3));
    return { recommendation: 'HYBRID', monthsOfInventory, ecommerceQty: keep, auctionQty: Math.max(0, inventory - keep) };
  }

  const keep = Math.min(inventory, Math.ceil(monthlyVelocity * 2));
  return { recommendation: 'AUCTION', monthsOfInventory, ecommerceQty: keep, auctionQty: Math.max(0, inventory - keep) };
}

export function buildIntelligence({ stores, orders, variants, days }) {
  const storeMap = new Map((stores || []).map(store => [String(store.storeId), store]));
  const variantMap = new Map((variants || []).map(v => [String(v.sku || '').trim().toUpperCase(), v]));
  const bySku = new Map();

  for (const order of orders || []) {
    const channel = normalizeChannel(storeMap.get(String(order.storeId)));
    for (const item of order.items || []) {
      const rawSku = String(item.sku || '').trim();
      if (!rawSku) continue;
      const key = rawSku.toUpperCase();
      const row = bySku.get(key) || {
        sku: rawSku,
        title: item.name || rawSku,
        transactions: 0,
        unitsSold: 0,
        revenue: 0,
        channels: { Amazon: 0, eBay: 0, Walmart: 0, Shopify: 0, Other: 0 }
      };
      const qty = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      row.transactions += 1;
      row.unitsSold += qty;
      row.revenue += qty * unitPrice;
      row.channels[channel] = (row.channels[channel] || 0) + qty;
      bySku.set(key, row);
    }
  }

  for (const [key, variant] of variantMap) {
    if (!bySku.has(key)) {
      bySku.set(key, {
        sku: variant.sku,
        title: variant.title || variant.sku,
        transactions: 0,
        unitsSold: 0,
        revenue: 0,
        channels: { Amazon: 0, eBay: 0, Walmart: 0, Shopify: 0, Other: 0 }
      });
    }
  }

  const months = days / 30.4375;
  const rows = [...bySku.entries()].map(([key, row]) => {
    const variant = variantMap.get(key);
    const inventory = Number(variant?.inventoryQuantity || 0);
    const monthlyVelocity = months > 0 ? row.unitsSold / months : 0;
    const rec = recommendation(inventory, monthlyVelocity);
    return {
      ...row,
      inventory,
      monthlyVelocity: Number(monthlyVelocity.toFixed(2)),
      avgSellingPrice: row.unitsSold ? Number((row.revenue / row.unitsSold).toFixed(2)) : 0,
      revenue: Number(row.revenue.toFixed(2)),
      monthsOfInventory: rec.monthsOfInventory === null ? null : Number(rec.monthsOfInventory.toFixed(2)),
      recommendation: rec.recommendation,
      ecommerceQty: rec.ecommerceQty,
      auctionQty: rec.auctionQty
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const summary = rows.reduce((acc, row) => {
    acc.skus += 1;
    acc.unitsSold += row.unitsSold;
    acc.revenue += row.revenue;
    acc.inventory += row.inventory;
    acc.recommendations[row.recommendation] = (acc.recommendations[row.recommendation] || 0) + 1;
    return acc;
  }, { skus: 0, unitsSold: 0, revenue: 0, inventory: 0, recommendations: {} });
  summary.revenue = Number(summary.revenue.toFixed(2));

  return { summary, rows };
}
