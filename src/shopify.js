function endpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const version = process.env.SHOPIFY_API_VERSION || '2026-07';
  if (!domain) throw new Error('Missing SHOPIFY_STORE_DOMAIN');
  return `https://${domain}/admin/api/${version}/graphql.json`;
}

async function graphql(query, variables = {}) {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!token) throw new Error('Missing SHOPIFY_ADMIN_ACCESS_TOKEN');

  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query, variables })
  });

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(`Shopify error: ${JSON.stringify(payload.errors || payload)}`);
  }
  return payload.data;
}

export async function getShopifyVariants() {
  const query = `
    query Variants($cursor: String) {
      productVariants(first: 250, after: $cursor) {
        nodes {
          id
          sku
          title
          inventoryQuantity
          product { id title }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  `;

  const variants = [];
  let cursor = null;

  do {
    const data = await graphql(query, { cursor });
    const connection = data.productVariants;
    for (const node of connection.nodes) {
      if (!node.sku) continue;
      variants.push({
        sku: node.sku.trim(),
        title: node.product?.title || node.title,
        inventoryQuantity: Number(node.inventoryQuantity || 0),
        shopifyVariantId: node.id,
        shopifyProductId: node.product?.id || null
      });
    }
    cursor = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
  } while (cursor);

  return variants;
}
