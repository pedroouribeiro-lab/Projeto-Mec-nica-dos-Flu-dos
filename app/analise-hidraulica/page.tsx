import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import HydraulicForm from "../../components/HydraulicForm";
 
export default function AnaliseHidraulica() {
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
 
        <HydraulicForm />
      </main>
    </>
  );
}
