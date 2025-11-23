import { Link } from 'react-router-dom';

const Inicio = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                {/* Hero Content */}
                <div className="relative max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center">
                        {/* Logo/Icon */}
                        <div className="mb-8 flex justify-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-6xl shadow-2xl">
                                🍕
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-6">
                            Bienvenido a
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mt-2">
                                Nuestro Restaurante
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                            Disfruta de la mejor comida preparada con amor y los ingredientes más frescos. 
                            Tu satisfacción es nuestra prioridad.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/menu"
                                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-semibold rounded-full hover:from-orange-600 hover:to-red-700 transition transform hover:scale-105 shadow-lg flex items-center gap-2"
                            >
                                <span>Ver Menú</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                            <Link
                                to="/mis-pedidos"
                                className="px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-full hover:bg-gray-50 transition transform hover:scale-105 shadow-lg border-2 border-gray-200"
                            >
                                Ver Mis Pedidos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
                    ¿Por qué elegirnos?
                </h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                            🥗
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Ingredientes Frescos</h3>
                        <p className="text-gray-600">
                            Utilizamos solo los ingredientes más frescos y de la mejor calidad en cada plato que preparamos.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                            ⚡
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Servicio Rápido</h3>
                        <p className="text-gray-600">
                            Preparamos tu pedido rápidamente sin sacrificar la calidad. Seguimiento en tiempo real de tu orden.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg">
                            ❤️
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Hecho con Amor</h3>
                        <p className="text-gray-600">
                            Cada plato es preparado con dedicación y pasión por nuestros experimentados chefs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Popular Items Preview */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-white mb-12">
                        Nuestros Productos Populares
                    </h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { emoji: '🍕', name: 'Pizzas', desc: 'Artesanales' },
                            { emoji: '🍔', name: 'Hamburguesas', desc: 'Jugosas' },
                            { emoji: '🍝', name: 'Pastas', desc: 'Frescas' },
                            { emoji: '🥤', name: 'Bebidas', desc: 'Refrescantes' }
                        ].map((item, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center text-white hover:bg-white/20 transition transform hover:scale-105">
                                <div className="text-6xl mb-4">{item.emoji}</div>
                                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                                <p className="text-white/80">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link
                            to="/menu"
                            className="inline-block px-8 py-4 bg-white text-orange-600 text-lg font-semibold rounded-full hover:bg-gray-100 transition transform hover:scale-105 shadow-lg"
                        >
                            Explorar Todo el Menú
                        </Link>
                    </div>
                </div>
            </div>

            {/* Hours Section */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        {/* Horarios */}
                        <div className="md:w-1/2 p-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Horario de Atención</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="font-semibold text-gray-700">Lunes - Viernes</span>
                                    <span className="text-gray-600">10:00 AM - 10:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="font-semibold text-gray-700">Sábado</span>
                                    <span className="text-gray-600">11:00 AM - 11:00 PM</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                                    <span className="font-semibold text-gray-700">Domingo</span>
                                    <span className="text-gray-600">11:00 AM - 9:00 PM</span>
                                </div>
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="md:w-1/2 bg-gradient-to-br from-orange-500 to-red-600 p-12 text-white">
                            <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <span>+504 1234-5678</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span>info@restaurante.com</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Tegucigalpa, Honduras</span>
                                </div>
                            </div>
                            
                            <Link
                                to="/contacto"
                                className="mt-8 inline-block px-6 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-gray-100 transition"
                            >
                                Actualizar mi información
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inicio;
