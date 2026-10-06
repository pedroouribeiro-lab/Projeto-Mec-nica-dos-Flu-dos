import Sidebar from "../components/Sidebar";

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
        <Sidebar />
        <main
          style={{
            marginLeft: "260px",
            minHeight: "100vh",
            color: "white",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
