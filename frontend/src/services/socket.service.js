import { io } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

let socket = null;

/**
 * Obtiene la instancia del socket (singleton)
 */
export function getSocket() {
  if (!socket) {
    const baseURL = API_CONFIG.BASE_URL || 'http://localhost:3000';
    socket = io(baseURL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      // Socket conectado
    });

    socket.on('disconnect', () => {
      // Socket desconectado
    });

    socket.on('connect_error', (error) => {
      console.error('Error de conexión Socket.IO:', error);
    });
  }
  return socket;
}

/**
 * Unirse a la sala de administradores
 */
export function joinAdmin() {
  const s = getSocket();
  s.emit('join_admin');
}

/**
 * Unirse a la sala personal del cliente
 * @param {number} idCliente - ID del cliente
 */
export function joinCliente(idCliente) {
  if (!idCliente) return;
  const s = getSocket();
  s.emit('join_cliente', idCliente);
}

/**
 * Unirse a la sala de un pedido específico
 * @param {number} idPedido - ID del pedido
 */
export function joinPedido(idPedido) {
  if (!idPedido) return;
  const s = getSocket();
  s.emit('join_pedido', idPedido);
  console.log(`📦 Unido a sala pedido:${idPedido}`);
}

/**
 * Suscribirse a eventos de nuevos pedidos
 * @param {Function} callback - Función a ejecutar cuando llegue un nuevo pedido
 */
export function onNuevoPedido(callback) {
  const s = getSocket();
  s.on('pedido:nuevo', callback);
}

/**
 * Suscribirse a eventos de cambio de estado de pedido
 * @param {Function} callback - Función a ejecutar cuando cambie el estado
 */
export function onEstadoPedido(callback) {
  const s = getSocket();
  s.on('pedido:estado', callback);
}

/**
 * Suscribirse a eventos de pedido cancelado
 * @param {Function} callback - Función a ejecutar cuando se cancele un pedido
 */
export function onPedidoCancelado(callback) {
  const s = getSocket();
  s.on('pedido:cancelado', callback);
}

/**
 * Suscribirse a eventos de actualización de pedido
 * @param {Function} callback - Función a ejecutar cuando se actualice un pedido
 */
export function onPedidoActualizado(callback) {
  const s = getSocket();
  s.on('pedido:actualizado', callback);
}

/**
 * Desuscribirse de un evento
 * @param {string} evento - Nombre del evento
 * @param {Function} callback - Callback a remover
 */
export function off(evento, callback) {
  const s = getSocket();
  s.off(evento, callback);
}

/**
 * Desconectar el socket
 */
export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket.IO desconectado manualmente');
  }
}

export default {
  getSocket,
  joinAdmin,
  joinCliente,
  joinPedido,
  onNuevoPedido,
  onEstadoPedido,
  onPedidoCancelado,
  onPedidoActualizado,
  off,
  disconnect
};
