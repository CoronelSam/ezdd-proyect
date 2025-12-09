const EstadisticasInventario = ({ inventarios, ingredientes, getNivelStock }) => {
    const totalIngredientes = inventarios.length;
    
    const stockBajo = inventarios.filter(i => {
        const ingrediente = i.ingrediente || ingredientes.find(ing => ing.id_ingrediente === i.id_ingrediente);
        return getNivelStock(i.cantidad_actual, ingrediente?.stock_minimo) === 'bajo';
    }).length;

    const stockMedio = inventarios.filter(i => {
        const ingrediente = i.ingrediente || ingredientes.find(ing => ing.id_ingrediente === i.id_ingrediente);
        return getNivelStock(i.cantidad_actual, ingrediente?.stock_minimo) === 'medio';
    }).length;

    const stockAlto = inventarios.filter(i => {
        const ingrediente = i.ingrediente || ingredientes.find(ing => ing.id_ingrediente === i.id_ingrediente);
        return getNivelStock(i.cantidad_actual, ingrediente?.stock_minimo) === 'alto';
    }).length;

    const estadisticas = [
        {
            titulo: 'Total Ingredientes',
            valor: totalIngredientes,
            color: 'blue',
            icono: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            )
        },
        {
            titulo: 'Stock Bajo',
            valor: stockBajo,
            color: 'red',
            icono: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )
        },
        {
            titulo: 'Stock Medio',
            valor: stockMedio,
            color: 'yellow',
            icono: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            )
        },
        {
            titulo: 'Stock Alto',
            valor: stockAlto,
            color: 'green',
            icono: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
        }
    ];

    const colorClasses = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
        green: { bg: 'bg-green-100', text: 'text-green-600' }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {estadisticas.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">{stat.titulo}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.color === 'blue' ? 'text-gray-900' : colorClasses[stat.color].text}`}>
                                {stat.valor}
                            </p>
                        </div>
                        <div className={`w-10 h-10 ${colorClasses[stat.color].bg} rounded-lg flex items-center justify-center`}>
                            <svg className={`w-6 h-6 ${colorClasses[stat.color].text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {stat.icono}
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EstadisticasInventario;
