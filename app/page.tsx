export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>HydroCalc Pro</h1>
 
      <p>Advanced Pumping System Design & Analysis Software</p>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Vazão</h3>
          <p>0 m³/h</p>
        </div>
 
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Velocidade</h3>
          <p>0 m/s</p>
        </div>
 
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Reynolds</h3>
          <p>0</p>
        </div>
 
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>HMT</h3>
          <p>0 mca</p>
        </div>
      </div>
 
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "30px",
        }}
      >
        <h2>Módulos Planejados</h2>
 
        <ul>
          <li>Novo Projeto</li>
          <li>Análise Hidráulica</li>
          <li>Resultados</li>
          <li>Memória de Cálculo</li>
          <li>Relatórios</li>
        </ul>
      </div>
    </main>
  );
}
 
