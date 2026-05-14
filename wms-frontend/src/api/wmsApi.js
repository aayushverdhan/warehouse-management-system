import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

export const getDashboard = () => api.get('/dashboard');
export const getWarehouses = () => api.get('/warehouses');
export const createWarehouse = (data) => api.post('/warehouses', data);

export const getInventory = () => api.get('/inventory');
export const getItemBySku = (sku) => api.get(`/inventory/sku/${sku}`);
export const createInventoryItem = (data) => api.post('/inventory', data);
export const adjustStock = (data) => api.patch('/inventory/adjust', data);
export const getQrCode = (sku) => api.get(`/inventory/qr/${sku}`);

export const getOrders = () => api.get('/orders');
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post('/orders', data);
export const advanceOrder = (id) => api.patch(`/orders/${id}/advance`);

export const getShipments = () => api.get('/shipments');
export const receiveShipment = (data) => api.post('/shipments', data);
