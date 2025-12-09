import { useEffect, useState } from 'react';
import { inventariosService, ingredientesService } from '../../services';
import { APP_CONSTANTS } from '../../config/constants';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/Button';
import AlertMessage from '../../components/AlertMessage';
import EstadisticasInventario from '../../components/inventario/EstadisticasInventario';
import FiltrosInventario from '../../components/inventario/FiltrosInventario';
import TablaInventario from '../../components/inventario/TablaInventario';
import ModalInventario from '../../components/inventario/ModalInventario';
import ModalIngrediente from '../../components/inventario/ModalIngrediente';

const GestionInventario = () => {
    const [inventarios, setInventarios] = useState([]);
    const [ingredientes, setIngredientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalInventarioAbierto, setModalInventarioAbierto] = useState(false);
    const [modalIngredienteAbierto, setModalIngredienteAbierto] = useState(false);
    const [inventarioSeleccionado, setInventarioSeleccionado] = useState(null);
    const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroStock, setFiltroStock] = useState('todos');
    const [alerta, setAlerta] = useState({ show: false, message: '', type: '' });

    const [formDataInventario, setFormDataInventario] = useState({
        id_ingrediente: '',
        cantidad_actual: ''
    });

    const [formDataIngrediente, setFormDataIngrediente] = useState({
        nombre: '',
        unidad_medida: '',
        precio_compra: '',
        stock_minimo: '',
        cantidad_inicial: '',
        activo: true
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [inventariosData, ingredientesData] = await Promise.all([
                inventariosService.getAll(),
                ingredientesService.getAll()
            ]);
            setInventarios(inventariosData);
            setIngredientes(ingredientesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            mostrarAlerta('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarAlerta = (message, type = 'info') => {
        setAlerta({ show: true, message, type });
        setTimeout(() => setAlerta({ show: false, message: '', type: '' }), 5000);
    };

    // Gestión de Inventario
    const abrirModalInventario = (inventario = null) => {
        if (inventario) {
            setInventarioSeleccionado(inventario);
            setFormDataInventario({
                id_ingrediente: inventario.id_ingrediente,
                cantidad_actual: inventario.cantidad_actual
            });
        } else {
            setInventarioSeleccionado(null);
            setFormDataInventario({
                id_ingrediente: '',
                cantidad_actual: ''
            });
        }
        setModalInventarioAbierto(true);
    };

    const cerrarModalInventario = () => {
        setModalInventarioAbierto(false);
        setInventarioSeleccionado(null);
    };

    const handleSubmitInventario = async (e) => {
        e.preventDefault();
        try {
            if (inventarioSeleccionado) {
                // Actualizar inventario existente
                await inventariosService.update(inventarioSeleccionado.id_inventario, formDataInventario);
                mostrarAlerta('Inventario actualizado exitosamente', 'success');
            } else {
                // Verificar si ya existe inventario para este ingrediente
                const inventarioExistente = inventarios.find(
                    inv => inv.id_ingrediente === parseInt(formDataInventario.id_ingrediente)
                );
                
                if (inventarioExistente) {
                    // Si existe, actualizar
                    await inventariosService.update(inventarioExistente.id_inventario, {
                        cantidad_actual: formDataInventario.cantidad_actual
                    });
                    mostrarAlerta('Inventario actualizado exitosamente', 'success');
                } else {
                    // Si no existe, crear nuevo
                    await inventariosService.create(formDataInventario);
                    mostrarAlerta('Inventario creado exitosamente', 'success');
                }
            }
            await cargarDatos();
            cerrarModalInventario();
        } catch (error) {
            console.error('Error al guardar inventario:', error);
            const errorMsg = error.response?.data?.mensaje || error.message || 'Error al guardar el inventario';
            mostrarAlerta(errorMsg, 'error');
        }
    };

    const eliminarInventario = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro de inventario?')) {
            try {
                await inventariosService.delete(id);
                mostrarAlerta('Inventario eliminado exitosamente', 'success');
                await cargarDatos();
            } catch (error) {
                console.error('Error al eliminar inventario:', error);
                const errorMsg = error.response?.data?.mensaje || error.message || 'Error al eliminar el inventario';
                mostrarAlerta(errorMsg, 'error');
            }
        }
    };

    // Gestión de Ingredientes
    const abrirModalIngrediente = (ingrediente = null) => {
        if (ingrediente) {
            setIngredienteSeleccionado(ingrediente);
            setFormDataIngrediente({
                nombre: ingrediente.nombre,
                unidad_medida: ingrediente.unidad_medida,
                precio_compra: ingrediente.precio_compra,
                stock_minimo: ingrediente.stock_minimo,
                cantidad_inicial: '',
                activo: ingrediente.activo
            });
        } else {
            setIngredienteSeleccionado(null);
            setFormDataIngrediente({
                nombre: '',
                unidad_medida: '',
                precio_compra: '',
                stock_minimo: '',
                cantidad_inicial: '',
                activo: true
            });
        }
        setModalIngredienteAbierto(true);
    };

    const cerrarModalIngrediente = () => {
        setModalIngredienteAbierto(false);
        setIngredienteSeleccionado(null);
    };

    const handleSubmitIngrediente = async (e) => {
        e.preventDefault();
        try {
            if (ingredienteSeleccionado) {
                // Al actualizar, solo actualizamos el ingrediente
                const { cantidad_inicial, ...ingredienteData } = formDataIngrediente;
                await ingredientesService.update(ingredienteSeleccionado.id_ingrediente, ingredienteData);
                mostrarAlerta('Ingrediente actualizado exitosamente', 'success');
            } else {
                // Al crear nuevo ingrediente
                const { cantidad_inicial, ...ingredienteData } = formDataIngrediente;
                const nuevoIngrediente = await ingredientesService.create(ingredienteData);
                
                // Siempre crear el inventario, con la cantidad inicial o 0
                const cantidadInicial = cantidad_inicial && parseFloat(cantidad_inicial) >= 0 
                    ? parseFloat(cantidad_inicial) 
                    : 0;
                
                try {
                    await inventariosService.create({
                        id_ingrediente: nuevoIngrediente.id_ingrediente,
                        cantidad_actual: cantidadInicial
                    });
                    
                    if (cantidadInicial > 0) {
                        mostrarAlerta('Ingrediente e inventario creados exitosamente', 'success');
                    } else {
                        mostrarAlerta('Ingrediente creado con inventario en 0. Usa "Ajustar Inventario" para agregar stock.', 'success');
                    }
                } catch (invError) {
                    console.error('Error al crear inventario:', invError);
                    mostrarAlerta('Ingrediente creado, pero hubo un error al crear el inventario. Usa "Ajustar Inventario".', 'warning');
                }
            }
            await cargarDatos();
            cerrarModalIngrediente();
        } catch (error) {
            console.error('Error al guardar ingrediente:', error);
            const errorMsg = error.response?.data?.mensaje || error.message || 'Error al guardar el ingrediente';
            mostrarAlerta(errorMsg, 'error');
        }
    };

    const eliminarIngrediente = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este ingrediente? Esto también eliminará su inventario.')) {
            try {
                await ingredientesService.delete(id);
                mostrarAlerta('Ingrediente eliminado exitosamente', 'success');
                await cargarDatos();
            } catch (error) {
                console.error('Error al eliminar ingrediente:', error);
                const errorMsg = error.response?.data?.mensaje || error.message || 'Error al eliminar el ingrediente';
                mostrarAlerta(errorMsg, 'error');
            }
        }
    };

    const getNivelStock = (cantidadActual, stockMinimo) => {
        const num = parseFloat(cantidadActual);
        const minimo = parseFloat(stockMinimo || 10);
        if (num < minimo) return 'bajo';
        if (num < minimo * 3) return 'medio';
        return 'alto';
    };

    const obtenerEtiquetaUnidad = (unidad) => {
        const unidadObj = APP_CONSTANTS.UNIDADES_MEDIDA.find(u => u.valor === unidad);
        return unidadObj ? unidadObj.etiqueta : unidad;
    };

    const inventariosFiltrados = inventarios.filter(inv => {
        const ingrediente = inv.ingrediente || ingredientes.find(i => i.id_ingrediente === inv.id_ingrediente);
        const nombreIngrediente = ingrediente?.nombre || '';
        const unidadMedida = ingrediente?.unidad_medida || '';
        
        const matchBusqueda = nombreIngrediente.toLowerCase().includes(busqueda.toLowerCase()) ||
                            unidadMedida.toLowerCase().includes(busqueda.toLowerCase());
        
        const nivelStock = getNivelStock(inv.cantidad_actual, ingrediente?.stock_minimo);
        const matchStock = filtroStock === 'todos' || nivelStock === filtroStock;
        
        return matchBusqueda && matchStock;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <PageHeader
                title="Gestión de Inventario"
                subtitle="Control de stock de ingredientes y gestión de catálogo"
            />

            {alerta.show && (
                <div className="mb-4">
                    <AlertMessage message={alerta.message} type={alerta.type} />
                </div>
            )}

            {/* Botones de acción principales */}
            <div className="mb-6 flex flex-wrap gap-3">
                <Button
                    onClick={() => abrirModalIngrediente()}
                    variant="primary"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Ingrediente
                </Button>
                <Button
                    onClick={() => abrirModalInventario()}
                    variant="secondary"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Ajustar Inventario
                </Button>
            </div>

            <EstadisticasInventario 
                inventarios={inventarios}
                ingredientes={ingredientes}
                getNivelStock={getNivelStock}
            />

            <FiltrosInventario 
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                filtroStock={filtroStock}
                setFiltroStock={setFiltroStock}
            />

            <TablaInventario 
                inventariosFiltrados={inventariosFiltrados}
                ingredientes={ingredientes}
                getNivelStock={getNivelStock}
                obtenerEtiquetaUnidad={obtenerEtiquetaUnidad}
                onEditarIngrediente={abrirModalIngrediente}
                onAjustarInventario={abrirModalInventario}
                onEliminarIngrediente={eliminarIngrediente}
            />

            <ModalInventario 
                mostrar={modalInventarioAbierto}
                onCerrar={cerrarModalInventario}
                inventarioSeleccionado={inventarioSeleccionado}
                formData={formDataInventario}
                setFormData={setFormDataInventario}
                ingredientes={ingredientes}
                obtenerEtiquetaUnidad={obtenerEtiquetaUnidad}
                onSubmit={handleSubmitInventario}
            />

            <ModalIngrediente 
                mostrar={modalIngredienteAbierto}
                onCerrar={cerrarModalIngrediente}
                ingredienteSeleccionado={ingredienteSeleccionado}
                formData={formDataIngrediente}
                setFormData={setFormDataIngrediente}
                onSubmit={handleSubmitIngrediente}
            />
        </div>
    );
};

export default GestionInventario;
