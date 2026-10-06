import Sidebar from "../components/Sidebar";
import { ProjetoProvider } from "../components/ProjetoContext";

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
          backgroundColor: "#0F172A",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <ProjetoProvider>
          <Sidebar />
          <main
            style={{
              marginLeft: "310px",
              minHeight: "100vh",
              color: "white",
            }}
          >
            {children}
          </main>
        </ProjetoProvider>
      </body>
    </html>
  );
}
