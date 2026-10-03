export default function AnaliseHidraulica() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#0f172a",
        color: "white",
      }}
    >
      <h1>Análise Hidráulica</h1>
 
      <div
        style={{
          display: "grid",
          gap: "15px",
          maxWidth: "600px",
          marginTop: "30px",
        }}
      >
        <input placeholder="Vazão (m³/h)" />
        <input placeholder="Diâmetro da Tubulação (mm)" />
        <input placeholder="Comprimento da Tubulação (m)" />
        <input placeholder="Rugosidade (mm)" />
        <input placeholder="Altura de Recalque (m)" />
        <input placeholder="Altura de Sucção (m)" />
 
        <button>Calcular</button>
      </div>
    </main>
  );
}
 
