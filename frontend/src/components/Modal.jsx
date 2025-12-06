const Modal = ({ 
    mostrar, 
    titulo, 
    children, 
    onCerrar,
    maxWidth = 'max-w-md'
}) => {
    if (!mostrar) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50/80 via-white/80 to-yellow-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`bg-white rounded-lg ${maxWidth} w-full shadow-2xl animate-in fade-in zoom-in duration-200`}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {titulo}
                    </h2>
                    {onCerrar && (
                        <button
                            onClick={onCerrar}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
