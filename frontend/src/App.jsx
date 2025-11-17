import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas de login
import Login from "./pages/Login";

// Páginas Admin
import AdminDashboard from "./pages/AdminDashboard";
import GestionMenu from "./pages/GestionMenu";
import GestionPedidos from "./pages/GestionPedidos";

// Páginas Cliente
import ClientHome from "./pages/ClientHome";
import MenuCliente from "./pages/MenuCliente";
import PerfilCliente from "./pages/PerfilCliente";

// Ruta protegida
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Rutas Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolNecesario="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute rolNecesario="admin">
              <GestionMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedRoute rolNecesario="admin">
              <GestionPedidos />
            </ProtectedRoute>
          }
        />

        {/* Rutas Cliente */}
        <Route
          path="/cliente"
          element={
            <ProtectedRoute rolNecesario="cliente">
              <ClientHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/menu"
          element={
            <ProtectedRoute rolNecesario="cliente">
              <MenuCliente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/perfil"
          element={
            <ProtectedRoute rolNecesario="cliente">
              <PerfilCliente />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
