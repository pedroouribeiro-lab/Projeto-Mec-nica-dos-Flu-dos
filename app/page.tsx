"use client";

import { useState, type CSSProperties } from "react";

type Resultado = {
  vazaoM3s: number;
  areaM2: number;
  areaMm2: number;
  velocidade: number;
};

function lerNumero(texto: string): number {
  return parseFloat(texto.replace(",", "."));
}

export default function AnaliseHidraulicaPage() {
  const [vazao, setVazao] = useState<string>("");
  const [diametro, setDiametro] = useState<string>("");
  const [comprimento, setComprimento] = useState<string>("");
  const [rugosidade, setRugosidade] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function calcular() {
    const q = lerNumero(vazao);
    const d = lerNumero(diametro);
    const l = lerNumero(comprimento);
    const e = lerNumero(rugosidade);

    if (isNaN(q) || isNaN(d) || isNaN(l) || isNaN(e)) {
      setErro("Preencha todos os campos com valores numéricos.");
      setResultado(null);
      return;
    }
    if (q <= 0) {
      setErro("A vazão deve ser maior que zero.");
      setResultado(null);
      return;
    }
    if (d <= 0) {
      setErro("O diâmetro interno deve ser maior que zero.");
      setResultado(null);
      return;
    }
    if (l <= 0) {
      setErro("O comprimento deve ser maior que zero.");
      setResultado(null);
      return;
    }
    if (e < 0) {
      setErro("A rugosidade não pode ser negativa.");
      setResultado(null);
      return;
    }
    if (e >= d) {
      setErro("A rugosidade deve ser menor que o diâmetro interno.");
      setResultado(null);
      return;
    }

    // Conversões de unidade
    const vazaoM3s = q / 3600; // m³/h -> m³/s
    const diametroM = d / 1000; // mm -> m

    // 1. Área da tubulação: A = π × D² / 4
    const areaM2 = (Math.PI * diametroM * diametroM) / 4;

    // 2. Velocidade: V = Q / A
    const velocidade = vazaoM3s / areaM2;

    setErro("");
    setResultado({
      vazaoM3s: vazaoM3s,
      areaM2: areaM2,
      areaMm2: areaM2 * 1000000,
      velocidade: velocidade,
    });
  }

  function limpar() {
    setVazao("");
    setDiametro("");
    setComprimento("");
    setRugosidade("");
    setErro("");
    setResultado(null);
  }

  const cardStyle: CSSProperties = {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontSize: "13px",
    color: "#9ca3af",
    marginBottom: "6px",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#0b1220",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#f9fafb",
    fontSize: "15px",
    outline: "none",
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  };

  const botaoPrimario: CSSProperties = {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    cursor: "pointer",
  };

  const botaoSecundario: CSSProperties = {
    backgroundColor: "transparent",
    color: "#9ca3af",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "14px",
    cursor: "pointer",
    marginLeft: "12px",
  };

  const resultadoBox: CSSProperties = {
    backgroundColor: "#0b1220",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    padding: "18px",
  };

  const resultadoTitulo: CSSProperties = {
    fontSize: "13px",
    color: "#9ca3af",
    marginBottom: "8px",
  };

  const resultadoValor: CSSProperties = {
    fontSize: "28px",
    fontWeight: 700,
    color: "#60a5fa",
  };

  const resultadoUnidade: CSSProperties = {
    fontSize: "14px",
    color: "#9ca3af",
    marginLeft: "6px",
    fontWeight: 400,
  };

  return (
    <div style={{ padding: "32px", color: "#f9fafb" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 6px 0" }}>
        Análise Hidráulica
      </h1>
      <p style={{ color: "#9ca3af", margin: "0 0 28px 0", fontSize: "14px" }}>
        Informe os dados da tubulação para calcular área e velocidade do fluido.
      </p>

      <div style={cardStyle}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 18px 0" }}>
          Dados de entrada
        </h2>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Vazão (m³/h)</label>
            <input
              type="text"
              inputMode="decimal"
              value={vazao}
              onChange={(ev) => setVazao(ev.target.value)}
              placeholder="Ex.: 100"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Diâmetro interno (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={diametro}
              onChange={(ev) => setDiametro(ev.target.value)}
              placeholder="Ex.: 100"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Comprimento (m)</label>
            <input
              type="text"
              inputMode="decimal"
              value={comprimento}
              onChange={(ev) => setComprimento(ev.target.value)}
              placeholder="Ex.: 50"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Rugosidade (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={rugosidade}
              onChange={(ev) => setRugosidade(ev.target.value)}
              placeholder="Ex.: 0.046"
              style={inputStyle}
            />
          </div>
        </div>

        {erro !== "" && (
          <p style={{ color: "#f87171", fontSize: "14px", marginTop: "16px" }}>
            {erro}
          </p>
        )}

        <div style={{ marginTop: "24px" }}>
          <button type="button" onClick={calcular} style={botaoPrimario}>
            CALCULAR
          </button>
          <button type="button" onClick={limpar} style={botaoSecundario}>
            Limpar
          </button>
        </div>
      </div>

      {resultado !== null && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 18px 0" }}>
            Resultados
          </h2>

          <div style={gridStyle}>
            <div style={resultadoBox}>
              <div style={resultadoTitulo}>Área da tubulação</div>
              <div style={resultadoValor}>
                {resultado.areaM2.toFixed(6)}
                <span style={resultadoUnidade}>m²</span>
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
                = {resultado.areaMm2.toFixed(1)} mm²
              </div>
            </div>

            <div style={resultadoBox}>
              <div style={resultadoTitulo}>Velocidade do fluido</div>
              <div style={resultadoValor}>
                {resultado.velocidade.toFixed(3)}
                <span style={resultadoUnidade}>m/s</span>
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
                Vazão = {resultado.vazaoM3s.toFixed(6)} m³/s
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
