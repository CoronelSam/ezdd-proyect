import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/auth.service';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [tipoUsuario, setTipoUsuario] = useState('cliente');
    const [formData, setFormData] = useState({
        email: '',
        clave: ''
    });
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            let response;
            
            if (tipoUsuario === 'cliente') {
                // Login de cliente con email y clave
                response = await authService.loginCliente(formData.email, formData.clave);
            } else {
                // Login de empleado con username y password
                // Para empleados, el email ingresado será tratado como username
                response = await authService.loginEmpleado(formData.email, formData.clave);
            }

            if (response.success) {
                // Guardar usuario en contexto y localStorage
                login(response.data);

                if (response.data.tipo === 'cliente') {
                    localStorage.setItem('id_cliente', response.data.id_cliente);
                    navigate('/menu');
                } else {
                    // Para empleados, redirigir según su rol
                    localStorage.setItem('usuario_id', response.data.usuario_id);
                    localStorage.setItem('id_empleado', response.data.id_empleado);
                    navigate('/admin/dashboard');
                }
            } else {
                setError(response.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error en login:', error);
            setError(error.response?.data?.error || error.message || 'Error al iniciar sesión');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
                    <p className="text-gray-600 mt-2">Bienvenido de vuelta</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Selector de tipo de usuario */}
                    <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTipoUsuario('cliente')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                tipoUsuario === 'cliente'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Cliente
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipoUsuario('empleado')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                                tipoUsuario === 'empleado'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Empleado
                        </button>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {tipoUsuario === 'cliente' ? 'Email' : 'Usuario'}
                            </label>
                            <input
                                type={tipoUsuario === 'cliente' ? 'email' : 'text'}
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={tipoUsuario === 'cliente' ? 'tu@email.com' : 'usuario'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="clave"
                                required
                                value={formData.clave}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Solo mostrar registro si es cliente */}
                    {tipoUsuario === 'cliente' && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                ¿No tienes cuenta?{' '}
                                <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* Volver al inicio */}
                    <div className="mt-4 text-center">
                        <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
