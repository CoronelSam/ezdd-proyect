import { useState } from "react";

export default function PerfilCliente() {
  const [form, setForm] = useState({ nombre: "Cliente", correo: "cliente@example.com", telefono: "", direccion: "" });
  return (
    <div className="page-container">
      <h2>Perfil</h2>
      <div className="form warm-card">
        <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}/>
        <input placeholder="Correo" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })}/>
        <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}/>
        <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })}/>
        <button onClick={() => alert("Perfil actualizado!")}>Guardar</button>
      </div>
    </div>
  );
}
