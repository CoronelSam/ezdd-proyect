export default function CategoriaSelector({ selected, onChange }) {
  const categorias = ["Todo", "Comida", "Bebidas", "Postres"];

  return (
    <div className="categoria-selector">
      {categorias.map(cat => (
        <button 
          key={cat}
          className={selected === cat ? "categoria-activa" : ""}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
