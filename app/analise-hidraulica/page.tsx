"use client";

import { useState, type CSSProperties } from "react";

type PontoAgua = { t: number; rho: number; nu: number };

// Água a pressão atmosférica: temperatura (°C), densidade (kg/m³), viscosidade cinemática (m²/s)
const TABELA_AGUA: PontoAgua[] = [
  { t: 0, rho: 999.8, nu: 1.787e-6 },
  { t: 5, rho: 1000.0, nu: 1.519e-6 },
  { t: 10, rho: 999.7, nu: 1.307e-6 },
  { t: 15, rho: 999.1, nu: 1.139e-6 },
  { t: 20, rho: 998.2, nu: 1.004e-6 },
  { t: 25, rho: 997.0, nu: 0.893e-6 },
  { t: 30, rho: 995.7, nu: 0.801e-6 },
  { t: 35, rho: 994.0, nu: 0.724e-6 },
  { t: 40, rho: 992.2, nu: 0.658e-6 },
  { t: 45, rho: 990.2, nu: 0.602e-6 },
  { t: 50, rho: 988.0, nu: 0.553e-6 },
  { t: 55, rho: 985.7, nu: 0.511e-6 },
  { t: 60, rho: 983.2, nu: 0.474e-6 },
  { t: 65, rho: 980.5, nu: 0.441e-6 },
  { t: 70, rho: 977.8, nu: 0.413e-6 },
  { t: 75, rho: 974.9, nu: 0.387e-6 },
  { t: 80, rho: 971.8, nu: 0.364e-6 },
  { t: 85, rho: 968.6, nu: 0.343e-6 },
  { t: 90, rho: 965.3, nu: 0.326e-6 },
  { t: 95, rho: 961.9, nu: 0.309e-6 },
  { t: 100, rho: 958.4, nu: 0.294e-6 },
];

type Resultado = {
  vazaoM3s: number;
  areaM2: number;
  areaMm2: number;
  velocidade: number;
  fluidoNome: string;
  rho: number;
  nu: number;
  reynolds: number;
  regime: string;
  corRegime: string;
};

function lerNumero(texto: string): number {
  return parseFloat(texto.replace(",", "."));
}

function propriedadesAgua(temperatura: number): { rho: number; nu: number } {
  for (let i = 0; i < TABELA_AGUA.length - 1; i++) {
    const a = TABELA_AGUA[i];
    const b = TABELA_AGUA[i + 1];
    if (temperatura <= b.t) {
      const fracao = (temperatura - a.t) / (b.t - a.t);
      return {
        rho: a.rho + fracao * (b.rho - a.rho),
        nu: a.nu + fracao * (b.nu - a.nu),
      };
    }
  }
  const ultimo = TABELA_AGUA[TABELA_AGUA.length - 1];
  return { rho: ultimo.rho, nu: ultimo.nu };
}

function classificarRegime(re: number): { regime: string; cor: string } {
  if (re < 2000) {
    return { regime: "Laminar", cor: "#34d399" };
  }
  if (re <= 4000) {
    return { regime: "Transição", cor: "#fbbf24" };
  }
  return { regime: "Turbulento", cor: "#60a5fa" };
}

