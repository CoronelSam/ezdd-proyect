import Modal from '../Modal';
import Button from '../Button';
import { APP_CONSTANTS } from '../../config/constants';

const ModalIngrediente = ({
    mostrar,
    onCerrar,
    ingredienteSeleccionado,
    formData,
    setFormData,
    onSubmit
}) => {
    return (
        <Modal
            mostrar={mostrar}
            onCerrar={onCerrar}
            titulo={ingredienteSeleccionado ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
            maxWidth="max-w-lg"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Ingrediente *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Tomate, Cebolla, Refresco"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unidad de Medida *
                        </label>
                        <select
                            required
                            value={formData.unidad_medida}
                            onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar unidad</option>
                            {APP_CONSTANTS.UNIDADES_MEDIDA.map(unidad => (
                                <option key={unidad.valor} value={unidad.valor}>
                                    {unidad.etiqueta}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Bebidas: Unidad | Sólidos: Libra/Pieza
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio de Compra *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">L.</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                value={formData.precio_compra}
                                onChange={(e) => setFormData({...formData, precio_compra: e.target.value})}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Mínimo *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={formData.stock_minimo}
                            onChange={(e) => setFormData({...formData, stock_minimo: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="10.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Alerta cuando esté por debajo
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.activo}
                                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">Ingrediente activo</span>
                        </label>
                    </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCerrar}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                        {ingredienteSeleccionado ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalIngrediente;
