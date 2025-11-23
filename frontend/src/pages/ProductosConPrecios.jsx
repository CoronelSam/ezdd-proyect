import { useState, useEffect } from 'react';
import { productosService, preciosService } from '../services';
import { APP_CONSTANTS } from '../config/constants';

/**
 * Componente que muestra productos con sus precios
 */
function ProductosConPrecios() {
    const [productos, setProductos] = useState([]);
    const [preciosMap, setPreciosMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedProductId, setExpandedProductId] = useState(null);

    useEffect(() => {
        cargarProductosYPrecios();
    }, []);

    const cargarProductosYPrecios = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener todos los productos
            const productosData = await productosService.getAll();

            // Crear un mapa para almacenar precios por producto
            const preciosTemp = {};

            // Para cada producto, obtener sus precios
            await Promise.all(
                productosData.map(async (producto) => {
                    // Verificar que el producto tenga un ID válido
                    if (!producto.id_producto) {
                        console.warn(`Producto sin ID válido:`, producto);
                        preciosTemp[producto.id_producto || 'sin_id'] = [];
                        return;
                    }

                    try {
                        // Primero intentar obtener precios de la tabla precio_productos (activos)
                        let precios = await preciosService.getByProducto(producto.id_producto, true);

                        // Si no hay precios en precio_productos, verificar si tiene precio en la tabla productos
                        if (precios.length === 0 && producto.precio) {
                            // Crear un precio "virtual" basado en el precio del producto
                            precios = [{
                                id: `producto_${producto.id_producto}`,
                                id_precio: `producto_${producto.id_producto}`,
                                nombre_presentacion: 'Precio único',
                                descripcion: null,
                                precio: parseFloat(producto.precio),
                                activo: producto.activo,
                                es_precio_base: true // Indicador de que viene de la tabla productos
                            }];
                        } else if (precios.length === 0) {
                            // Intentar obtener todos los precios (activos e inactivos) de precio_productos
                            precios = await preciosService.getByProducto(producto.id_producto, false);
                        }

                        preciosTemp[producto.id_producto] = precios;
                    } catch (err) {
                        console.warn(`No se pudieron cargar precios para producto ${producto.id_producto}:`, err);
                        preciosTemp[producto.id_producto] = [];
                    }
                })
            );

            setProductos(productosData);
            setPreciosMap(preciosTemp);

        } catch (err) {
            setError(err.response?.data?.error || APP_CONSTANTS.MENSAJES.ERROR.CONEXION_ERROR);
            console.error('Error al cargar productos y precios:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat(APP_CONSTANTS.MONEDA.LOCALE, {
            style: 'currency',
            currency: APP_CONSTANTS.MONEDA.CODIGO
        }).format(precio);
    };

    const getPrecioMasBajo = (precios) => {
        if (!precios || precios.length === 0) return null;
        return Math.min(...precios.map(p => p.precio));
    };

    const getPrecioMasAlto = (precios) => {
        if (!precios || precios.length === 0) return null;
        return Math.max(...precios.map(p => p.precio));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Cargando productos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="flex items-center mb-4">
                        <div className="bg-red-100 rounded-full p-2 mr-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-800">Error al cargar datos</h3>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={cargarProductosYPrecios}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Nuestro Menú</h1>
                    <p className="text-lg text-gray-600">Descubre nuestros deliciosos productos con sus precios</p>
                </div>

                {/* Ejemplo rápido: mostrar datos del primer producto */}
                <div className="max-w-4xl mx-auto mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Ejemplo: Datos del primer producto</h3>
                    {productos.length > 0 ? (
                        <div className="bg-white p-4 rounded-lg shadow sm:rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-md font-semibold">{productos[0].nombre} <span className="text-xs text-gray-500">(ID: {productos[0].id_producto})</span></div>
                                    <div className="text-sm text-gray-600">{productos[0].descripcion || 'Sin descripción'}</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setExpandedProductId(prev => prev === productos[0].id_producto ? null : productos[0].id_producto)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                    >
                                        {expandedProductId === productos[0].id_producto ? 'Ocultar JSON' : 'Ver JSON'}
                                    </button>
                                </div>
                            </div>

                            {expandedProductId === productos[0].id_producto && (
                                <pre className="mt-4 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">{JSON.stringify(productos[0], null, 2)}</pre>
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">No hay productos para mostrar el ejemplo.</div>
                    )}
                </div>

                {productos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
                            <p className="text-gray-600">En este momento no tenemos productos en el menú.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {productos.map(producto => {
                            const precios = preciosMap[producto.id_producto] || [];
                            const precioMin = getPrecioMasBajo(precios);
                            const precioMax = getPrecioMasAlto(precios);

                            return (
                                <div key={producto.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{producto.nombre}</h3>
                                                {producto.descripcion && (
                                                    <p className="text-gray-600 text-sm mb-3">{producto.descripcion}</p>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${producto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {producto.activo ? 'Disponible' : 'No disponible'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Precios */}
                                        <div className="border-t pt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Precios disponibles ({precios.length})</h4>

                                            {(() => {
                                                if (precios.length === 0) {
                                                    return (
                                                        <div className="text-center py-4">
                                                            <p className="text-gray-500 text-sm">Sin precios definidos</p>
                                                        </div>
                                                    );
                                                } else if (precios.length === 1) {
                                                    // Un solo precio - mostrar destacado
                                                    const precio = precios[0];
                                                    const esPrecioBase = precio.es_precio_base;

                                                    return (
                                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                            <div className="text-center mb-2">
                                                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">1 PRECIO DETECTADO {esPrecioBase ? '(BASE)' : ''}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <span className="text-sm font-medium text-gray-900 mr-2">{precio.nombre_presentacion || 'Precio único'}</span>
                                                                    {precio.activo && (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Disponible</span>
                                                                    )}
                                                                </div>
                                                                <span className="text-2xl font-bold text-green-600">{precio.precio ? formatearPrecio(precio.precio) : 'N/A'}</span>
                                                            </div>
                                                            {precio.descripcion && (
                                                                <p className="text-xs text-gray-600 mt-2">{precio.descripcion}</p>
                                                            )}
                                                            {esPrecioBase && (
                                                                <p className="text-xs text-blue-600 mt-2 font-medium">💰 Precio almacenado en tabla productos</p>
                                                            )}
                                                        </div>
                                                    );
                                                } else {
                                                    // Múltiples precios - mostrar lista
                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="text-center mb-2">
                                                                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">{precios.length} PRECIOS DETECTADOS</span>
                                                            </div>
                                                            {precios.map(precio => (
                                                                <div key={precio.id || precio.id_precio} className="flex items-center justify-between bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors">
                                                                    <div className="flex items-center flex-1">
                                                                        <div className="flex-1">
                                                                            <span className="text-sm font-medium text-gray-900 block">{precio.nombre_presentacion}</span>
                                                                            {precio.descripcion && (
                                                                                <span className="text-xs text-gray-600 block">{precio.descripcion}</span>
                                                                            )}
                                                                        </div>
                                                                        {precio.activo && (
                                                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Activo</span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-lg font-bold text-green-600 ml-4">{formatearPrecio(precio.precio)}</span>
                                                                </div>
                                                            ))}

                                                            {/* Resumen de precios */}
                                                            <div className="mt-4 pt-3 border-t border-gray-200 bg-blue-50 rounded-md p-3">
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div className="text-center">
                                                                        <span className="text-gray-600 block">Desde</span>
                                                                        <span className="font-semibold text-green-600 text-lg">{formatearPrecio(precioMin)}</span>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <span className="text-gray-600 block">Hasta</span>
                                                                        <span className="font-semibold text-green-600 text-lg">{formatearPrecio(precioMax)}</span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-600 text-center mt-2">{precios.length} presentaciones disponibles</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>

                                        {/* Información adicional */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <span>ID: {producto.id_producto}</span>
                                                <span>Categoría: {producto.id_categoria || 'Sin categoría'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Estadísticas */}
                {productos.length > 0 && (
                    <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Estadísticas del Menú</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-2">{productos.length}</div>
                                <div className="text-gray-600">Productos totales</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">{productos.filter(p => p.activo).length}</div>
                                <div className="text-gray-600">Productos disponibles</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">{Object.values(preciosMap).reduce((total, precios) => total + precios.length, 0)}</div>
                                <div className="text-gray-600">Precios configurados</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductosConPrecios;
