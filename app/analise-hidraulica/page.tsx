"use client";

import Link from "next/link";
import {
  Aviso,
  Card,
  Grade,
  Pagina,
  Tabela,
  cor,
  fmt,
  type LinhaTabela,
} from "../../components/UI";
import { useProjeto } from "../../components/ProjetoContext";
import { calcularProjeto, type ResultadoLinha } from "../../lib/hidraulica";

function corRegime(regime: string | null): string {
  if (regime === "Laminar") {
    return cor.verde;
  }
  if (regime === "Transição") {
    return cor.amarelo;
  }
  return cor.azulClaro;
}

function linhasDaLinha(r: ResultadoLinha): LinhaTabela[] {
  const linhas: LinhaTabela[] = [
    { rotulo: "Diâmetro interno", valor: fmt(r.diametroM * 1000, 1), unidade: "mm" },
    { rotulo: "Comprimento", valor: fmt(r.comprimento, 2), unidade: "m" },
    { rotulo: "Área da seção", valor: fmt(r.area, 6), unidade: "m²" },
    { rotulo: "Velocidade média", valor: fmt(r.velocidade, 3), unidade: "m/s", destaque: true },
    { rotulo: "Carga cinética V²/2g", valor: fmt(r.cargaCinetica, 4), unidade: "m" },
  ];

  if (r.reynolds !== null && r.regime !== null) {
    linhas.push({ rotulo: "Número de Reynolds", valor: fmt(r.reynolds, 0) });
    linhas.push({ rotulo: "Regime de escoamento", valor: r.regime, cor: corRegime(r.regime) });
  }
  if (r.rugosidadeRelativa !== null) {
    linhas.push({ rotulo: "Rugosidade relativa ε/D", valor: fmt(r.rugosidadeRelativa, 6) });
  }

  linhas.push({
    rotulo: "Fator de atrito f (" + r.metodoAtrito + ")",
    valor: fmt(r.fatorAtrito, 5),
    destaque: true,
  });
  linhas.push({ rotulo: "Soma dos K (ΣK)", valor: fmt(r.somaK, 2) });
  linhas.push({ rotulo: "Perda distribuída hd", valor: fmt(r.hd, 3), unidade: "m" });
  linhas.push({ rotulo: "Perda localizada hloc", valor: fmt(r.hloc, 3), unidade: "m" });
  linhas.push({ rotulo: "Perda total da linha", valor: fmt(r.ht, 3), unidade: "m", destaque: true });
  return linhas;
}

export default function AnaliseHidraulicaPage() {
  const { projeto, carregado } = useProjeto();
  const resposta = calcularProjeto(projeto);

  if (!carregado) {
    return (
      <Pagina titulo="Análise Hidráulica">
        <p style={{ color: cor.suave }}>Carregando dados do projeto...</p>
      </Pagina>
    );
  }

  if (resposta.resultado === null) {
    return (
      <Pagina
        titulo="Análise Hidráulica"
        subtitulo="Escoamento, perdas de carga, altura manométrica e potência."
      >
        <Aviso tipo="alerta">
          <strong>Faltam dados para calcular:</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            {resposta.erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Aviso>
        <Link href="/novo-projeto" style={{ color: cor.azulClaro, fontSize: "14px" }}>
          Ir para Novo Projeto
        </Link>
      </Pagina>
    );
  }

  const r = resposta.resultado;

  const bernoulli: LinhaTabela[] = [
    { rotulo: "Carga de pressão (P2 − P1) / ρg", valor: fmt(r.cargaPressao, 3), unidade: "m" },
    { rotulo: "Carga de elevação (z2 − z1)", valor: fmt(r.cargaEstatica, 3), unidade: "m" },
  ];
  if (r.succao !== null) {
    bernoulli.push({ rotulo: "Perda total na sucção", valor: fmt(r.succao.ht, 3), unidade: "m" });
    bernoulli.push({ rotulo: "Perda total no recalque", valor: fmt(r.recalque.ht, 3), unidade: "m" });
  } else {
    bernoulli.push({ rotulo: "Perda total na tubulação", valor: fmt(r.recalque.ht, 3), unidade: "m" });
  }
  bernoulli.push({
    rotulo: "Altura manométrica da bomba HB",
    valor: fmt(r.alturaManometrica, 3),
    unidade: "m",
    destaque: true,
  });

  const potencias: LinhaTabela[] = [
    { rotulo: "Potência hidráulica", valor: fmt(r.potenciaHidraulica / 1000, 3), unidade: "kW" },
    { rotulo: "Potência no eixo da bomba", valor: fmt(r.potenciaEixo / 1000, 3), unidade: "kW", destaque: true },
  ];
  if (r.potenciaEletrica !== null) {
    potencias.push({
      rotulo: "Potência elétrica de entrada",
      valor: fmt(r.potenciaEletrica / 1000, 3),
      unidade: "kW",
      destaque: true,
    });
  }
  if (r.consumoMensal !== null) {
    potencias.push({ rotulo: "Consumo mensal", valor: fmt(r.consumoMensal, 1), unidade: "kWh" });
  }
  if (r.custoMensal !== null) {
    potencias.push({ rotulo: "Custo mensal de energia", valor: "R$ " + fmt(r.custoMensal, 2) });
  }

  return (
    <Pagina
      titulo="Análise Hidráulica"
      subtitulo={
        (projeto.nome.trim() !== "" ? projeto.nome.trim() + ". " : "") +
        "Escoamento, perdas de carga, altura manométrica e potência."
      }
    >
      {r.avisos.map((a) => (
        <Aviso key={a} tipo="alerta">
          {a}
        </Aviso>
      ))}

      <Card titulo="Dados de base">
        <Tabela
          linhas={[
            { rotulo: "Fluido", valor: r.fluidoNome },
            { rotulo: "Massa específica ρ", valor: fmt(r.rho, 1), unidade: "kg/m³" },
            {
              rotulo: "Viscosidade cinemática ν",
              valor: r.nu !== null ? fmt(r.nu * 1e6, 4) : "não informada",
              unidade: r.nu !== null ? "mm²/s" : undefined,
            },
            { rotulo: "Vazão", valor: fmt(r.vazaoM3s, 6), unidade: "m³/s" },
            { rotulo: "Gravidade g", valor: fmt(r.gravidade, 2), unidade: "m/s²" },
          ]}
        />
      </Card>

      <Grade minimo={420}>
        {r.succao !== null && (
          <Card titulo="Linha de sucção">
            <Tabela linhas={linhasDaLinha(r.succao)} />
          </Card>
        )}
        <Card titulo={r.succao !== null ? "Linha de recalque" : "Tubulação"}>
          <Tabela linhas={linhasDaLinha(r.recalque)} />
        </Card>
      </Grade>

      <Grade minimo={420}>
        <Card
          titulo="Altura manométrica (Bernoulli)"
          descricao="HB = (P2 − P1)/ρg + (z2 − z1) + perdas de carga"
        >
          <Tabela linhas={bernoulli} />
        </Card>
        <Card
          titulo="Potência e energia"
          descricao="Ph = ρ g Q HB; eixo = Ph / ηbomba; elétrica = eixo / ηmotor"
        >
          <Tabela linhas={potencias} />
        </Card>
      </Grade>
    </Pagina>
  );
}
