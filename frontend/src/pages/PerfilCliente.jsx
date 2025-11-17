import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function PerfilCliente() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Perfil del Cliente</h1>
      <p>Aquí puedes ver y actualizar tus datos personales y preferencias.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default PerfilCliente;
