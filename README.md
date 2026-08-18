# Auction Intelligence Beta

Web-accessible proof of concept for comparing e-commerce performance against auction throughput.

## Phase 1
- ShipStation connected-store discovery
- 90-day order pull
- Channel normalization (Amazon, eBay, Walmart, Shopify)
- SKU-level transaction, units, and revenue aggregation
- Shopify inventory integration
- Basic ECOMMERCE / HYBRID / AUCTION recommendation

## Local setup
1. Copy `.env.example` to `.env`.
2. Add your API credentials locally. Never commit `.env`.
3. `npm install`
4. `npm run dev`

## Environment variables
```bash
SHIPSTATION_API_KEY=
SHIPSTATION_API_SECRET=
SHOPIFY_STORE_DOMAIN=auctionfuel.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_API_VERSION=2026-07
PORT=3000
```

## Beta rule
Inventory coverage = current inventory / monthly sales velocity.

- <= 3 months: ECOMMERCE
- > 3 and <= 6 months: HYBRID
- > 6 months or no sales: AUCTION

The beta starts with transparent rules so we can validate the data before introducing a weighted scoring model.
