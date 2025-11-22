import { Link } from 'react-router-dom'
import '../styles.css'

export default function Navbar() {
  return (
    <nav className="navbar warm-navbar">
      <div className="nav-left">El Sazón de Doris</div>
      <div className="nav-right">
        <Link to="/menu-gestion">Gestionar menú</Link>
        <Link to="/pedidos">Pedidos</Link>
        <Link to="/menu-cliente"> Inicio</Link>
        <Link to="/perfil">Perfil</Link>
      </div>
    </nav>
  )
}
