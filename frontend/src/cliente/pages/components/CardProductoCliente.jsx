export default function CardProductoCliente({ producto }) {
  return (
    <div className="card-cliente">
      {producto.imagen && (
        <img src={producto.imagen} className="card-img" alt={producto.nombre} />
      )}

      <h3>{producto.nombre}</h3>
      <p>{producto.descripcion}</p>

      <div className="card-info">
        <span>{producto.tamanio}</span>
        <strong>L {producto.precio}</strong>
      </div>

      <button className="btn-add">Agregar al carrito</button>
    </div>
  );
}