export default function AnaliseHidraulicaPage() {
  const [vazao, setVazao] = useState<string>("");
  const [diametro, setDiametro] = useState<string>("");
  const [comprimento, setComprimento] = useState<string>("");
  const [rugosidade, setRugosidade] = useState<string>("");
  const [fluido, setFluido] = useState<string>("agua");
  const [temperatura, setTemperatura] = useState<string>("20");
  const [nomeFluido, setNomeFluido] = useState<string>("");
  const [densidade, setDensidade] = useState<string>("");
  const [viscDinamica, setViscDinamica] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function falhar(mensagem: string) {
    setErro(mensagem);
    setResultado(null);
  }

  function calcular() {
    const q = lerNumero(vazao);
    const d = lerNumero(diametro);
    const l = lerNumero(comprimento);
    const e = lerNumero(rugosidade);

    if (isNaN(q) || isNaN(d) || isNaN(l) || isNaN(e)) {
      falhar("Preencha todos os campos da tubulação com valores numéricos.");
      return;
    }
    if (q <= 0) {
      falhar("A vazão deve ser maior que zero.");
      return;
    }
    if (d <= 0) {
      falhar("O diâmetro interno deve ser maior que zero.");
      return;
    }
    if (l <= 0) {
      falhar("O comprimento deve ser maior que zero.");
      return;
    }
    if (e < 0) {
      falhar("A rugosidade não pode ser negativa.");
      return;
    }
    if (e >= d) {
      falhar("A rugosidade deve ser menor que o diâmetro interno.");
      return;
    }

    // Propriedades do fluido
    let rho = 0;
    let nu = 0;
    let fluidoNome = "";

    if (fluido === "agua") {
      const temp = lerNumero(temperatura);
      if (isNaN(temp)) {
        falhar("Informe a temperatura da água.");
        return;
      }
      if (temp < 0 || temp > 100) {
        falhar("A temperatura da água deve estar entre 0 e 100 °C.");
        return;
      }
      const prop = propriedadesAgua(temp);
      rho = prop.rho;
      nu = prop.nu;
      fluidoNome = "Água a " + temp + " °C";
    } else {
      const rhoDigitado = lerNumero(densidade);
      const muDigitado = lerNumero(viscDinamica);
      if (isNaN(rhoDigitado) || isNaN(muDigitado)) {
        falhar("Informe a densidade e a viscosidade dinâmica do fluido.");
        return;
      }
      if (rhoDigitado <= 0 || muDigitado <= 0) {
        falhar("Densidade e viscosidade dinâmica devem ser maiores que zero.");
        return;
      }
      rho = rhoDigitado;
      nu = muDigitado / 1000 / rhoDigitado; // mPa·s -> Pa·s, depois ν = μ / ρ
      fluidoNome = nomeFluido.trim() !== "" ? nomeFluido.trim() : "Outro fluido";
    }

    // Conversões de unidade
    const vazaoM3s = q / 3600;
    const diametroM = d / 1000;

    // 1. Área: A = π × D² / 4
    const areaM2 = (Math.PI * diametroM * diametroM) / 4;

    // 2. Velocidade: V = Q / A
    const velocidade = vazaoM3s / areaM2;

    // 3. Reynolds: Re = V × D / ν
    const reynolds = (velocidade * diametroM) / nu;
    const classe = classificarRegime(reynolds);

    setErro("");
    setResultado({
      vazaoM3s: vazaoM3s,
      areaM2: areaM2,
      areaMm2: areaM2 * 1000000,
      velocidade: velocidade,
      fluidoNome: fluidoNome,
      rho: rho,
      nu: nu,
      reynolds: reynolds,
      regime: classe.regime,
      corRegime: classe.cor,
    });
  }

  function limpar() {
    setVazao("");
    setDiametro("");
    setComprimento("");
    setRugosidade("");
    setFluido("agua");
    setTemperatura("20");
    setNomeFluido("");
    setDensidade("");
    setViscDinamica("");
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

  const tituloSecao: CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 18px 0",
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

  const resultadoNota: CSSProperties = {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "6px",
  };

  return (
    <div style={{ padding: "32px", color: "#f9fafb" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 6px 0" }}>
        Análise Hidráulica
      </h1>
      <p style={{ color: "#9ca3af", margin: "0 0 28px 0", fontSize: "14px" }}>
        Informe os dados da tubulação e do fluido para calcular área, velocidade
        e número de Reynolds.
      </p>

      <div style={cardStyle}>
        <h2 style={tituloSecao}>Dados da tubulação</h2>

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
      </div>

      <div style={cardStyle}>
        <h2 style={tituloSecao}>Fluido</h2>

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Tipo de fluido</label>
            <select
              value={fluido}
              onChange={(ev) => setFluido(ev.target.value)}
              style={inputStyle}
            >
              <option value="agua">Água</option>
              <option value="outro">Outro fluido (inserir dados)</option>
            </select>
          </div>

          {fluido === "agua" && (
            <div>
              <label style={labelStyle}>Temperatura da água (°C)</label>
              <input
                type="text"
                inputMode="decimal"
                value={temperatura}
                onChange={(ev) => setTemperatura(ev.target.value)}
                placeholder="Ex.: 20"
                style={inputStyle}
              />
            </div>
          )}

          {fluido === "outro" && (
            <>
              <div>
                <label style={labelStyle}>Nome do fluido (opcional)</label>
                <input
                  type="text"
                  value={nomeFluido}
                  onChange={(ev) => setNomeFluido(ev.target.value)}
                  placeholder="Ex.: Óleo hidráulico"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Densidade (kg/m³)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={densidade}
                  onChange={(ev) => setDensidade(ev.target.value)}
                  placeholder="Digite o valor"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Viscosidade dinâmica (mPa·s = cP)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={viscDinamica}
                  onChange={(ev) => setViscDinamica(ev.target.value)}
                  placeholder="Digite o valor"
                  style={inputStyle}
                />
              </div>
            </>
          )}
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
          <h2 style={tituloSecao}>Resultados</h2>

          <div style={gridStyle}>
            <div style={resultadoBox}>
              <div style={resultadoTitulo}>Área da tubulação</div>
              <div style={resultadoValor}>
                {resultado.areaM2.toFixed(6)}
                <span style={resultadoUnidade}>m²</span>
              </div>
              <div style={resultadoNota}>
                = {resultado.areaMm2.toFixed(1)} mm²
              </div>
            </div>

            <div style={resultadoBox}>
              <div style={resultadoTitulo}>Velocidade do fluido</div>
              <div style={resultadoValor}>
                {resultado.velocidade.toFixed(3)}
                <span style={resultadoUnidade}>m/s</span>
              </div>
              <div style={resultadoNota}>
                Vazão = {resultado.vazaoM3s.toFixed(6)} m³/s
              </div>
            </div>

            <div style={resultadoBox}>
              <div style={resultadoTitulo}>Número de Reynolds</div>
              <div style={resultadoValor}>
                {resultado.reynolds.toLocaleString("pt-BR", {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginTop: "6px",
                  color: resultado.corRegime,
                }}
              >
                Regime {resultado.regime}
              </div>
            </div>

            <div style={resultadoBox}>
              <div style={resultadoTitulo}>Fluido utilizado</div>
              <div
                style={{ fontSize: "18px", fontWeight: 700, color: "#f9fafb" }}
              >
                {resultado.fluidoNome}
              </div>
              <div style={resultadoNota}>
                ρ = {resultado.rho.toFixed(1)} kg/m³
              </div>
              <div style={resultadoNota}>
                ν = {(resultado.nu * 1000000).toFixed(3)} mm²/s
              </div>
            </div>
          </div>

          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px" }}>
            Classificação: Re &lt; 2000 laminar; 2000 a 4000 transição; Re &gt;
            4000 turbulento.
          </p>
        </div>
      )}
    </div>
  );
}
