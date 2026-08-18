const BASE_URL = 'https://ssapi.shipstation.com';

function authHeader() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;
  if (!key || !secret) throw new Error('Missing ShipStation API credentials');
  return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
}

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ShipStation ${response.status}: ${text.slice(0, 500)}`);
  }
  return response.json();
}

export async function getStores() {
  return request('/stores');
}

export async function getOrders(days = 90) {
  const start = new Date(Date.now() - days * 86400000).toISOString();
  let page = 1;
  const pageSize = 500;
  const orders = [];

  while (true) {
    const data = await request('/orders', {
      createDateStart: start,
      page,
      pageSize
    });
    const batch = data.orders || [];
    orders.push(...batch);
    if (!data.pages || page >= data.pages || batch.length === 0) break;
    page += 1;
  }

  return orders;
}
