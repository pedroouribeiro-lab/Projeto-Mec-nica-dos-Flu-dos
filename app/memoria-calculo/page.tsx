"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Aviso, Card, Pagina, cor, fmt } from "../../components/UI";
import { useProjeto } from "../../components/ProjetoContext";
import {
  calcularProjeto,
  lerNumero,
  type Projeto,
  type ResultadoLinha,
  type ResultadoNpsh,
  type ResultadoProjeto,
} from "../../lib/hidraulica";

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

// Negativos entre parênteses, para a conta ficar legível
function par(valor: number, casas: number): string {
  return valor < 0 ? "(" + fmt(valor, casas) + ")" : fmt(valor, casas);
}

function termos(valores: number[], casas: number): string {
  return valores.map((v) => par(v, casas)).join(" + ");
}

function letra(i: number): string {
  return i < 26 ? String.fromCharCode(97 + i) : String(i + 1);
}

// ---------------------------------------------------------------------------
// Passos
// ---------------------------------------------------------------------------

type PassoDados = {
  titulo: string;
  formula: string;
  conta: string;
  resultado: string;
};

function passosLinha(nome: string, t: ResultadoLinha, r: ResultadoProjeto): PassoDados[] {
  const g = r.gravidade;
  const lista: PassoDados[] = [];

  lista.push({
    titulo: "Velocidade média na " + nome,
    formula: "A = π·D² / 4      V = Q / A",
    conta:
      "A = π·(" + fmt(t.diametro, 4) + ")² / 4 = " + fmt(t.area, 6) + " m²      V = " +
      fmt(r.vazaoM3s, 5) + " / " + fmt(t.area, 6),
    resultado: "V = " + fmt(t.velocidade, 3) + " m/s",
  });

  if (t.reynolds !== null) {
    lista.push({
      titulo: "Número de Reynolds na " + nome,
      formula: "Re = V·D / ν",
      conta:
        "Re = " + fmt(t.velocidade, 3) + " · " + fmt(t.diametro, 4) + " / " +
        (r.nu !== null ? cientifico(r.nu) : "ν"),
      resultado: "Re = " + fmt(t.reynolds, 0) + (t.regime !== null ? " (" + t.regime + ")" : ""),
    });
  }

  if (t.metodoAtrito === "informado") {
    lista.push({
      titulo: "Fator de atrito na " + nome,
      formula: "f informado nos dados do problema",
      conta: "f = " + fmt(t.fatorAtrito, 5),
      resultado: "f = " + fmt(t.fatorAtrito, 5),
    });
  } else if (t.metodoAtrito === "Swamee-Jain") {
    lista.push({
      titulo: "Fator de atrito na " + nome + " (Swamee-Jain)",
      formula: "f = 0,25 / [ log₁₀( (ε/D)/3,7 + 5,74 / Re^0,9 ) ]²",
      conta:
        "ε/D = " + (t.rugosidadeRelativa !== null ? cientifico(t.rugosidadeRelativa) : "") +
        "      Re = " + (t.reynolds !== null ? fmt(t.reynolds, 0) : ""),
      resultado: "f = " + fmt(t.fatorAtrito, 5),
    });
  } else {
    lista.push({
      titulo: "Fator de atrito na " + nome + " (escoamento laminar)",
      formula: "f = 64 / Re",
      conta: "f = 64 / " + (t.reynolds !== null ? fmt(t.reynolds, 0) : "Re"),
      resultado: "f = " + fmt(t.fatorAtrito, 5),
    });
  }

  lista.push({
    titulo: "Perda de carga distribuída na " + nome,
    formula: "hd = f · (L / D) · V² / 2g",
    conta:
      "hd = " + fmt(t.fatorAtrito, 5) + " · (" + fmt(t.comprimento, 2) + " / " + fmt(t.diametro, 4) +
      ") · " + fmt(t.velocidade, 3) + "² / (2 · " + fmt(g, 2) + ")",
    resultado: "hd = " + fmt(t.hd, 3) + " m",
  });

  lista.push({
    titulo: "Perda de carga localizada na " + nome,
    formula: "hloc = ΣK · V² / 2g",
    conta:
      "hloc = " + fmt(t.somaK, 3) + " · " + fmt(t.velocidade, 3) + "² / (2 · " + fmt(g, 2) + ")",
    resultado: "hloc = " + fmt(t.hloc, 3) + " m",
  });

  return lista;
}

