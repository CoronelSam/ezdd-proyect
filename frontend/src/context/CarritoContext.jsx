import { createContext, useEffect, useState } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
    // Inicializar desde localStorage usando lazy initialization
    const [items, setItems] = useState(() => {
        try {
            const carritoGuardado = localStorage.getItem('carrito');
            return carritoGuardado ? JSON.parse(carritoGuardado) : [];
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            return [];
        }
    });
    const [isOpen, setIsOpen] = useState(false);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(items));
    }, [items]);

    const agregarItem = (producto, precio, cantidad = 1, instrucciones = '') => {
        setItems(prevItems => {
            // Verificar si el producto con el mismo precio ya existe
            const itemExistente = prevItems.find(
                item => item.producto.id_producto === producto.id_producto && 
                        item.precio.id_precio === precio.id_precio
            );

            if (itemExistente) {
                // Si existe, aumentar la cantidad
                return prevItems.map(item =>
                    item.producto.id_producto === producto.id_producto && 
                    item.precio.id_precio === precio.id_precio
                        ? { ...item, cantidad: item.cantidad + cantidad, instrucciones }
                        : item
                );
            } else {
                // Si no existe, agregar nuevo item
                return [...prevItems, { producto, precio, cantidad, instrucciones }];
            }
        });
    };

    const eliminarItem = (idProducto, idPrecio) => {
        setItems(prevItems =>
            prevItems.filter(
                item => !(item.producto.id_producto === idProducto && item.precio.id_precio === idPrecio)
            )
        );
    };

    const actualizarCantidad = (idProducto, idPrecio, cantidad) => {
        if (cantidad <= 0) {
            eliminarItem(idProducto, idPrecio);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.producto.id_producto === idProducto && item.precio.id_precio === idPrecio
                    ? { ...item, cantidad }
                    : item
            )
        );
    };

    const actualizarInstrucciones = (idProducto, idPrecio, instrucciones) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.producto.id_producto === idProducto && item.precio.id_precio === idPrecio
                    ? { ...item, instrucciones }
                    : item
            )
        );
    };

    const limpiarCarrito = () => {
        setItems([]);
    };

    const calcularTotal = () => {
        return items.reduce((total, item) => {
            return total + (parseFloat(item.precio.precio) * item.cantidad);
        }, 0);
    };

    const calcularCantidadTotal = () => {
        return items.reduce((total, item) => total + item.cantidad, 0);
    };

    const toggleCarrito = () => {
        setIsOpen(!isOpen);
    };

    const value = {
        items,
        agregarItem,
        eliminarItem,
        actualizarCantidad,
        actualizarInstrucciones,
        limpiarCarrito,
        calcularTotal,
        calcularCantidadTotal,
        isOpen,
        toggleCarrito,
        setIsOpen
    };

    return (
        <CarritoContext.Provider value={value}>
            {children}
        </CarritoContext.Provider>
    );
};

export default CarritoContext;
