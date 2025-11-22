import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../admin/pages/AdminLayout";
import GestionMenu from "../admin/pages/GestionMenu";
import GestionPedidos from "../admin/pages/GestionPedidos";

import ClienteLayout from "../cliente/ClienteLayout";
import HomeCliente from "../cliente/pages/HomeCliente";
import MenuCliente from "../cliente/pages/MenuCliente";
import PerfilCliente from "../cliente/pages/PerfilCliente";
import ContactoCliente from "../cliente/pages/Contacto";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas ADMIN */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="menu" element={<GestionMenu />} />
          <Route path="pedidos" element={<GestionPedidos />} />
        </Route>

        {/* Rutas CLIENTE */}
        <Route path="/cliente" element={<ClienteLayout />}>
          <Route index element={<HomeCliente />} />
          <Route path="menu" element={<MenuCliente />} />
          <Route path="perfil" element={<PerfilCliente />} />
          <Route path="contacto" element={<ContactoCliente />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

