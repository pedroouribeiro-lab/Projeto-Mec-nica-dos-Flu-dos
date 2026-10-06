import type { CSSProperties, ReactNode } from "react";

export const cor = {
  fundo: "#0F172A",
  painel: "#111827",
  borda: "#1f2937",
  campo: "#0b1220",
  bordaCampo: "#374151",
  texto: "#f9fafb",
  suave: "#9ca3af",
  apagado: "#6b7280",
  azul: "#3B82F6",
  azulClaro: "#60a5fa",
  verde: "#34d399",
  amarelo: "#fbbf24",
  vermelho: "#f87171",
};

export function fmt(numero: number, casas: number): string {
  return numero.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function Pagina(props: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ padding: "32px", color: cor.texto, maxWidth: "1200px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 700, margin: "0 0 6px 0" }}>
        {props.titulo}
      </h1>
      {props.subtitulo !== undefined && (
        <p style={{ color: cor.suave, margin: "0 0 28px 0", fontSize: "14px" }}>
          {props.subtitulo}
        </p>
      )}
      {props.children}
    </div>
  );
}

export function Card(props: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  const estilo: CSSProperties = {
    backgroundColor: cor.painel,
    border: "1px solid " + cor.borda,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  };
  return (
    <section style={estilo}>
      <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 6px 0" }}>
        {props.titulo}
      </h2>
      {props.descricao !== undefined && (
        <p style={{ color: cor.suave, fontSize: "13px", margin: "0 0 16px 0" }}>
          {props.descricao}
        </p>
      )}
      {props.descricao === undefined && <div style={{ height: "12px" }} />}
      {props.children}
    </section>
  );
}

export function Grade(props: { children: ReactNode; minimo?: number }) {
  const minimo = props.minimo !== undefined ? props.minimo : 220;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(" + minimo + "px, 1fr))",
        gap: "16px",
      }}
    >
      {props.children}
    </div>
  );
}

const estiloRotulo: CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: cor.suave,
  marginBottom: "6px",
};

const estiloCampo: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: cor.campo,
  border: "1px solid " + cor.bordaCampo,
  borderRadius: "8px",
  padding: "10px 12px",
  color: cor.texto,
  fontSize: "15px",
  outline: "none",
};

export function Campo(props: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  decimal?: boolean;
  ajuda?: string;
}) {
  return (
    <div>
      <label style={estiloRotulo}>{props.rotulo}</label>
      <input
        type="text"
        inputMode={props.decimal === false ? "text" : "decimal"}
        value={props.valor}
        onChange={(ev) => props.aoMudar(ev.target.value)}
        placeholder={props.placeholder}
        style={estiloCampo}
      />
      {props.ajuda !== undefined && (
        <div style={{ fontSize: "12px", color: cor.apagado, marginTop: "4px" }}>
          {props.ajuda}
        </div>
      )}
    </div>
  );
}

export function Selecao(props: {
  rotulo: string;
  valor: string;
  aoMudar: (valor: string) => void;
  opcoes: { valor: string; rotulo: string }[];
}) {
  return (
    <div>
      <label style={estiloRotulo}>{props.rotulo}</label>
      <select
        value={props.valor}
        onChange={(ev) => props.aoMudar(ev.target.value)}
        style={estiloCampo}
      >
        {props.opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Botao(props: {
  children: ReactNode;
  aoClicar: () => void;
  variante?: "principal" | "secundario" | "perigo";
  desabilitado?: boolean;
}) {
  const variante = props.variante !== undefined ? props.variante : "secundario";
  const estilo: CSSProperties = {
    borderRadius: "8px",
    padding: "10px 18px",
    fontSize: "14px",
    cursor: props.desabilitado === true ? "not-allowed" : "pointer",
    opacity: props.desabilitado === true ? 0.5 : 1,
    backgroundColor: variante === "principal" ? "#2563eb" : "transparent",
    color:
      variante === "principal"
        ? "#ffffff"
        : variante === "perigo"
        ? cor.vermelho
        : cor.suave,
    border:
      variante === "principal"
        ? "none"
        : "1px solid " + (variante === "perigo" ? "#7f1d1d" : cor.bordaCampo),
    fontWeight: variante === "principal" ? 700 : 400,
  };
  return (
    <button
      type="button"
      onClick={props.aoClicar}
      disabled={props.desabilitado === true}
      style={estilo}
    >
      {props.children}
    </button>
  );
}

export type LinhaTabela = {
  rotulo: string;
  valor: string;
  unidade?: string;
  destaque?: boolean;
  cor?: string;
};

export function Tabela(props: { linhas: LinhaTabela[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
      <tbody>
        {props.linhas.map((l) => (
          <tr key={l.rotulo} style={{ borderBottom: "1px solid " + cor.borda }}>
            <td style={{ padding: "9px 0", color: cor.suave }}>{l.rotulo}</td>
            <td
              style={{
                padding: "9px 8px",
                textAlign: "right",
                fontWeight: l.destaque === true ? 700 : 500,
                color: l.cor !== undefined ? l.cor : l.destaque === true ? cor.azulClaro : cor.texto,
              }}
            >
              {l.valor}
            </td>
            <td style={{ padding: "9px 0", color: cor.apagado, width: "70px" }}>
              {l.unidade !== undefined ? l.unidade : ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Aviso(props: {
  tipo: "info" | "alerta" | "erro" | "ok";
  children: ReactNode;
}) {
  const cores = {
    info: { borda: "#1e3a8a", texto: cor.azulClaro },
    alerta: { borda: "#78350f", texto: cor.amarelo },
    erro: { borda: "#7f1d1d", texto: cor.vermelho },
    ok: { borda: "#064e3b", texto: cor.verde },
  };
  const c = cores[props.tipo];
  return (
    <div
      style={{
        border: "1px solid " + c.borda,
        borderRadius: "10px",
        padding: "14px 16px",
        fontSize: "14px",
        color: c.texto,
        marginBottom: "16px",
        backgroundColor: cor.campo,
      }}
    >
      {props.children}
    </div>
  );
}
