import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";
 
export default function HomePage() {
  return (
    <>
      <Sidebar />
 
      <main
        style={{
          marginLeft: "280px",
          minHeight: "100vh",
          background: "#0F172A",
          color: "white",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>HydroCalc Pro</h1>
 
        <p
          style={{
            color: "#94A3B8",
          }}
        >
          Advanced Pumping System Design & Analysis Software
        </p>
 
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <DashboardCard titulo="🌊 Vazão" valor="0 m³/h" />
          <DashboardCard titulo="⚡ Velocidade" valor="0 m/s" />
          <DashboardCard titulo="📈 Reynolds" valor="0" />
          <DashboardCard titulo="🚀 HMT" valor="0 mca" />
        </div>
      </main>
    </>
  );
}
 
