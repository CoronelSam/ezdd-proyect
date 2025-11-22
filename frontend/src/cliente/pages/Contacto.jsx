import { useState } from "react";

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const handleEnviar = () => { alert("Mensaje enviado!"); setForm({ nombre: "", email: "", mensaje: "" }); };
  return (
    <div className="page-container">
      <h2>Contacto</h2>
      <div className="form warm-card">
        <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}/>
        <input placeholder="Correo" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
        <textarea placeholder="Mensaje" value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })}/>
        <button onClick={handleEnviar}>Enviar</button>
      </div>
    </div>
  );
}
