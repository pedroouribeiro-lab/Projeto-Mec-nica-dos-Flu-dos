import Link from "next/link";
 
export const metadata = {
  title: "HydroCalc Pro",
  description: "Hydraulic Engineering Software",
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          backgroundColor: "#0F172A",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
          }}
        >
          <aside
            style={{
              width: "260px",
              backgroundColor: "#1E293B",
              padding: "20px",
              color: "white",
            }}
          >
            <h2>HydroCalc Pro</h2>
 
            <hr />
 
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              /Dashboard</Link>
 
              /novo-projeto
                Novo Projeto
              </Link>
 
              /analise-hidraulica
                Análise Hidráulica
              </Link>
 
              /resultados
                Resultados
              </Link>
 
              /memoria-calculo
                Memória de Cálculo
              </Link>
 
              /relatorios
                Relatórios
              </Link>
            </nav>
          </aside>
 
          <main
            style={{
              flex: 1,
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
