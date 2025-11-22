// src/admin/components/ModalConfirm.jsx
export default function ModalConfirm({ open, title, children, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h3>{title}</h3>
        <p>{children}</p>
        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button onClick={onConfirm} style={{ background: "green", color: "white" }}>Confirmar</button>
          <button onClick={onCancel} style={{ background: "gray", color: "white" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