function passosPrincipais(p: Projeto, r: ResultadoProjeto): PassoDados[] {
  const g = r.gravidade;
  const lista: PassoDados[] = [];

  if (r.succao !== null) {
    lista.push(...passosLinha("linha de sucção", r.succao, r));
    lista.push(...passosLinha("linha de recalque", r.recalque, r));
  } else {
    lista.push(...passosLinha("tubulação", r.recalque, r));
  }

  if (r.bocal !== null) {
    lista.push({
      titulo: "Velocidade de saída da água pelo bocal",
      formula: "A = π·D² / 4      V = Q / A",
      conta:
        "A = π·(" + fmt(r.bocal.diametro, 4) + ")² / 4 = " + fmt(r.bocal.area, 6) + " m²      V = " +
        fmt(r.vazaoM3s, 5) + " / " + fmt(r.bocal.area, 6),
      resultado: "V = " + fmt(r.bocal.velocidade, 3) + " m/s",
    });
    lista.push({
      titulo: "Perda de carga associada ao bocal",
      formula: "h = K · V² / 2g",
      conta:
        "h = " + fmt(r.bocal.k, 3) + " · " + fmt(r.bocal.velocidade, 3) + "² / (2 · " + fmt(g, 2) + ")",
      resultado: "h bocal = " + fmt(r.bocal.perda, 3) + " m",
    });
  }

  // Perda total
  const parcelas: number[] = [];
  const nomes: string[] = [];
  if (r.succao !== null) {
    parcelas.push(r.succao.hd, r.succao.hloc);
    nomes.push("hd sucção", "hloc sucção");
  }
  parcelas.push(r.recalque.hd, r.recalque.hloc);
  nomes.push(r.succao !== null ? "hd recalque" : "hd", r.succao !== null ? "hloc recalque" : "hloc");
  if (r.bocal !== null) {
    parcelas.push(r.bocal.perda);
    nomes.push("h bocal");
  }
  lista.push({
    titulo: "Perda de carga total do sistema",
    formula: "Ht = " + nomes.join(" + "),
    conta: "Ht = " + termos(parcelas, 3),
    resultado: "Ht = " + fmt(r.perdaTotal, 3) + " m",
  });

  // Altura equivalente à diferença de pressão
  const p1 = lerNumero(p.pressaoOrigem);
  const p2 = lerNumero(p.pressaoDestino);
  lista.push({
    titulo: "Altura equivalente à diferença de pressão",
    formula: "(P2 − P1) / (ρ·g)",
    conta:
      "(" + par(p2, 0) + " − " + par(p1, 0) + ") / (" + fmt(r.rho, 1) + " · " + fmt(g, 2) + ")",
    resultado: "(P2 − P1)/ρg = " + fmt(r.cargaPressao, 3) + " m",
  });

  // Desnível
  const z1 = lerNumero(p.cotaOrigem);
  const z2 = lerNumero(p.cotaDestino);
  lista.push({
    titulo: "Desnível geométrico",
    formula: "z2 − z1",
    conta: par(z2, 3) + " − " + par(z1, 3),
    resultado: "z2 − z1 = " + fmt(r.cargaEstatica, 3) + " m",
  });

  // Hm
  const comBocal = r.bocal !== null;
  const valoresHm: number[] = [r.cargaEstatica, r.cargaPressao];
  if (comBocal) {
    valoresHm.push(r.cargaCineticaSaida);
  }
  valoresHm.push(r.perdaTotal);
  lista.push({
    titulo: "Altura manométrica Hm que a bomba deve fornecer (Bernoulli)",
    formula:
      "Hm = (z2 − z1) + (P2 − P1)/(ρ·g)" + (comBocal ? " + V²/2g (saída do bocal)" : "") + " + Ht",
    conta: "Hm = " + termos(valoresHm, 3),
    resultado: "Hm = " + fmt(r.alturaManometrica, 3) + " m",
  });

  // Potências
  lista.push({
    titulo: "Potência hidráulica transferida à água",
    formula: "Ph = ρ · g · Q · Hm",
    conta:
      "Ph = " + fmt(r.rho, 1) + " · " + fmt(g, 2) + " · " + fmt(r.vazaoM3s, 5) + " · " +
      fmt(r.alturaManometrica, 3) + " = " + fmt(r.potenciaHidraulica, 1) + " W",
    resultado: "Ph = " + fmt(r.potenciaHidraulica / 1000, 3) + " kW",
  });

  const rendBomba = lerNumero(p.rendBomba);
  lista.push({
    titulo: "Potência requerida no eixo da bomba",
    formula: "P eixo = Ph / η bomba",
    conta: "P eixo = " + fmt(r.potenciaHidraulica / 1000, 3) + " / " + fmt(rendBomba, 3),
    resultado: "P eixo = " + fmt(r.potenciaEixo / 1000, 3) + " kW",
  });

  // Itens opcionais
  if (r.potenciaEletrica !== null) {
    const rendMotor = lerNumero(p.rendMotor);
    lista.push({
      titulo: "Potência elétrica consumida",
      formula: "P elétrica = P eixo / η motor",
      conta: "P elétrica = " + fmt(r.potenciaEixo / 1000, 3) + " / " + fmt(rendMotor, 3),
      resultado: "P elétrica = " + fmt(r.potenciaEletrica / 1000, 3) + " kW",
    });
  }
  if (r.potenciaEletrica !== null && r.consumoMensal !== null) {
    const horas = lerNumero(p.horasDia);
    const dias = lerNumero(p.diasMes);
    lista.push({
      titulo: "Consumo mensal de energia",
      formula: "C = P elétrica × h/dia × dias/mês",
      conta:
        "C = " + fmt(r.potenciaEletrica / 1000, 3) + " · " + fmt(horas, 1) + " · " + fmt(dias, 0),
      resultado: "C = " + fmt(r.consumoMensal, 1) + " kWh/mês",
    });
  }
  if (r.consumoMensal !== null && r.custoMensal !== null) {
    const tarifa = lerNumero(p.tarifa);
    lista.push({
      titulo: "Custo mensal de energia",
      formula: "Custo = C × tarifa",
      conta: "Custo = " + fmt(r.consumoMensal, 1) + " · " + fmt(tarifa, 2),
      resultado: "Custo = R$ " + fmt(r.custoMensal, 2) + " por mês",
    });
  }

  return lista;
}

