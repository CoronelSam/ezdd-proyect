import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AbilityProvider } from './context/AbilityContext'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import './index.css'

// Components
import AdminLayout from './components/AdminLayout'
import Carrito from './components/Carrito'
import Navbar from './components/Navbar'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'

// Pages - Client
import Contacto from './pages/client/Contacto'
import HistorialPedidos from './pages/client/HistorialPedidos'
import Inicio from './pages/client/Inicio'
import MisPedidos from './pages/client/MisPedidos'
import ProductosCliente from './pages/client/ProductosCliente'

// Pages - Admin
import Dashboard from './pages/admin/Dashboard'
import GestionCategorias from './pages/admin/GestionCategorias'
import GestionClientes from './pages/admin/GestionClientes'
import GestionEmpleados from './pages/admin/GestionEmpleados'
import GestionInventario from './pages/admin/GestionInventario'
import GestionPedidos from './pages/admin/GestionPedidos'
import GestionPrecios from './pages/admin/GestionPrecios'
import GestionProductos from './pages/admin/GestionProductos'
import GestionRecetas from './pages/admin/GestionRecetas'
import GestionUsuarios from './pages/admin/GestionUsuarios'

// Pages - Auth
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AbilityProvider>
          <CarritoProvider>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <div className="min-h-screen">
                <Navbar />
                <Carrito />
                <Inicio />
              </div>
            } />

            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/registro" element={
              <PublicRoute>
                <Registro />
              </PublicRoute>
            } />

            {/* Client Protected Routes */}
            <Route path="/menu" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Navbar />
                  <Carrito />
                  <ProductosCliente />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/mis-pedidos" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Navbar />
                  <Carrito />
                  <MisPedidos />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/historial-pedidos" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Navbar />
                  <Carrito />
                  <HistorialPedidos />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/contacto" element={
              <ProtectedRoute>
                <div className="min-h-screen">
                  <Navbar />
                  <Carrito />
                  <Contacto />
                </div>
              </ProtectedRoute>
            } />
            
            {/* Admin Protected Routes - Permissions managed by CASL within components */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pedidos" element={<GestionPedidos />} />
              <Route path="productos" element={<GestionProductos />} />
              <Route path="recetas" element={<GestionRecetas />} />
              <Route path="categorias" element={<GestionCategorias />} />
              <Route path="inventario" element={<GestionInventario />} />
              <Route path="precios" element={<GestionPrecios />} />
              <Route path="clientes" element={<GestionClientes />} />
              <Route path="empleados" element={<GestionEmpleados />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
            </Route>
          </Routes>
          </CarritoProvider>
        </AbilityProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
