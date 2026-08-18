import 'dotenv/config';
import express from 'express';
import { getStores, getOrders } from './src/shipstation.js';
import { getShopifyVariants } from './src/shopify.js';
import { buildIntelligence } from './src/intelligence.js';
import { mockStores, mockOrders, mockVariants } from './src/mockData.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const useMock = String(process.env.USE_MOCK_DATA || 'true').toLowerCase() === 'true';

app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mode: useMock ? 'mock' : 'live', timestamp: new Date().toISOString() });
});

app.get('/api/shipstation/stores', async (_req, res) => {
  try {
    const stores = useMock ? mockStores : await getStores();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/shipstation/orders', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days || 90), 365));
    const orders = useMock ? mockOrders : await getOrders(days);
    res.json({ days, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/shopify/variants', async (_req, res) => {
  try {
    const variants = useMock ? mockVariants : await getShopifyVariants();
    res.json({ count: variants.length, variants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/intelligence', async (req, res) => {
  try {
    const days = Math.max(1, Math.min(Number(req.query.days || 90), 365));
    const [stores, orders, variants] = useMock
      ? [mockStores, mockOrders, mockVariants]
      : await Promise.all([getStores(), getOrders(days), getShopifyVariants()]);

    const intelligence = buildIntelligence({ stores, orders, variants, days });
    res.json({ mode: useMock ? 'mock' : 'live', days, ...intelligence });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Auction Intelligence Beta running on http://localhost:${port}`);
});