function rotuloPossibilidade(n: ResultadoNpsh): string {
  if (n.classe === "segura") {
    return "baixa";
  }
  if (n.classe === "limitrofe") {
    return "média";
  }
  return "alta";
}

function passosNpsh(n: ResultadoNpsh, r: ResultadoProjeto): PassoDados[] {
  const g = r.gravidade;
  const pAbs = n.cargaPressao * r.rho * g;
  const pVapor = n.cargaVapor * r.rho * g;
  return [
    {
      titulo: "Pressão da origem em coluna de líquido (absoluta)",
      formula: "P0 / (ρ·g)",
      conta: fmt(pAbs, 0) + " / (" + fmt(r.rho, 1) + " · " + fmt(g, 2) + ")",
      resultado: "P0/ρg = " + fmt(n.cargaPressao, 3) + " m",
    },
    {
      titulo: "Pressão de vapor em coluna de líquido",
      formula: "Pv / (ρ·g)",
      conta: fmt(pVapor, 0) + " / (" + fmt(r.rho, 1) + " · " + fmt(g, 2) + ")",
      resultado: "Pv/ρg = " + fmt(n.cargaVapor, 3) + " m",
    },
    {
      titulo: "NPSH disponível",
      formula: "NPSHd = P0/(ρ·g) − Pv/(ρ·g) + z0 − h sucção",
      conta:
        "NPSHd = " + fmt(n.cargaPressao, 3) + " − " + fmt(n.cargaVapor, 3) + " + " +
        par(n.cotaOrigem, 3) + " − " + fmt(n.perdaSuccao, 3),
      resultado: "NPSHd = " + fmt(n.npshDisponivel, 3) + " m",
    },
    {
      titulo: "Folga em relação ao NPSH requerido",
      formula: "Folga = NPSHd − NPSHr",
      conta: "Folga = " + fmt(n.npshDisponivel, 3) + " − " + fmt(n.npshRequerido, 3),
      resultado: "Folga = " + fmt(n.margem, 3) + " m",
    },
    {
      titulo: "Fator de segurança e possibilidade de cavitação",
      formula: "Razão = NPSHd / NPSHr (mínimo adotado: " + fmt(r.razaoSegura, 2) + ")",
      conta: "Razão = " + fmt(n.npshDisponivel, 3) + " / " + fmt(n.npshRequerido, 3),
      resultado: "Razão = " + fmt(n.razao, 3) + " → possibilidade de cavitação " + rotuloPossibilidade(n),
    },
  ];
}

