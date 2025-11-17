import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    const ok = login(user, pass);
    if (!ok) return setError("Usuario o contraseña incorrectos");

    if (user === "admin") navigate("/admin");
    else navigate("/cliente");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Iniciar Sesión</h1>
      <input
        placeholder="Usuario"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        style={{ display: "block", margin: "1rem 0" }}
      />
      <input
        placeholder="Contraseña"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        style={{ display: "block", margin: "1rem 0" }}
      />
      <button onClick={handleLogin}>Entrar</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
