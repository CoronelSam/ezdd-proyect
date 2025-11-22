import { Link } from "react-router-dom";

export default function ClienteNavbar() {
  return (
    <nav className="cliente-nav">
      <Link to="/cliente">Inicio</Link>
      <Link to="/cliente/menu">Menú</Link>
      <Link to="/cliente/contacto">Contacto</Link>
      <Link to="/cliente/perfil">Perfil</Link>
    </nav>
  );
}
