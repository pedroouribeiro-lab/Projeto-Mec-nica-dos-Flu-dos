"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS: { href: string; rotulo: string }[] = [
  { href: "/", rotulo: "🏠 Dashboard" },
  { href: "/novo-projeto", rotulo: "📁 Novo Projeto" },
  { href: "/analise-hidraulica", rotulo: "🌊 Análise Hidráulica" },
  { href: "/cavitacao", rotulo: "💧 Cavitação" },
  { href: "/resultados", rotulo: "📊 Resultados" },
  { href: "/memoria-calculo", rotulo: "🧮 Memória de Cálculo" },
  { href: "/relatorios", rotulo: "📄 Relatórios" },
];

export default function Sidebar() {
  const caminho = usePathname();

  function ativo(href: string): boolean {
    if (href === "/") {
      return caminho === "/";
    }
    return caminho === href || caminho.startsWith(href + "/");
  }

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

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "25px",
        }}
      >
        {ITENS.map((item) => {
          const selecionado = ativo(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: selecionado ? 700 : 400,
                color: selecionado ? "#ffffff" : "#9ca3af",
                backgroundColor: selecionado ? "#3B82F6" : "transparent",
              }}
            >
              {item.rotulo}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
