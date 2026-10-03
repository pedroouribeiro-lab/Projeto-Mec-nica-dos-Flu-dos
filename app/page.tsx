import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardCard from "../components/DashboardCard";
 
export default function HomePage() {
  return (
    <>
      <Sidebar />
 
      <main
        style={{
          marginLeft: "260px",
          minHeight: "100vh",
          background: "#0F172A",
          color: "white",
          padding: "30px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Header />
 
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <DashboardCard titulo="🌊 Vazão" valor="0 m³/h" />
          <DashboardCard titulo="⚡ Velocidade" valor="0 m/s" />
          <DashboardCard titulo="📈 Reynolds" valor="0" />
          <DashboardCard titulo="🚀 HMT" valor="0 mca" />
        </div>
 
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#1E293B",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2>Dashboard Executivo</h2>
 
            <p style={{ color: "#CBD5E1" }}>
              Plataforma para análise hidráulica e dimensionamento
              de sistemas de bombeamento.
            </p>
 
            <ul>
              <li>✅ Número de Reynolds</li>
              <li>✅ Darcy-Weisbach</li>
              <li>✅ Swamee-Jain</li>
              <li>✅ Perdas Distribuídas</li>
              <li>✅ Perdas Localizadas</li>
              <li>✅ HMT</li>
              <li>✅ NPSH</li>
              <li>✅ Potência Hidráulica</li>
            </ul>
          </div>
 
          <div
            style={{
              background: "#1E293B",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <h2>Módulos</h2>
 
            <p>📁 Novo Projeto</p>
            <p>🌊 Análise Hidráulica</p>
            <p>📊 Resultados</p>
            <p>🧮 Memória de Cálculo</p>
            <p>📄 Relatórios</p>
          </div>
        </div>
      </main>
    </>
  );
}
