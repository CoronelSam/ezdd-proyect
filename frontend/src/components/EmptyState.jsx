const EmptyState = ({ 
    mensaje = "No se encontraron resultados",
    icono,
    accion
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {icono && (
                <div className="mb-4 text-gray-400">
                    {icono}
                </div>
            )}
            <p className="text-gray-500 text-center mb-4">{mensaje}</p>
            {accion && accion}
        </div>
    );
};

export default EmptyState;
