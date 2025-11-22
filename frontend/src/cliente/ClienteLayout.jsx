import ClienteNavbar from "./ClienteNavbar";

export default function ClienteLayout({ children }) {
  return (
    <div className="cliente-layout">
      <ClienteNavbar />

      <header className="cliente-banner">
        <h1>🍽️ Restaurante Delicioso</h1>
        <p>Bienvenido, disfruta del mejor sabor</p>
      </header>

      <main className="cliente-content">{children}</main>
    </div>
  );
}
