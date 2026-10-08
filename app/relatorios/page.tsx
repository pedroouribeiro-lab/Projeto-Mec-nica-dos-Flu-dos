"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Aviso, Botao, Pagina, cor, fmt } from "../../components/UI";
import { useProjeto } from "../../components/ProjetoContext";
import {
  calcularProjeto,
  lerNumero,
  type Projeto,
  type ResultadoLinha,
  type ResultadoNpsh,
  type ResultadoProjeto,
} from "../../lib/hidraulica";
import { diametroMinimo, type Limite } from "../../lib/cavitacao";

// ---------------------------------------------------------------------------
// Estilo da folha (papel branco, pensado para imprimir)
// ---------------------------------------------------------------------------

const papel = {
  texto: "#111827",
  suave: "#4b5563",
  linha: "#d1d5db",
  linhaFina: "#e5e7eb",
  azul: "#1d4ed8",
  fundoSuave: "#f3f4f6",
};

const fonte = '"Segoe UI", Arial, Helvetica, sans-serif';

const CSS_IMPRESSAO =
  "@media screen { #rel-print { display: none; } }\n" +
  "@media print {\n" +
  "  @page { size: A4; margin: 14mm; }\n" +
  "  html, body { background: #ffffff !important; }\n" +
  "  body > *:not(#rel-print) { display: none !important; }\n" +
  "  #rel-print { display: block !important; }\n" +
  "  #rel-print .rel-folha { box-shadow: none !important; padding: 0 !important; max-width: none !important; width: 100% !important; border-radius: 0 !important; }\n" +
  "  .rel-sem-quebra { break-inside: avoid; page-break-inside: avoid; }\n" +
  "  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n" +
  "}\n";

// ---------------------------------------------------------------------------
// Utilidades de texto
// ---------------------------------------------------------------------------

const SOBRESCRITO: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function cientifico(numero: number): string {
  const partes = numero.toExponential(3).split("e");
  const mantissa = partes[0].replace(".", ",");
  const expoente = String(Number(partes[1]));
  let sobre = "";
  for (const c of expoente) {
    sobre = sobre + (SOBRESCRITO[c] !== undefined ? SOBRESCRITO[c] : c);
  }
  return mantissa + " × 10" + sobre;
}

function metrosEMilimetros(valor: number): string {
  return fmt(valor, 4) + " m (" + fmt(valor * 1000, 1) + " mm)";
}

function preenchido(texto: string): boolean {
  return texto.trim() !== "";
}

// ---------------------------------------------------------------------------
// Parecer de cavitação
// ---------------------------------------------------------------------------

type NivelRisco = "Baixa" | "Média" | "Alta";

type Parecer = {
  nivel: NivelRisco;
  cor: string;
  fundo: string;
  texto: string;
};

function gerarParecer(n: ResultadoNpsh, razaoMinima: number): Parecer {
  const abertura =
    "A instalação oferece " +
    fmt(n.npshDisponivel, 3) +
    " m de pressão disponível na entrada da bomba (NPSH disponível), contra " +
    fmt(n.npshRequerido, 3) +
    " m exigidos pela bomba (NPSH requerido). ";

  if (n.classe === "segura") {
    return {
      nivel: "Baixa",
      cor: "#047857",
      fundo: "#ecfdf5",
      texto:
        abertura +
        "A folga é de +" +
        fmt(n.margem, 3) +
        " m e o fator de segurança é " +
        fmt(n.razao, 2) +
        ", igual ou acima do mínimo adotado (" +
        fmt(razaoMinima, 2) +
        "). Há margem confortável contra a formação de bolhas de vapor na entrada da bomba.",
    };
  }
  if (n.classe === "limitrofe") {
    return {
      nivel: "Média",
      cor: "#b45309",
      fundo: "#fffbeb",
      texto:
        abertura +
        "A folga é de +" +
        fmt(n.margem, 3) +
        " m, porém o fator de segurança (" +
        fmt(n.razao, 2) +
        ") fica abaixo do mínimo adotado (" +
        fmt(razaoMinima, 2) +
        "). A bomba atende ao mínimo exigido, mas sem margem para variações de nível, de temperatura ou de vazão.",
    };
  }
  return {
    nivel: "Alta",
    cor: "#b91c1c",
    fundo: "#fef2f2",
    texto:
      abertura +
      "A pressão disponível é menor que a exigida, com déficit de " +
      fmt(Math.abs(n.margem), 3) +
      " m (fator de segurança " +
      fmt(n.razao, 2) +
      "). Há risco de formação de bolhas de vapor na entrada da bomba, com ruído, vibração, queda de desempenho e desgaste.",
  };
}

