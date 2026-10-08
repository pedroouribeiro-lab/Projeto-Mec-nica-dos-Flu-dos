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
    { rotulo: "Diâmetro interno D", valor: fmt(r.diametro, 4), unidade: "m" },
    { rotulo: "Comprimento L", valor: fmt(r.comprimento, 2), unidade: "m" },
    { rotulo: "Área da seção A = πD²/4", valor: fmt(r.area, 6), unidade: "m²" },
    { rotulo: "Velocidade média V = Q/A", valor: fmt(r.velocidade, 3), unidade: "m/s", destaque: true },
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
  linhas.push({ rotulo: "Perda distribuída hd = f·(L/D)·V²/2g", valor: fmt(r.hd, 3), unidade: "m" });
  linhas.push({ rotulo: "Perda localizada hloc = ΣK·V²/2g", valor: fmt(r.hloc, 3), unidade: "m" });
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
  if (r.bocal !== null) {
    bernoulli.push({ rotulo: "Energia cinética na saída V²/2g", valor: fmt(r.cargaCineticaSaida, 3), unidade: "m" });
  }
  if (r.succao !== null) {
    bernoulli.push({ rotulo: "Perda total na sucção", valor: fmt(r.succao.ht, 3), unidade: "m" });
    bernoulli.push({ rotulo: "Perda total no recalque", valor: fmt(r.recalque.ht, 3), unidade: "m" });
  } else {
    bernoulli.push({ rotulo: "Perda total na tubulação", valor: fmt(r.recalque.ht, 3), unidade: "m" });
  }
  if (r.bocal !== null) {
    bernoulli.push({ rotulo: "Perda no bocal K·V²/2g", valor: fmt(r.bocal.perda, 3), unidade: "m" });
  }
  bernoulli.push({ rotulo: "Perda de carga total do sistema", valor: fmt(r.perdaTotal, 3), unidade: "m" });
  bernoulli.push({
    rotulo: "Altura manométrica da bomba Hm",
    valor: fmt(r.alturaManometrica, 3),
    unidade: "m",
    destaque: true,
  });

  const potencias: LinhaTabela[] = [
    { rotulo: "Potência hidráulica Ph", valor: fmt(r.potenciaHidraulica, 1), unidade: "W" },
    { rotulo: "Potência hidráulica (kW)", valor: fmt(r.potenciaHidraulica / 1000, 3), unidade: "kW" },
    { rotulo: "Potência no eixo da bomba", valor: fmt(r.potenciaEixo, 1), unidade: "W", destaque: true },
    { rotulo: "Potência no eixo (kW)", valor: fmt(r.potenciaEixo / 1000, 3), unidade: "kW" },
  ];
  if (r.potenciaEletrica !== null) {
    potencias.push({
      rotulo: "Potência elétrica de entrada",
      valor: fmt(r.potenciaEletrica, 1),
      unidade: "W",
      destaque: true,
    });
    potencias.push({ rotulo: "Potência elétrica (kW)", valor: fmt(r.potenciaEletrica / 1000, 3), unidade: "kW" });
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
              valor: r.nu !== null ? r.nu.toExponential(3).replace(".", ",") : "não informada",
              unidade: r.nu !== null ? "m²/s" : undefined,
            },
            { rotulo: "Vazão Q", valor: fmt(r.vazaoM3s, 6), unidade: "m³/s" },
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
        {r.bocal !== null && (
          <Card titulo="Bocal (saída em jato)">
            <Tabela
              linhas={[
                { rotulo: "Diâmetro de saída", valor: fmt(r.bocal.diametro, 4), unidade: "m" },
                { rotulo: "Área de saída", valor: fmt(r.bocal.area, 6), unidade: "m²" },
                { rotulo: "Velocidade de saída", valor: fmt(r.bocal.velocidade, 3), unidade: "m/s", destaque: true },
                { rotulo: "Energia cinética V²/2g", valor: fmt(r.bocal.cargaCinetica, 4), unidade: "m" },
                { rotulo: "K do bocal", valor: fmt(r.bocal.k, 2) },
                { rotulo: "Perda no bocal", valor: fmt(r.bocal.perda, 3), unidade: "m", destaque: true },
              ]}
            />
          </Card>
        )}
      </Grade>

      <Grade minimo={420}>
        <Card
          titulo="Altura manométrica (Bernoulli)"
          descricao="Hm = (P2 − P1)/ρg + (z2 − z1) + V²/2g na saída (se houver bocal) + perdas de carga"
        >
          <Tabela linhas={bernoulli} />
        </Card>
        <Card
          titulo="Potência e energia"
          descricao="Ph = ρ g Q Hm; eixo = Ph / η da bomba; elétrica = eixo / η do motor"
        >
          <Tabela linhas={potencias} />
        </Card>
      </Grade>
    </Pagina>
  );
}