// ---------------------------------------------------------------------------
// Componentes visuais
// ---------------------------------------------------------------------------

const MONO = 'Consolas, "Courier New", monospace';

function Passo(props: { letra: string; dados: PassoDados }) {
  return (
    <div style={{ borderTop: "1px solid " + cor.borda, padding: "14px 0" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
        <span style={{ color: cor.azulClaro }}>{props.letra})</span> {props.dados.titulo}
      </div>
      <div style={{ fontFamily: MONO, fontSize: "13px", color: cor.suave, marginBottom: "4px" }}>
        {props.dados.formula}
      </div>
      <div style={{ fontFamily: MONO, fontSize: "13px", color: cor.texto, marginBottom: "6px" }}>
        {props.dados.conta}
      </div>
      <div style={{ fontFamily: MONO, fontSize: "14px", fontWeight: 700, color: cor.azulClaro }}>
        {props.dados.resultado}
      </div>
    </div>
  );
}

function ListaPassos(props: { passos: PassoDados[] }) {
  return (
    <div>
      {props.passos.map((s, i) => (
        <Passo key={i} letra={letra(i)} dados={s} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página
// ---------------------------------------------------------------------------

export default function MemoriaCalculoPage() {
  const { projeto } = useProjeto();

  const resposta = useMemo(() => calcularProjeto(projeto), [projeto]);
  const r = resposta.resultado;

  return (
    <Pagina
      titulo="Memória de Cálculo"
      subtitulo="Passo a passo do cálculo, com fórmula, substituição dos valores e resultado, na ordem da prova."
    >
      {r === null ? (
        <Aviso tipo="alerta">
          <strong>Preencha os dados do projeto para ver a memória de cálculo.</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            {resposta.erros.map((e) => (
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
          {r.avisos.length > 0 && (
            <Aviso tipo="alerta">
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {r.avisos.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </Aviso>
          )}

          <Card
            titulo="Altura manométrica e potências"
            descricao={r.fluidoNome + " · todas as grandezas no Sistema Internacional"}
          >
            <ListaPassos passos={passosPrincipais(projeto, r)} />
          </Card>

          {r.npsh !== null && (
            <Card
              titulo="Cavitação: condição base"
              descricao="NPSH disponível comparado ao NPSH requerido pela bomba."
            >
              <ListaPassos passos={passosNpsh(r.npsh, r)} />
            </Card>
          )}

          {r.npshAdicional !== null && (
            <Card
              titulo="Cavitação: condição adicional"
              descricao="Mesma verificação com a cota de origem da condição adicional."
            >
              <ListaPassos passos={passosNpsh(r.npshAdicional, r)} />
            </Card>
          )}
        </>
      )}
    </Pagina>
  );
}
