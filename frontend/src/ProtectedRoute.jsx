import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, rolNecesario }) {
  const { isLogged, rol } = useAuth();

  if (!isLogged) return <Navigate to="/" />;
  if (rol !== rolNecesario) return <Navigate to="/" />;

  return children;
}

export default ProtectedRoute;
