// src/services/pedidoService.js
import api from '../api/api';
 // tu archivo api.js con axios

// Obtener todos los pedidos
// src/services/pedidoService.js
let pedidos = [
  { id: 1, cliente: "Juan", total: 120, estado: "Pendiente" },
  { id: 2, cliente: "Maria", total: 250, estado: "En preparación" },
];

export const getPedidos = async () => ({ data: pedidos });
export const actualizarPedido = async (id, data) => { pedidos = pedidos.map(p => p.id === id ? { ...p, ...data } : p); return { data: pedidos.find(p => p.id === id) }; };
