import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function MenuCliente() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Menú del Restaurante</h1>
      <p>Aquí puedes ver los platos disponibles y realizar pedidos.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default MenuCliente;
