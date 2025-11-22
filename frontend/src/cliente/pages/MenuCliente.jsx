import { useState, useEffect } from "react";
import { getProductos } from "../../services/productoService";
import CardProductoCliente from "./components/CardProductoCliente";
import CategoriaSelector from "./components/CategoriaSelector";

export default function MenuCliente() {
  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState("Todo");

  useEffect(() => {
    getProductos().then(setProductos);
  }, []);

  const filtrados = categoria === "Todo"
    ? productos
    : productos.filter(p => p.categoria === categoria);

  return (
    <div>
      <h2>Menú</h2>

      <CategoriaSelector selected={categoria} onChange={setCategoria} />

      <div className="grid-cliente">
        {filtrados.map(p => (
          <CardProductoCliente key={p.id} producto={p} />
        ))}
      </div>
    </div>
  );
}
