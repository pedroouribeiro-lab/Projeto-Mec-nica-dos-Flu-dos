export const metadata = {
  title: "HydroCalc Pro",
  description: "Sistema de análise hidráulica",
};
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
