export default function CardProductoAdmin({ producto, onEdit, onDelete }) {
  return (
    <div className="card-admin">
      <h3>{producto.nombre}</h3>
      <p>{producto.descripcion}</p>

      <div className="card-admin-footer">
        <button onClick={() => onEdit(producto)} className="btn-edit">Editar</button>
        <button onClick={() => onDelete(producto)} className="btn-delete">Eliminar</button>
      </div>
    </div>
  );
}



