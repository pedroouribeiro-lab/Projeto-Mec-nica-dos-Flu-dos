import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
export default function Relatorios() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#0f172a",
        color: "white",
      }}
    >
      <h1>Relatórios</h1>
 
      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        <h2>HydroCalc Pro</h2>
 
        <p>Relatório Executivo</p>
 
        <ul>
          <li>Dados de Entrada</li>
          <li>Cálculos</li>
          <li>Resultados</li>
          <li>Conclusões</li>
        </ul>
 
        <button>Gerar Relatório</button>
      </div>
    </main>
  );
}
