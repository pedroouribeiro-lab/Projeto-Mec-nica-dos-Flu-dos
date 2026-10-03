export default function HomePage() {
  const cardStyle = {
    backgroundColor: "#1E293B",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  };
 
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0F172A",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "30px",
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
              fontSize: "36px",
            }}
          >
            HydroCalc Pro
          </h1>
 
          <p
            style={{
              color: "#94A3B8",
              marginTop: "8px",
            }}
          >
            Advanced Pumping System Design & Analysis Software
          </p>
        </div>
 
        <div
          style={{
            backgroundColor: "#2563EB",
            padding: "12px 20px",
            borderRadius: "12px",
            fontWeight: "bold",
          }}
        >
          ONLINE
        </div>
      </div>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={cardStyle}>
          <h3>Vazão</h3>
          <h2>0 m³/h</h2>
        </div>
 
        <div style={cardStyle}>
          <h3>Velocidade</h3>
          <h2>0 m/s</h2>
        </div>
 
        <div style={cardStyle}>
          <h3>Reynolds</h3>
          <h2>0</h2>
        </div>
 
        <div style={cardStyle}>
          <h3>HMT</h3>
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
        <div style={cardStyle}>
          <h2>Painel de Engenharia</h2>
 
          <p style={{ color: "#CBD5E1" }}>
            Sistema preparado para:
          </p>
 
          <ul>
            <li>Dimensionamento Hidráulico</li>
            <li>Número de Reynolds</li>
            <li>Darcy-Weisbach</li>
            <li>Swamee-Jain</li>
            <li>Perdas Distribuídas</li>
            <li>Perdas Localizadas</li>
            <li>HMT</li>
            <li>NPSH</li>
            <li>Potência Hidráulica</li>
          </ul>
        </div>
 
        <div style={cardStyle}>
          <h2>Módulos</h2>
 
          <p>✅ Novo Projeto</p>
          <p>✅ Análise Hidráulica</p>
          <p>✅ Resultados</p>
          <p>✅ Memória de Cálculo</p>
          <p>✅ Relatórios</p>
        </div>
      </div>
    </main>
  );
}
