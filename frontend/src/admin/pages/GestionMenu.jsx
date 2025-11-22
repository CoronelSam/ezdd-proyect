import { useState, useEffect } from "react";
import CardProductoAdmin from "./components/CardProductoAdmin.jsx";
import ModalConfirm from "./components/ModalConfirm.jsx";
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from "../../services/productoService";

export default function GestionMenu() {
  const [productos, setProductos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", precio: "", categoria: "Comida", tamanio: "Mediano", imagen: "" });
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const fetch = async () => { const res = await getProductos(); setProductos(res.data); };
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!form.nombre || !form.descripcion || !form.precio) return alert("Rellena todos los campos");
    if (editing) await actualizarProducto(editing.id, form); else await crearProducto(form);
    setForm({ nombre: "", descripcion: "", precio: "", categoria: "Comida", tamanio: "Mediano", imagen: "" });
    setEditing(null); fetch();
  };

  const handleEdit = (p) => { setEditing(p); setForm({ ...p }); };
  const handleDelete = (p) => { setToDelete(p); setShowConfirm(true); };
  const confirmDelete = async () => { await eliminarProducto(toDelete.id); setShowConfirm(false); fetch(); };

  return (
    <div className="page-container">
      <h1>Bienvenido a EZDD Restaurante - Admin</h1>
      <h2>Gestionar Menú</h2>
      <div className="form warm-card">
        <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
        <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
        <input placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} />
        <input placeholder="Tamaño" value={form.tamanio} onChange={e => setForm({ ...form, tamanio: e.target.value })} />
        <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
          <option>Comida</option><option>Bebidas</option><option>Postres</option>
        </select>
        <input placeholder="URL Imagen" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} />
        <div className="form-buttons">
          <button onClick={handleSave}>{editing ? "Actualizar" : "Crear"}</button>
          {editing && <button onClick={() => { setEditing(null); setForm({ nombre: "", descripcion: "", precio: "", categoria: "Comida", tamanio: "Mediano", imagen: "" }); }}>Cancelar</button>}
        </div>
      </div>
      <div className="grid">
        {productos.map(p => <CardProductoAdmin key={p.id} producto={p} onEdit={handleEdit} onDelete={handleDelete} />)}
      </div>
      <ModalConfirm open={showConfirm} title="Eliminar producto" onConfirm={confirmDelete} onCancel={() => setShowConfirm(false)}>
        ¿Eliminar {toDelete?.nombre}?
      </ModalConfirm>
    </div>
  );
}
