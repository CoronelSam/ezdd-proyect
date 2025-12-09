import Modal from '../Modal';
import Button from '../Button';

const ModalInventario = ({
    mostrar,
    onCerrar,
    inventarioSeleccionado,
    formData,
    setFormData,
    ingredientes,
    obtenerEtiquetaUnidad,
    onSubmit
}) => {
    return (
        <Modal
            mostrar={mostrar}
            onCerrar={onCerrar}
            titulo={inventarioSeleccionado ? 'Ajustar Inventario' : 'Nuevo Registro de Inventario'}
            maxWidth="max-w-md"
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ingrediente
                    </label>
                    <select
                        required
                        disabled={!!inventarioSeleccionado}
                        value={formData.id_ingrediente}
                        onChange={(e) => setFormData({...formData, id_ingrediente: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    >
                        <option value="">Seleccionar ingrediente</option>
                        {ingredientes.filter(i => i.activo).map(ing => (
                            <option key={ing.id_ingrediente} value={ing.id_ingrediente}>
                                {ing.nombre} ({obtenerEtiquetaUnidad(ing.unidad_medida)})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad Actual
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.cantidad_actual}
                        onChange={(e) => setFormData({...formData, cantidad_actual: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                    />
                    {formData.id_ingrediente && (
                        <p className="text-xs text-gray-500 mt-1">
                            Unidad: {obtenerEtiquetaUnidad(ingredientes.find(i => i.id_ingrediente === parseInt(formData.id_ingrediente))?.unidad_medida)}
                        </p>
                    )}
                </div>
                <div className="flex gap-3 justify-end pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCerrar}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary">
                        {inventarioSeleccionado ? 'Actualizar' : 'Crear'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalInventario;
