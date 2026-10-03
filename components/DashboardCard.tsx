type DashboardCardProps = {
  titulo: string;
  valor: string;
};
 
export default function DashboardCard({
  titulo,
  valor,
}: DashboardCardProps) {
  return (
    <div
      style={{
        background: "#1E293B",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          color: "#94A3B8",
        }}
      >
        {titulo}
      </h3>
 
      <h2>{valor}</h2>
    </div>
  );
}
