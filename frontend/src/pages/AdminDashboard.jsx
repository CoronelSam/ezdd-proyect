import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Panel del Administrador</h1>
      <p>Gestiona el menú, pedidos y clientes.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default AdminDashboard;