// ---------------------------------------------------------------------------
// Limites de diâmetro da sucção
// ---------------------------------------------------------------------------

type ParLimites = { semFolga: Limite; comFolga: Limite };
type LimitesRelatorio = { base: ParLimites; adicional: ParLimites | null };

function limitesDaCondicao(
  p: Projeto,
  r: ResultadoProjeto,
  n: ResultadoNpsh
): ParLimites {
  return {
    semFolga: diametroMinimo(p, r.vazaoM3s, n.cotaOrigem, n.npshRequerido),
    comFolga: diametroMinimo(
      p,
      r.vazaoM3s,
      n.cotaOrigem,
      n.npshRequerido * r.razaoSegura
    ),
  };
}

function calcularLimites(p: Projeto, r: ResultadoProjeto): LimitesRelatorio | null {
  if (r.npsh === null) {
    return null;
  }
  return {
    base: limitesDaCondicao(p, r, r.npsh),
    adicional:
      r.npshAdicional !== null ? limitesDaCondicao(p, r, r.npshAdicional) : null,
  };
}

function textoLimite(l: Limite): string {
  if (l.valor === null) {
    return "Não atingível só pelo diâmetro";
  }
  return metrosEMilimetros(l.valor);
}

function conclusaoDiametro(instalado: number, par: ParLimites): string {
  if (par.comFolga.valor !== null && instalado >= par.comFolga.valor) {
    return "O diâmetro instalado atende ao mínimo exigido e ao fator de segurança adotado.";
  }
  if (par.semFolga.valor !== null && instalado >= par.semFolga.valor) {
    return "O diâmetro instalado atende ao mínimo exigido, mas não ao fator de segurança adotado.";
  }
  if (par.semFolga.valor === null) {
    return "Aumentar o diâmetro não basta: a limitação está na altura de sucção, na temperatura ou na pressão de origem.";
  }
  return "O diâmetro instalado é menor que o mínimo necessário. É preciso aumentar o diâmetro da sucção.";
}

// ---------------------------------------------------------------------------
// Componentes da folha
// ---------------------------------------------------------------------------

function Secao(props: { titulo: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: "22px" }}>
      <h2
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: papel.azul,
          margin: "0 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid " + papel.linha,
          breakAfter: "avoid",
        }}
      >
        {props.titulo}
      </h2>
      {props.children}
    </section>
  );
}

function Paragrafo(props: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: "12px",
        lineHeight: 1.55,
        color: papel.texto,
        margin: "0 0 8px 0",
      }}
    >
      {props.children}
    </p>
  );
}

