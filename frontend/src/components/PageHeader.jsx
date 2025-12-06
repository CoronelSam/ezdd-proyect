const PageHeader = ({ titulo, descripcion, children }) => {
    return (
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                    {titulo}
                </h1>
                {descripcion && (
                    <p className="text-gray-600 mt-1">{descripcion}</p>
                )}
            </div>
            {children && (
                <div className="flex gap-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
