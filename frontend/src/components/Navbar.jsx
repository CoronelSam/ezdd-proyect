import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import { useAuth } from '../hooks/useAuth';
import { useCarrito } from '../hooks/useCarrito';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toggleCarrito, calcularCantidadTotal } = useCarrito();
    const { usuario, logout } = useAuth();
    const cantidadTotal = calcularCantidadTotal();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navLinks = [
        { path: '/', label: 'Inicio', icon: '🏠' },
        { path: '/menu', label: 'Menú', icon: '🍽️' },
        { path: '/mis-pedidos', label: 'Mis Pedidos', icon: '📦' },
        { path: '/contacto', label: 'Mi Perfil', icon: '👤' }
    ];

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                            <img src={logo} alt="El Sazón de Doris" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">El Sazón de Doris</h1>
                            <p className="text-xs text-gray-500">Sabor auténtico</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                                    isActive(link.path)
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-700 hover:bg-orange-100'
                                }`}
                            >
                                <span>{link.icon}</span>
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        {/* Cart Button */}
                        <button
                            onClick={toggleCarrito}
                            className="relative px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition flex items-center gap-2 shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            <span className="hidden sm:inline">Carrito</span>
                            {cantidadTotal > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                    {cantidadTotal}
                                </span>
                            )}
                        </button>

                        {/* User Menu */}
                        {usuario ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 hidden sm:inline">
                                    Hola, {usuario.nombre}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="hidden sm:inline">Cerrar sesión</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4">
                    <div className="flex gap-2 overflow-x-auto">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap flex items-center gap-2 ${
                                    isActive(link.path)
                                        ? 'bg-orange-500 text-white'
                                        : 'text-gray-700 hover:bg-orange-100'
                                }`}
                            >
                                <span>{link.icon}</span>
                                <span className="text-sm">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
