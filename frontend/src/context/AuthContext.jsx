import { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [rol, setRol] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  const login = (user, pass) => {
    if (user === "admin" && pass === "1234") {
      setRol("admin");
      setIsLogged(true);
      return true;
    }
    if (user === "cliente" && pass === "1234") {
      setRol("cliente");
      setIsLogged(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRol(null);
    setIsLogged(false);
  };

  return (
    <AuthContext.Provider value={{ rol, isLogged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
