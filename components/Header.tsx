export default function Header() {
  return (
    <div
      style={{
        background: "#1E293B",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>
          HydroCalc Pro
        </h2>
 
        <p
          style={{
            margin: 0,
            color: "#94A3B8",
          }}
        >
          Advanced Pumping System Design & Analysis Software
        </p>
      </div>
 
      <div
        style={{
          background: "#2563EB",
          padding: "10px 16px",
          borderRadius: "10px",
          fontWeight: "bold",
        }}
      >
        ONLINE
      </div>
    </div>
  );
}
