"use client";

import Link from "next/link";
import { Aviso, Card, Grade, Pagina, Tabela, cor, fmt } from "../components/UI";
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

function Indicador(props: {
  rotulo: string;
  valor: string;
  unidade?: string;
  nota?: string;
  corValor?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: cor.painel,
        border: "1px solid " + cor.borda,
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "13px", color: cor.suave, marginBottom: "8px" }}>
        {props.rotulo}
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: props.corValor !== undefined ? props.corValor : cor.azulClaro,
        }}
      >
        {props.valor}
        {props.unidade !== undefined && (
          <span style={{ fontSize: "14px", color: cor.suave, marginLeft: "6px", fontWeight: 400 }}>
            {props.unidade}
          </span>
        )}
      </div>
      {props.nota !== undefined && (
        <div style={{ fontSize: "13px", color: cor.apagado, marginTop: "6px" }}>
          {props.nota}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { projeto, carregado } = useProjeto();
  const resposta = calcularProjeto(projeto);

  if (!carregado) {
    return (
      <Pagina titulo="Dashboard">
        <p style={{ color: cor.suave }}>Carregando dados do projeto...</p>
      </Pagina>
    );
  }

  const nomes = projeto.membros.filter((m) => m.trim() !== "");
  const r = resposta.resultado;

  return (
    <Pagina titulo="Dashboard" subtitulo="Visão geral do projeto atual.">
      <Card titulo="Projeto atual">
        <Tabela
          linhas={[
            {
              rotulo: "Nome do projeto",
              valor: projeto.nome.trim() !== "" ? projeto.nome.trim() : "Sem nome",
            },
            { rotulo: "Integrantes do grupo", valor: nomes.length + " de 6" },
            {
              rotulo: "Situação dos dados",
              valor: r !== null ? "Completos" : "Pendentes",
              cor: r !== null ? cor.verde : cor.amarelo,
            },
          ]}
        />
      </Card>

      {r === null ? (
        <Aviso tipo="alerta">
          Ainda faltam dados para calcular.{" "}
          <Link href="/novo-projeto" style={{ color: cor.azulClaro }}>
            Ir para Novo Projeto
          </Link>
        </Aviso>
      ) : (
        <div style={{ marginBottom: "24px" }}>
          <Grade minimo={240}>
            <Indicador
              rotulo="Altura manométrica"
              valor={fmt(r.alturaManometrica, 2)}
              unidade="m"
              nota={"Perdas totais: " + fmt(r.perdaTotal, 2) + " m"}
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
          </Grade>
        </div>
      )}

      <Card titulo="Módulos">
        <Tabela
          linhas={[
            { rotulo: "Novo Projeto", valor: "Disponível" },
            { rotulo: "Análise Hidráulica", valor: "Disponível" },
            { rotulo: "Cavitação", valor: "Em desenvolvimento", cor: cor.apagado },
            { rotulo: "Resultados", valor: "Em desenvolvimento", cor: cor.apagado },
            { rotulo: "Memória de Cálculo", valor: "Em desenvolvimento", cor: cor.apagado },
            { rotulo: "Relatórios", valor: "Em desenvolvimento", cor: cor.apagado },
          ]}
        />
        <div style={{ display: "flex", gap: "20px", marginTop: "16px", fontSize: "14px" }}>
          <Link href="/novo-projeto" style={{ color: cor.azulClaro }}>
            Abrir Novo Projeto
          </Link>
          <Link href="/analise-hidraulica" style={{ color: cor.azulClaro }}>
            Abrir Análise Hidráulica
          </Link>
        </div>
      </Card>
    </Pagina>
  );
}
