import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GestionPedidos() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestión de Pedidos</h1>
      <p>Aquí puedes ver, actualizar y gestionar los pedidos de los clientes.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default GestionPedidos;
