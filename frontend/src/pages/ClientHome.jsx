import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ClientHome() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido Cliente</h1>
      <p>Aquí puedes ver el menú y realizar tus pedidos.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default ClientHome;
