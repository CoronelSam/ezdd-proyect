// Configuración de la API
// Permite override por window.API_BASE_URL_OVERRIDE / window.API_URL_OVERRIDE para producción
const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const DEFAULT_API_URL = 'http://localhost:3000/api';

const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL_OVERRIDE) || DEFAULT_API_BASE_URL;
const API_URL = (typeof window !== 'undefined' && window.API_URL_OVERRIDE) || DEFAULT_API_URL;

const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    API_URL: API_URL,

    ENDPOINTS: {
        CLIENTES: '/clientes',
        
        EMPLEADOS: '/empleados',
        
        CATEGORIAS_PRODUCTOS: '/categorias-productos',

        PRODUCTOS: '/productos',
        
        PRECIOS_PRODUCTOS: '/precios-productos',

        INGREDIENTES: '/ingredientes',

        RECETAS: '/recetas',

        INVENTARIOS: '/inventarios',

        PEDIDOS: '/pedidos',

        MOVIMIENTOS_INVENTARIO: '/movimientos-inventario',

        HEALTH: '/health'
    },
    
    REQUEST_CONFIG: {
        timeout: 10000, // 10 segundos
        headers: {
            'Content-Type': 'application/json'
        }
    },
    
    FILE_CONFIG: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
        ALLOWED_PDF_TYPES: ['application/pdf']
    }
};

API_CONFIG.FULL_ENDPOINTS = {
    CLIENTES: API_URL + API_CONFIG.ENDPOINTS.CLIENTES,

    EMPLEADOS: API_URL + API_CONFIG.ENDPOINTS.EMPLEADOS,

    CATEGORIAS_PRODUCTOS: API_URL + API_CONFIG.ENDPOINTS.CATEGORIAS_PRODUCTOS,

    PRODUCTOS: API_URL + API_CONFIG.ENDPOINTS.PRODUCTOS,

    PRECIOS_PRODUCTOS: API_URL + API_CONFIG.ENDPOINTS.PRECIOS_PRODUCTOS,

    INGREDIENTES: API_URL + API_CONFIG.ENDPOINTS.INGREDIENTES,

    RECETAS: API_URL + API_CONFIG.ENDPOINTS.RECETAS,

    INVENTARIOS: API_URL + API_CONFIG.ENDPOINTS.INVENTARIOS,

    PEDIDOS: API_URL + API_CONFIG.ENDPOINTS.PEDIDOS,

    MOVIMIENTOS_INVENTARIO: API_URL + API_CONFIG.ENDPOINTS.MOVIMIENTOS_INVENTARIO,

    HEALTH: API_BASE_URL + API_CONFIG.ENDPOINTS.HEALTH
};
export { API_CONFIG, API_URL, API_BASE_URL };
export default API_CONFIG;
