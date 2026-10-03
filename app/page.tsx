export default function HomePage() {
  const card = {
    background: "#1e293b",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
  };
 
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#fff",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "42px",
            }}
          >
            HydroCalc Pro
          </h1>
 
          <p
            style={{
              color: "#94a3b8",
              marginTop: "10px",
            }}
          >
            Advanced Pumping System Design & Analysis Software
          </p>
        </div>
 
        <div
          style={{
            background: "#2563eb",
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          ONLINE
        </div>
      </div>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={card}>
          <h3>🌊 Vazão</h3>
          <h2>0 m³/h</h2>
        </div>
 
        <div style={card}>
          <h3>⚡ Velocidade</h3>
          <h2>0 m/s</h2>
        </div>
 
        <div style={card}>
          <h3>📈 Reynolds</h3>
          <h2>0</h2>
        </div>
 
        <div style={card}>
          <h3>🚀 HMT</h3>
          <h2>0 mca</h2>
        </div>
      </div>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
        }}
      >
        <div style={card}>
          <h2>Painel de Engenharia</h2>
 
          <p style={{ color: "#cbd5e1" }}>
            Plataforma preparada para análises hidráulicas profissionais.
          </p>
 
          <ul>
            <li>✅ Reynolds</li>
            <li>✅ Darcy-Weisbach</li>
            <li>✅ Swamee-Jain</li>
            <li>✅ Perdas Localizadas</li>
            <li>✅ Perdas Distribuídas</li>
            <li>✅ HMT</li>
            <li>✅ NPSH</li>
            <li>✅ Potência Hidráulica</li>
          </ul>
        </div>
 
        <div style={card}>
          <h2>Módulos</h2>
 
          <p>📁 Novo Projeto</p>
          <p>🌊 Análise Hidráulica</p>
          <p>📊 Resultados</p>
          <p>🧮 Memória de Cálculo</p>
          <p>📄 Relatórios</p>
        </div>
      </div>
    </main>
  );
}
