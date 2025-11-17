import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function GestionMenu() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Gestión del Menú</h1>
      <p>Aquí puedes agregar, editar o eliminar platos del restaurante.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default GestionMenu;
