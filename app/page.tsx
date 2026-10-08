"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { cor, fmt } from "../components/UI";
import { useProjeto } from "../components/ProjetoContext";
import { calcularProjeto, type ClasseNpsh } from "../lib/hidraulica";

function textoClasse(classe: ClasseNpsh): string {
  if (classe === "segura") {
    return "Segura";
  }
  if (classe === "limitrofe") {
    return "Limítrofe";
  }
  return "Incompatível";
}

function corClasse(classe: ClasseNpsh): string {
  if (classe === "segura") {
    return cor.verde;
  }
  if (classe === "limitrofe") {
    return cor.amarelo;
  }
  return cor.vermelho;
}

const caixa: CSSProperties = {
  backgroundColor: cor.painel,
  border: "1px solid " + cor.borda,
  borderRadius: "12px",
};

function Indicador(props: {
  rotulo: string;
  valor: string;
  unidade?: string;
  nota?: string;
  corValor?: string;
}) {
  return (
    <div style={{ ...caixa, padding: "14px 16px" }}>
      <div style={{ fontSize: "12px", color: cor.suave, marginBottom: "6px" }}>
        {props.rotulo}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: props.corValor !== undefined ? props.corValor : cor.azulClaro,
        }}
      >
        {props.valor}
        {props.unidade !== undefined && (
          <span style={{ fontSize: "13px", color: cor.suave, marginLeft: "6px", fontWeight: 400 }}>
            {props.unidade}
          </span>
        )}
      </div>
      {props.nota !== undefined && (
        <div style={{ fontSize: "12px", color: cor.apagado, marginTop: "4px" }}>
          {props.nota}
        </div>
      )}
    </div>
  );
}

function Item(props: { rotulo: string; valor: string; corValor?: string }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: cor.suave }}>{props.rotulo}</div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          marginTop: "2px",
          color: props.corValor !== undefined ? props.corValor : cor.texto,
        }}
      >
        {props.valor}
      </div>
    </div>
  );
}

function Modulo(props: { nome: string; rota?: string }) {
  const disponivel = props.rota !== undefined;
  const conteudo = (
    <div style={{ ...caixa, padding: "14px 16px" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: cor.texto }}>{props.nome}</div>
      <div
        style={{
          fontSize: "12px",
          marginTop: "4px",
          color: disponivel ? cor.azulClaro : cor.apagado,
        }}
      >
        {disponivel ? "Abrir" : "Em desenvolvimento"}
      </div>
    </div>
  );
  if (props.rota === undefined) {
    return conteudo;
  }
  return (
    <Link href={props.rota} style={{ textDecoration: "none" }}>
      {conteudo}
    </Link>
  );
}

export default function DashboardPage() {
  const { projeto, carregado } = useProjeto();
  const resposta = calcularProjeto(projeto);
  const r = resposta.resultado;
  const nomes = projeto.membros.filter((m) => m.trim() !== "");

  // Uma única tela: ocupa exatamente a altura da janela e não rola em telas normais
  const tela: CSSProperties = {
    height: "100vh",
    boxSizing: "border-box",
    padding: "24px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
    color: cor.texto,
  };

  const grade: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "12px",
  };

  return (
    <div style={tela}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px 0" }}>Dashboard</h1>
        <p style={{ color: cor.suave, margin: 0, fontSize: "13px" }}>
          Visão geral do projeto atual.
        </p>
      </div>

      <div
        style={{
          ...caixa,
          padding: "14px 18px",
          display: "flex",
          gap: "36px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Item
          rotulo="Projeto"
          valor={projeto.nome.trim() !== "" ? projeto.nome.trim() : "Não informado"}
        />
        <Item rotulo="Integrantes" valor={nomes.length + " de 6"} />
        <Item
          rotulo="Dados"
          valor={!carregado ? "Carregando" : r !== null ? "Completos" : "Pendentes"}
          corValor={r !== null ? cor.verde : cor.amarelo}
        />
        {r !== null && <Item rotulo="Fluido" valor={r.fluidoNome} />}
        {carregado && r === null && (
          <Link href="/novo-projeto" style={{ color: cor.azulClaro, fontSize: "14px" }}>
            Preencher em Novo Projeto
          </Link>
        )}
      </div>

      {r === null ? (
        <div style={{ ...caixa, padding: "18px 20px", color: cor.suave, fontSize: "14px" }}>
          Os indicadores aparecem aqui depois que os campos obrigatórios de Novo Projeto forem preenchidos.
        </div>
      ) : (
        <div style={grade}>
          <Indicador
            rotulo="Altura manométrica"
            valor={fmt(r.alturaManometrica, 2)}
            unidade="m"
          />
          <Indicador
            rotulo="Perda de carga total"
            valor={fmt(r.perdaTotal, 2)}
            unidade="m"
          />
          <Indicador
            rotulo="Potência no eixo"
            valor={fmt(r.potenciaEixo / 1000, 2)}
            unidade="kW"
            nota={"Hidráulica: " + fmt(r.potenciaHidraulica / 1000, 2) + " kW"}
          />
          {r.potenciaEletrica !== null && (
            <Indicador
              rotulo="Potência elétrica"
              valor={fmt(r.potenciaEletrica / 1000, 2)}
              unidade="kW"
              nota={r.custoMensal !== null ? "Custo mensal: R$ " + fmt(r.custoMensal, 2) : undefined}
            />
          )}
          {r.npsh !== null && (
            <Indicador
              rotulo="NPSH disponível (base)"
              valor={fmt(r.npsh.npshDisponivel, 2)}
              unidade="m"
              nota={"Requerido " + fmt(r.npsh.npshRequerido, 2) + " m. " + textoClasse(r.npsh.classe)}
              corValor={corClasse(r.npsh.classe)}
            />
          )}
          {r.npshAdicional !== null && (
            <Indicador
              rotulo="NPSH disponível (adicional)"
              valor={fmt(r.npshAdicional.npshDisponivel, 2)}
              unidade="m"
              nota={"Requerido " + fmt(r.npshAdicional.npshRequerido, 2) + " m. " + textoClasse(r.npshAdicional.classe)}
              corValor={corClasse(r.npshAdicional.classe)}
            />
          )}
        </div>
      )}

      <div>
        <div style={{ fontSize: "13px", color: cor.suave, marginBottom: "8px" }}>Módulos</div>
        <div style={grade}>
          <Modulo nome="Novo Projeto" rota="/novo-projeto" />
          <Modulo nome="Análise Hidráulica" rota="/analise-hidraulica" />
          <Modulo nome="Cavitação" rota="/cavitacao" />
          <Modulo nome="Resultados" />
          <Modulo nome="Memória de Cálculo" />
          <Modulo nome="Relatórios" />
        </div>
      </div>
    </div>
  );
}
