export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "36px",
          marginBottom: "10px",
        }}
      >
        HydroCalc Pro
      </h1>
 
      <p
        style={{
          color: "#CBD5E1",
          marginBottom: "40px",
        }}
      >
        Advanced Pumping System Design & Analysis Software
      </p>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Vazão</h3>
          <h2>0 m³/h</h2>
        </div>
 
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Velocidade</h3>
          <h2>0 m/s</h2>
        </div>
 
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Reynolds</h3>
          <h2>0</h2>
        </div>
 
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>HMT</h3>
          <h2>0 mca</h2>
        </div>
      </div>
 
      <div
        style={{
          marginTop: "40px",
          background: "#1E293B",
          padding: "25px",
          borderRadius: "12px",
        }}
      >
        <h2>Painel de Engenharia</h2>
 
        <p>
     