function Tabela3(props: { linhas: string[][]; destacar?: string[] }) {
  const destacar = props.destacar !== undefined ? props.destacar : [];
  return (
    <div className="rel-sem-quebra">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <tbody>
          {props.linhas.map((l, i) => {
            const forte = destacar.includes(l[0]);
            return (
              <tr key={i} style={{ borderBottom: "1px solid " + papel.linhaFina }}>
                <td style={{ padding: "5px 0", color: papel.suave }}>{l[0]}</td>
                <td
                  style={{
                    padding: "5px 8px",
                    textAlign: "right",
                    fontWeight: forte ? 700 : 500,
                    color: forte ? papel.azul : papel.texto,
                  }}
                >
                  {l[1]}
                </td>
                <td style={{ padding: "5px 0", color: papel.suave, width: "64px" }}>
                  {l.length > 2 ? l[2] : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TabelaColunas(props: { cabecalho: string[]; linhas: string[][] }) {
  const celula: CSSProperties = { padding: "5px 8px", textAlign: "right" };
  return (
    <div className="rel-sem-quebra">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid " + papel.texto }}>
            {props.cabecalho.map((c, i) => (
              <th
                key={i}
                style={{
                  ...celula,
                  textAlign: i === 0 ? "left" : "right",
                  padding: i === 0 ? "5px 0" : "5px 8px",
                  fontWeight: 700,
                  color: papel.texto,
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.linhas.map((l, i) => (
            <tr key={i} style={{ borderBottom: "1px solid " + papel.linhaFina }}>
              {l.map((c, j) => (
                <td
                  key={j}
                  style={{
                    ...celula,
                    textAlign: j === 0 ? "left" : "right",
                    padding: j === 0 ? "5px 0" : "5px 8px",
                    color: j === 0 ? papel.suave : papel.texto,
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Selo(props: { parecer: Parecer }) {
  return (
    <span
      style={{
        display: "inline-block",
        border: "1.5px solid " + props.parecer.cor,
        backgroundColor: props.parecer.fundo,
        color: props.parecer.cor,
        borderRadius: "4px",
        padding: "2px 10px",
        fontWeight: 700,
        fontSize: "12px",
      }}
    >
      {props.parecer.nivel}
    </span>
  );
}

// Valores do resumo no topo da folha
function CelulaResumo(props: { titulo: string; children: ReactNode }) {
  return (
    <div
      style={{
        flex: "1 1 0",
        border: "1px solid " + papel.linha,
        borderRadius: "6px",
        padding: "10px 12px",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "11px", color: papel.suave, marginBottom: "4px" }}>
        {props.titulo}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: papel.texto }}>
        {props.children}
      </div>
    </div>
  );
}

function linhasDoTrecho(rotuloTitulo: string, t: ResultadoLinha): string[] {
  return [
    rotuloTitulo,
    fmt(t.diametro, 4),
    fmt(t.comprimento, 2),
    fmt(t.velocidade, 3),
    t.reynolds !== null ? fmt(t.reynolds, 0) : "não calculado",
    fmt(t.fatorAtrito, 5),
    t.metodoAtrito,
    fmt(t.somaK, 3),
    fmt(t.hd, 3),
    fmt(t.hloc, 3),
    fmt(t.ht, 3),
  ];
}

function tabelaTrechos(r: ResultadoProjeto): { cabecalho: string[]; linhas: string[][] } {
  const colunas: { titulo: string; dados: string[] }[] = [];
  if (r.succao !== null) {
    colunas.push({ titulo: "Sucção", dados: linhasDoTrecho("Sucção", r.succao) });
    colunas.push({ titulo: "Recalque", dados: linhasDoTrecho("Recalque", r.recalque) });
  } else {
    colunas.push({ titulo: "Tubulação", dados: linhasDoTrecho("Tubulação", r.recalque) });
  }
  const rotulos = [
    "Diâmetro interno D (m)",
    "Comprimento L (m)",
    "Velocidade média V (m/s)",
    "Número de Reynolds",
    "Fator de atrito f",
    "Origem do fator de atrito",
    "Soma dos coeficientes ΣK",
    "Perda distribuída (m)",
    "Perda localizada (m)",
    "Perda total do trecho (m)",
  ];
  const linhas: string[][] = [];
  for (let i = 0; i < rotulos.length; i++) {
    const linha: string[] = [rotulos[i]];
    for (const c of colunas) {
      linha.push(c.dados[i + 1]);
    }
    linhas.push(linha);
  }
  const cabecalho: string[] = ["Grandeza"];
  for (const c of colunas) {
    cabecalho.push(c.titulo);
  }
  return { cabecalho: cabecalho, linhas: linhas };
}

function linhasEntrada(p: Projeto, r: ResultadoProjeto): string[][] {
  const tipo = p.tipoPressao === "manometrica" ? "manométrica" : "absoluta";
  const linhas: string[][] = [
    ["Fluido", r.fluidoNome, ""],
    ["Massa específica ρ", fmt(r.rho, 1), "kg/m³"],
  ];
  if (r.nu !== null) {
    linhas.push(["Viscosidade cinemática ν", cientifico(r.nu), "m²/s"]);
  }
  linhas.push(["Vazão Q", fmt(r.vazaoM3s, 5), "m³/s"]);
  linhas.push(["Aceleração da gravidade g", fmt(r.gravidade, 2), "m/s²"]);
  linhas.push(["Pressão na origem P1 (" + tipo + ")", fmt(lerNumero(p.pressaoOrigem), 0), "Pa"]);
  linhas.push(["Pressão no destino P2 (" + tipo + ")", fmt(lerNumero(p.pressaoDestino), 0), "Pa"]);
  linhas.push(["Cota da origem z1 (eixo da bomba em 0)", fmt(lerNumero(p.cotaOrigem), 3), "m"]);
  linhas.push(["Cota do destino z2", fmt(lerNumero(p.cotaDestino), 3), "m"]);
  if (r.bocal !== null) {
    linhas.push(["Diâmetro de saída do bocal", fmt(r.bocal.diametro, 4), "m"]);
    linhas.push(["Coeficiente K do bocal", fmt(r.bocal.k, 3), ""]);
  }
  linhas.push(["Rendimento da bomba (ou do conjunto)", fmt(lerNumero(p.rendBomba), 3), "fração"]);
  if (preenchido(p.rendMotor)) {
    linhas.push(["Rendimento do motor", fmt(lerNumero(p.rendMotor), 3), "fração"]);
  }
  if (preenchido(p.horasDia) && preenchido(p.diasMes)) {
    linhas.push(["Operação", fmt(lerNumero(p.horasDia), 1) + " h/dia × " + fmt(lerNumero(p.diasMes), 0) + " dias/mês", ""]);
  }
  if (preenchido(p.tarifa)) {
    linhas.push(["Tarifa de energia", fmt(lerNumero(p.tarifa), 2), "R$/kWh"]);
  }
  return linhas;
}

function linhasBalanco(r: ResultadoProjeto): string[][] {
  const linhas: string[][] = [
    ["Carga de pressão (P2 − P1) / ρg", fmt(r.cargaPressao, 3), "m"],
    ["Carga de elevação (z2 − z1)", fmt(r.cargaEstatica, 3), "m"],
  ];
  if (r.bocal !== null) {
    linhas.push(["Energia cinética na saída do bocal V²/2g", fmt(r.cargaCineticaSaida, 3), "m"]);
    linhas.push(["Velocidade de saída no bocal", fmt(r.bocal.velocidade, 3), "m/s"]);
  }
  if (r.succao !== null) {
    linhas.push(["Perda de carga total na sucção", fmt(r.succao.ht, 3), "m"]);
  }
  linhas.push([
    r.succao !== null ? "Perda de carga total no recalque" : "Perda de carga total na tubulação",
    fmt(r.recalque.ht, 3),
    "m",
  ]);
  if (r.bocal !== null) {
    linhas.push(["Perda de carga no bocal K·V²/2g", fmt(r.bocal.perda, 3), "m"]);
  }
  linhas.push(["Perda de carga total do sistema", fmt(r.perdaTotal, 3), "m"]);
  linhas.push(["Altura manométrica da bomba Hm", fmt(r.alturaManometrica, 3), "m"]);
  return linhas;
}

function linhasPotencia(r: ResultadoProjeto): string[][] {
  const linhas: string[][] = [
    ["Potência hidráulica Ph = ρ g Q Hm", fmt(r.potenciaHidraulica, 1), "W"],
    ["Potência hidráulica", fmt(r.potenciaHidraulica / 1000, 3), "kW"],
    ["Potência no eixo da bomba", fmt(r.potenciaEixo, 1), "W"],
    ["Potência no eixo da bomba", fmt(r.potenciaEixo / 1000, 3), "kW"],
  ];
  if (r.potenciaEletrica !== null) {
    linhas.push(["Potência elétrica consumida", fmt(r.potenciaEletrica / 1000, 3), "kW"]);
  }
  if (r.consumoMensal !== null) {
    linhas.push(["Consumo mensal de energia", fmt(r.consumoMensal, 1), "kWh/mês"]);
  }
  if (r.custoMensal !== null) {
    linhas.push(["Custo mensal de energia", fmt(r.custoMensal, 2), "R$/mês"]);
  }
  return linhas;
}

function linhasCondicao(n: ResultadoNpsh): string[][] {
  return [
    ["Pressão da origem em coluna de líquido (absoluta)", fmt(n.cargaPressao, 3), "m"],
    ["Pressão de vapor do fluido em coluna de líquido", fmt(n.cargaVapor, 3), "m"],
    ["Altura do nível de origem em relação ao eixo", fmt(n.cotaOrigem, 3), "m"],
    ["Perda de carga na sucção", fmt(n.perdaSuccao, 3), "m"],
    ["Pressão disponível na entrada da bomba (NPSH disponível)", fmt(n.npshDisponivel, 3), "m"],
    ["Pressão exigida pela bomba (NPSH requerido)", fmt(n.npshRequerido, 3), "m"],
    ["Folga (disponível − exigida)", fmt(n.margem, 3), "m"],
    ["Fator de segurança (disponível ÷ exigida)", fmt(n.razao, 3), ""],
  ];
}

function BlocoCondicao(props: {
  titulo: string;
  n: ResultadoNpsh;
  razaoMinima: number;
  par: ParLimites | null;
  instalado: number | null;
}) {
  const parecer = gerarParecer(props.n, props.razaoMinima);
  return (
    <div style={{ marginTop: "14px" }}>
      <div
        className="rel-sem-quebra"
        style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, color: papel.texto }}>
          {props.titulo}
        </span>
        <span style={{ fontSize: "12px", color: papel.suave }}>
          Possibilidade de cavitação:
        </span>
        <Selo parecer={parecer} />
      </div>
      <Tabela3
        linhas={linhasCondicao(props.n)}
        destacar={["Pressão disponível na entrada da bomba (NPSH disponível)", "Folga (disponível − exigida)"]}
      />
      <div
        className="rel-sem-quebra"
        style={{
          marginTop: "8px",
          border: "1px solid " + parecer.cor,
          backgroundColor: parecer.fundo,
          borderRadius: "6px",
          padding: "10px 12px",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: 700, color: parecer.cor, marginBottom: "4px" }}>
          Parecer técnico: possibilidade {parecer.nivel.toLowerCase()}
        </div>
        <div style={{ fontSize: "12px", lineHeight: 1.55, color: papel.texto }}>
          {parecer.texto}
        </div>
      </div>
      {props.par !== null && (
        <div style={{ marginTop: "10px" }}>
          <TabelaColunas
            cabecalho={[
              "Diâmetro mínimo da sucção",
              "Pressão disponível = exigida",
              "Com fator de segurança " + fmt(props.razaoMinima, 2),
            ]}
            linhas={[
              ["Limite calculado", textoLimite(props.par.semFolga), textoLimite(props.par.comFolga)],
            ]}
          />
          {props.instalado !== null && (
            <div style={{ fontSize: "12px", lineHeight: 1.55, color: papel.texto, marginTop: "6px" }}>
              Diâmetro instalado na sucção: {metrosEMilimetros(props.instalado)}.{" "}
              {conclusaoDiametro(props.instalado, props.par)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Folha(props: {
  p: Projeto;
  r: ResultadoProjeto;
  lim: LimitesRelatorio | null;
  data: string;
}) {
  const { p, r, lim, data } = props;
  const membros = p.membros.map((m) => m.trim()).filter((m) => m !== "");
  const nomeProjeto = p.nome.trim() !== "" ? p.nome.trim() : "Projeto sem nome";
  const trechos = tabelaTrechos(r);

  const parecerBase = r.npsh !== null ? gerarParecer(r.npsh, r.razaoSegura) : null;
  const parecerAdicional =
    r.npshAdicional !== null ? gerarParecer(r.npshAdicional, r.razaoSegura) : null;
  const instalado = r.succao !== null ? r.succao.diametro : null;
  const fatorFixo =
    p.usarSuccao && p.succao.modoAtrito === "informado";

  const estiloFolha: CSSProperties = {
    backgroundColor: "#ffffff",
    color: papel.texto,
    fontFamily: fonte,
    maxWidth: "794px",
    boxSizing: "border-box",
    padding: "40px 44px",
    borderRadius: "4px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
  };

  return (
    <div className="rel-folha" style={estiloFolha}>
      <header style={{ borderBottom: "3px solid " + papel.azul, paddingBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: "12px",
            color: papel.suave,
          }}
        >
          <span style={{ fontWeight: 700, color: papel.azul, fontSize: "14px" }}>HydroCalc Pro</span>
          <span>{data}</span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "10px 0 4px 0", color: papel.texto }}>
          Relatório técnico de sistema de bombeamento
        </h1>
        <div style={{ fontSize: "13px", color: papel.suave }}>{nomeProjeto}</div>
      </header>

      <div className="rel-sem-quebra" style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
        <CelulaResumo titulo="Altura manométrica da bomba">
          {fmt(r.alturaManometrica, 2)} m
        </CelulaResumo>
        <CelulaResumo titulo="Potência no eixo da bomba">
          {fmt(r.potenciaEixo / 1000, 2)} kW
        </CelulaResumo>
        <CelulaResumo titulo="Possibilidade de cavitação">
          {parecerBase === null ? (
            <span style={{ fontSize: "12px", fontWeight: 500, color: papel.suave }}>
              Não avaliada
            </span>
          ) : (
            <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: 500 }}>
                Condição base: <Selo parecer={parecerBase} />
              </span>
              {parecerAdicional !== null && (
                <span style={{ fontSize: "12px", fontWeight: 500 }}>
                  Condição adicional: <Selo parecer={parecerAdicional} />
                </span>
              )}
            </span>
          )}
        </CelulaResumo>
      </div>

      <Secao titulo="1. Integrantes do grupo">
        {membros.length === 0 ? (
          <Paragrafo>Integrantes não informados.</Paragrafo>
        ) : (
          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              fontSize: "12px",
              lineHeight: 1.7,
              columns: membros.length > 3 ? 2 : 1,
            }}
          >
            {membros.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao titulo="2. Dados de entrada (Sistema Internacional)">
        <Tabela3 linhas={linhasEntrada(p, r)} />
      </Secao>

      <Secao titulo="3. Resultados">
        <div style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 6px 0" }}>
          3.1 Escoamento e perdas de carga por trecho
        </div>
        <TabelaColunas cabecalho={trechos.cabecalho} linhas={trechos.linhas} />

        <div style={{ fontSize: "12px", fontWeight: 700, margin: "16px 0 6px 0" }}>
          3.2 Altura manométrica (equação de Bernoulli)
        </div>
        <Tabela3
          linhas={linhasBalanco(r)}
          destacar={["Altura manométrica da bomba Hm", "Perda de carga total do sistema"]}
        />

        <div style={{ fontSize: "12px", fontWeight: 700, margin: "16px 0 6px 0" }}>
          3.3 Potências e energia
        </div>
        <Tabela3 linhas={linhasPotencia(r)} />
      </Secao>

      <Secao titulo="4. Parecer técnico de cavitação">
        <Paragrafo>
          Cavitação é a formação de bolhas de vapor no líquido quando a pressão na entrada da bomba
          cai abaixo da pressão de vapor do fluido. Ao chegarem a regiões de maior pressão, as bolhas
          implodem e causam ruído, vibração, queda de desempenho e desgaste. A verificação compara a
          pressão disponível na entrada da bomba com a pressão exigida por ela:
          pressão disponível = (pressão absoluta na origem − pressão de vapor) / (ρ g) + altura do
          nível − perda de carga na sucção.
        </Paragrafo>
        <Paragrafo>
          Critério da possibilidade de cavitação: <strong>baixa</strong> quando o fator de segurança
          (disponível ÷ exigida) é igual ou maior que {fmt(r.razaoSegura, 2)}; <strong>média</strong>{" "}
          quando a pressão disponível atende à exigida, mas o fator fica abaixo de{" "}
          {fmt(r.razaoSegura, 2)}; <strong>alta</strong> quando a pressão disponível é menor que a
          exigida.
        </Paragrafo>

        {r.npsh === null ? (
          <Paragrafo>
            Verificação não realizada. Para avaliar a cavitação, informe linha de sucção, pressão de
            vapor do fluido e pressão exigida pela bomba (NPSH requerido).
          </Paragrafo>
        ) : (
          <>
            <BlocoCondicao
              titulo="Condição base"
              n={r.npsh}
              razaoMinima={r.razaoSegura}
              par={lim !== null ? lim.base : null}
              instalado={instalado}
            />
            {r.npshAdicional !== null && (
              <BlocoCondicao
                titulo="Condição adicional"
                n={r.npshAdicional}
                razaoMinima={r.razaoSegura}
                par={lim !== null ? lim.adicional : null}
                instalado={instalado}
              />
            )}
            <div style={{ marginTop: "12px" }}>
              <Paragrafo>
                Limite de dimensão do tubo: na sucção, um diâmetro maior reduz a velocidade e as
                perdas de carga e aumenta a pressão disponível na entrada da bomba. Por isso o limite
                que evita a cavitação é um diâmetro <strong>mínimo</strong>, e não máximo.
                {fatorFixo
                  ? " O fator de atrito informado foi mantido constante nesse cálculo."
                  : " O fator de atrito foi recalculado a cada diâmetro testado."}
              </Paragrafo>
            </div>
          </>
        )}
      </Secao>

      <Secao titulo="5. Premissas e observações">
        <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", lineHeight: 1.65 }}>
          <li>Todas as grandezas estão no Sistema Internacional, exceto a temperatura (°C) e as unidades de faturamento (h/dia, dias/mês e R$/kWh).</li>
          <li>Velocidade na superfície do reservatório de origem desprezada; cotas referidas ao eixo da bomba.</li>
          <li>Fator de atrito calculado pela equação de Swamee-Jain quando não informado.</li>
          <li>O fator de segurança mínimo ({fmt(r.razaoSegura, 2)}) é uma premissa editável do projeto.</li>
          {r.avisos.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </Secao>

      <footer
        style={{
          marginTop: "24px",
          paddingTop: "8px",
          borderTop: "1px solid " + papel.linha,
          fontSize: "11px",
          color: papel.suave,
        }}
      >
        Relatório gerado pelo HydroCalc Pro como ferramenta de conferência, a partir dos dados informados.
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function RelatoriosPage() {
  const { projeto } = useProjeto();
  const [pronto, setPronto] = useState(false);
  const [data, setData] = useState("");

  useEffect(() => {
    setPronto(true);
    setData(
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const calculo = useMemo(() => {
    const resposta = calcularProjeto(projeto);
    const limites =
      resposta.resultado !== null ? calcularLimites(projeto, resposta.resultado) : null;
    return { resposta: resposta, limites: limites };
  }, [projeto]);

  function imprimir() {
    const tituloAnterior = document.title;
    const nome = projeto.nome.trim() !== "" ? projeto.nome.trim() : "HydroCalc";
    document.title = "Relatorio - " + nome;
    window.print();
    document.title = tituloAnterior;
  }

  const resultado = calculo.resposta.resultado;

  return (
    <Pagina
      titulo="Relatório"
      subtitulo="Relatório técnico com os integrantes, os resultados e o parecer de cavitação, pronto para salvar em PDF."
    >
      <style>{CSS_IMPRESSAO}</style>

      {resultado === null ? (
        <Aviso tipo="alerta">
          <strong>Preencha os dados do projeto para gerar o relatório.</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            {calculo.resposta.erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <div style={{ marginTop: "10px" }}>
            <Link href="/novo-projeto" style={{ color: cor.azulClaro }}>
              Ir para Novo Projeto
            </Link>
          </div>
        </Aviso>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <Botao variante="principal" aoClicar={imprimir}>
              Salvar como PDF
            </Botao>
            <span style={{ color: cor.suave, fontSize: "13px" }}>
              Na janela que abrir, escolha “Salvar como PDF” como destino e ative “Gráficos de segundo plano”.
            </span>
          </div>
          <Folha p={projeto} r={resultado} lim={calculo.limites} data={data} />
          {pronto &&
            createPortal(
              <div id="rel-print">
                <Folha p={projeto} r={resultado} lim={calculo.limites} data={data} />
              </div>,
              document.body
            )}
        </>
      )}
    </Pagina>
  );
}
