import AdminNavbar from "../AdminNavbar";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminNavbar />

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
