export default function Sidebar() {
  return (
    <div
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "25px",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#3B82F6",
        }}
      >
        HydroCalc Pro
      </h2>
 
      <hr
        style={{
          borderColor: "#374151",
        }}
      />
 
      <div
        style={{
          marginTop: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <p>🏠 Dashboard</p>
        <p>📁 Novo Projeto</p>
        <p>🌊 Análise Hidráulica</p>
        <p>📊 Resultados</p>
        <p>🧮 Memória de Cálculo</p>
        <p>📄 Relatórios</p>
      </div>
    </div>
  );
}
 
