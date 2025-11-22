import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="admin-nav">
      <h2>Panel Administrativo</h2>

      <div>
        <Link to="/admin/menu">Gestionar Menú</Link>
        <Link to="/admin/pedidos">Gestionar Pedidos</Link>
      </div>
    </nav>
  );
}
