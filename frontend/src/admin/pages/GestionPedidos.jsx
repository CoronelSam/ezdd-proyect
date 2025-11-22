import { useEffect, useState } from "react";
import { getPedidos, actualizarPedido } from "../../services/pedidoService";

export default function GestionPedidos() {
  const [pedidos, setPedidos] = useState([]);
  useEffect(() => { (async () => setPedidos((await getPedidos()).data))(); }, []);

  const siguienteEstado = async (pedido) => {
    let next = pedido.estado === "Pendiente" ? "En preparación" : "Entregado";
    await actualizarPedido(pedido.id, { estado: next });
    setPedidos((await getPedidos()).data);
  };

  return (
    <div className="page-container">
      <h1>Bienvenido a EZDD Restaurante - Admin</h1>
      <h2>Gestionar Pedidos</h2>
      <div className="pedidos-grid">
        {pedidos.map(p => (
          <div key={p.id} className={`pedido-card estado-${p.estado.replace(" ", "")}`}>
            <h3>Pedido #{p.id}</h3>
            <p>Cliente: {p.cliente}</p>
            <p>Total: L {p.total}</p>
            <p>Estado: {p.estado}</p>
            {p.estado !== "Entregado" && <button onClick={() => siguienteEstado(p)}>Siguiente estado</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

