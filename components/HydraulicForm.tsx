export default function HydraulicForm() {
  return (
    <div
      style={{
        background: "#1E293B",
        padding: "24px",
        borderRadius: "16px",
      }}
    >
      <h2>Análise Hidráulica</h2>
 
      <div
        style={{
          display: "grid",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        <input placeholder="Vazão (m³/h)" />
 
        <input placeholder="Diâmetro Interno (mm)" />
 
        <input placeholder="Comprimento da Tubulação (m)" />
 
        <input placeholder="Rugosidade (mm)" />
 
        <button
          style={{
            background: "#2563EB",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          CALCULAR
        </button>
      </div>
    </div>
  );
}
