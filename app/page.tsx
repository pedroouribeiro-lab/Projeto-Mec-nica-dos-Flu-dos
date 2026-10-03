export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0F172A",
        color: "white",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>HydroCalc Pro</h1>
 
      <p>
        Advanced Pumping System Design & Analysis Software
      </p>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Vazão</h3>
          <p>0 m³/h</p>
        </div>
 
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Velocidade</h3>
          <p>0 m/s</p>
        </div>
 
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Reynolds</h3>
          <p>0</p>
        </div>
 
        <div
          style={{
            background: "#1E293B",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>HMT</h3>
          <p>0 mca</p>
        </div>
      </div>
    </main>
  );
}
 
