import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { CarritoProvider } from './context/CarritoContext'
import './index.css'

// Components
import AdminLayout from './components/AdminLayout'
import Carrito from './components/Carrito'
import Navbar from './components/Navbar'

// Pages - Client
import Contacto from './pages/client/Contacto'
import Inicio from './pages/client/Inicio'
import MisPedidos from './pages/client/MisPedidos'
import ProductosCliente from './pages/client/ProductosCliente'

// Pages - Admin
import Dashboard from './pages/admin/Dashboard'
import GestionCategorias from './pages/admin/GestionCategorias'
import GestionClientes from './pages/admin/GestionClientes'
import GestionInventario from './pages/admin/GestionInventario'
import GestionPedidos from './pages/admin/GestionPedidos'
import GestionProductos from './pages/admin/GestionProductos'

function App() {
  return (
    <Router>
      <CarritoProvider>
        <Routes>
          {/* Client Routes with Navbar */}
          <Route path="/" element={
            <div className="min-h-screen">
              <Navbar />
              <Carrito />
              <Inicio />
            </div>
          } />
          <Route path="/menu" element={
            <div className="min-h-screen">
              <Navbar />
              <Carrito />
              <ProductosCliente />
            </div>
          } />
          <Route path="/mis-pedidos" element={
            <div className="min-h-screen">
              <Navbar />
              <Carrito />
              <MisPedidos />
            </div>
          } />
          <Route path="/contacto" element={
            <div className="min-h-screen">
              <Navbar />
              <Carrito />
              <Contacto />
            </div>
          } />
          
          {/* Admin Routes with AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pedidos" element={<GestionPedidos />} />
            <Route path="productos" element={<GestionProductos />} />
            <Route path="categorias" element={<GestionCategorias />} />
            <Route path="inventario" element={<GestionInventario />} />
            <Route path="clientes" element={<GestionClientes />} />
          </Route>
        </Routes>
      </CarritoProvider>
    </Router>
  )
}

export default App
