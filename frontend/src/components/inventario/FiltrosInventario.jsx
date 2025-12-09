const FiltrosInventario = ({ busqueda, setBusqueda, filtroStock, setFiltroStock }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar ingrediente..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg
                        className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <select
                    value={filtroStock}
                    onChange={(e) => setFiltroStock(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="todos">Todos los niveles de stock</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="medio">Stock medio</option>
                    <option value="alto">Stock alto</option>
                </select>
            </div>
        </div>
    );
};

export default FiltrosInventario;
