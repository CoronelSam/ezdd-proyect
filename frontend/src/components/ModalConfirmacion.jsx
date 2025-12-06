const ModalConfirmacion = ({ 
    mostrar, 
    tipo = 'advertencia',
    titulo, 
    mensaje, 
    descripcion, 
    textoBotonConfirmar = 'Confirmar',
    textoBotonCancelar = 'Cancelar',
    onConfirmar, 
    onCancelar 
}) => {
    if (!mostrar) return null;

    const iconos = {
        peligro: {
            bg: 'bg-red-100',
            color: 'text-red-600',
            boton: 'bg-red-600 hover:bg-red-700',
            icono: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        advertencia: {
            bg: 'bg-yellow-100',
            color: 'text-yellow-600',
            boton: 'bg-yellow-600 hover:bg-yellow-700',
            icono: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        exito: {
            bg: 'bg-green-100',
            color: 'text-green-600',
            boton: 'bg-green-600 hover:bg-green-700',
            icono: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        info: {
            bg: 'bg-blue-100',
            color: 'text-blue-600',
            boton: 'bg-blue-600 hover:bg-blue-700',
            icono: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    const estilo = iconos[tipo] || iconos.advertencia;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    {/* Icono */}
                    <div className="flex justify-center mb-4">
                        <div className={`rounded-full p-3 ${estilo.bg}`}>
                            <div className={estilo.color}>
                                {estilo.icono}
                            </div>
                        </div>
                    </div>

                    {/* Título */}
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                        {titulo}
                    </h3>

                    {/* Mensaje */}
                    <p className="text-gray-700 text-center font-medium mb-2">
                        {mensaje}
                    </p>

                    {/* Descripción */}
                    {descripcion && (
                        <p className="text-gray-600 text-sm text-center mb-6">
                            {descripcion}
                        </p>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancelar}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            {textoBotonCancelar}
                        </button>
                        <button
                            onClick={onConfirmar}
                            className={`flex-1 px-4 py-2.5 ${estilo.boton} text-white rounded-lg transition font-medium shadow-lg`}
                        >
                            {textoBotonConfirmar}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;
