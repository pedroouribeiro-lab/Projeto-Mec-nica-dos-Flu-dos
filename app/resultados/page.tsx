export default function Resultados() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#0f172a",
        color: "white",
      }}
    >
      <h1>Resultados</h1>
 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div>
          <h3>Reynolds</h3>
          <p>0</p>
        </div>
 
        <div>
          <h3>Velocidade</h3>
          <p>0 m/s</p>
        </div>
 
        <div>
          <h3>Perda de Carga</h3>
          <p>0 mca</p>
        </div>
 
        <div>
          <h3>HMT</h3>
          <p>0 mca</p>
        </div>
      </div>
    </main>
  );
}
 
