import './index.css'

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-linear-to-b from-brand-50 to-white">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-2xl p-8">
        <header className="mb-6">
          <h1 className="font-display text-4xl text-brand-700 mb-2">Nombre del Restaurante</h1>
          <p className="text-sm text-neutral-500">Una breve descripción usando la fuente sans para el cuerpo.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Carta destacada</h2>
          <p className="text-base text-neutral-500">
            Platos seleccionados con ingredientes frescos y recetas tradicionales.
          </p>

          <div className="flex gap-3">
            <button className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 transition">
              Reservar mesa
            </button>
            <button className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-50 transition">
              Ver menú
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
