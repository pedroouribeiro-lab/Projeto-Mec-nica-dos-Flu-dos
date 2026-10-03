import Link from "next/link";
 
export default function Sidebar() {
  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "18px",
  };
 
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
 
      <hr />
 
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "25px",
          marginTop: "25px",
        }}
      >
        /
          🏠 Dashboard
        </Link>
 
        /novo-projeto
          📁 Novo Projeto
        </Link>
 
        /analise-hidraulica
          🌊 Análise Hidráulica
        </Link>
 
        /resultados
          📊 Resultados
        </Link>
 
        /memoria-calculo
          🧮 Memória de Cálculo
        </Link>
 
        /relatorios
          📄 Relatórios
        </Link>
      </div>
    </div>
  );
}
