"use client";

import Link from "next/link";
import {
  Aviso,
  Botao,
  Campo,
  Card,
  Grade,
  Pagina,
  Selecao,
  cor,
  fmt,
} from "../../components/UI";
import { useProjeto } from "../../components/ProjetoContext";
import {
  MAX_MEMBROS,
  acessorioVazio,
  calcularProjeto,
  somarK,
  type Linha,
} from "../../lib/hidraulica";

function FormLinha(props: {
  titulo: string;
  descricao: string;
  linha: Linha;
  aoMudar: (linha: Linha) => void;
}) {
  const { linha, aoMudar } = props;
  const soma = somarK(linha.acessorios);

  function mudarAcessorio(id: string, campo: "nome" | "qtd" | "k", valor: string) {
    aoMudar({
      ...linha,
      acessorios: linha.acessorios.map((a) =>
        a.id === id ? { ...a, [campo]: valor } : a
      ),
    });
  }

  function removerAcessorio(id: string) {
    const restantes = linha.acessorios.filter((a) => a.id !== id);
    aoMudar({
      ...linha,
      acessorios: restantes.length > 0 ? restantes : [acessorioVazio()],
    });
  }

  function adicionarAcessorio() {
    aoMudar({ ...linha, acessorios: [...linha.acessorios, acessorioVazio()] });
  }

  return (
    <Card titulo={props.titulo} descricao={props.descricao}>
      <Grade>
        <Campo
          rotulo="Diâmetro interno (mm)"
          valor={linha.diametro}
          aoMudar={(v) => aoMudar({ ...linha, diametro: v })}
          placeholder="Ex.: 100"
        />
        <Campo
          rotulo="Comprimento (m)"
          valor={linha.comprimento}
          aoMudar={(v) => aoMudar({ ...linha, comprimento: v })}
          placeholder="Ex.: 50"
        />
        <Selecao
          rotulo="Fator de atrito"
          valor={linha.modoAtrito}
          aoMudar={(v) =>
            aoMudar({ ...linha, modoAtrito: v === "informado" ? "informado" : "calcular" })
          }
          opcoes={[
            { valor: "calcular", rotulo: "Calcular (Swamee-Jain)" },
            { valor: "informado", rotulo: "Informado no enunciado" },
          ]}
        />
        {linha.modoAtrito === "calcular" ? (
          <Campo
            rotulo="Rugosidade absoluta (mm)"
            valor={linha.rugosidade}
            aoMudar={(v) => aoMudar({ ...linha, rugosidade: v })}
            placeholder="Ex.: 0,045"
          />
        ) : (
          <Campo
            rotulo="Fator de atrito de Darcy (f)"
            valor={linha.fatorAtrito}
            aoMudar={(v) => aoMudar({ ...linha, fatorAtrito: v })}
            placeholder="Ex.: 0,022"
          />
        )}
      </Grade>

      <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "24px 0 4px 0" }}>
        Acessórios e singularidades
      </h3>
      <p style={{ color: cor.suave, fontSize: "13px", margin: "0 0 12px 0" }}>
        Linhas em branco são ignoradas. O total é a soma de quantidade × K.
      </p>

      {linha.acessorios.map((a) => (
        <div
          key={a.id}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(160px, 3fr) 90px 90px auto",
            gap: "10px",
            marginBottom: "10px",
            alignItems: "end",
          }}
        >
          <Campo
            rotulo="Acessório"
            valor={a.nome}
            aoMudar={(v) => mudarAcessorio(a.id, "nome", v)}
            placeholder="Ex.: Cotovelo 90°"
            decimal={false}
          />
          <Campo
            rotulo="Qtd."
            valor={a.qtd}
            aoMudar={(v) => mudarAcessorio(a.id, "qtd", v)}
            placeholder="1"
          />
          <Campo
            rotulo="K"
            valor={a.k}
            aoMudar={(v) => mudarAcessorio(a.id, "k", v)}
            placeholder="0,9"
          />
          <Botao aoClicar={() => removerAcessorio(a.id)}>Remover</Botao>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "14px" }}>
        <Botao aoClicar={adicionarAcessorio}>Adicionar acessório</Botao>
        <span style={{ color: cor.suave, fontSize: "14px" }}>
          ΣK ={" "}
          <strong style={{ color: cor.azulClaro }}>
            {soma.erro === null ? fmt(soma.soma, 2) : "verifique os valores"}
          </strong>
        </span>
      </div>
    </Card>
  );
}

export default function NovoProjetoPage() {
  const { projeto, atualizar, carregarExemplo, limpar } = useProjeto();
  const resposta = calcularProjeto(projeto);

  function mudarMembro(indice: number, valor: string) {
    atualizar((p) => ({
      ...p,
      membros: p.membros.map((m, i) => (i === indice ? valor : m)),
    }));
  }

  function removerMembro(indice: number) {
    atualizar((p) => {
      const restantes = p.membros.filter((_, i) => i !== indice);
      return { ...p, membros: restantes.length > 0 ? restantes : [""] };
    });
  }

  function adicionarMembro() {
    atualizar((p) =>
      p.membros.length >= MAX_MEMBROS ? p : { ...p, membros: [...p.membros, ""] }
    );
  }

  return (
    <Pagina
      titulo="Novo Projeto"
      subtitulo="Informe os dados do enunciado. Tudo é salvo automaticamente neste navegador."
    >
      <Card
        titulo="Identificação"
        descricao="Para testar o site, carregue um dos exemplos. Eles substituem os dados atuais."
      >
        <Grade minimo={320}>
          <Campo
            rotulo="Nome do projeto"
            valor={projeto.nome}
            aoMudar={(v) => atualizar((p) => ({ ...p, nome: v }))}
            placeholder="Ex.: Circuito de água quente"
            decimal={false}
          />
        </Grade>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "18px" }}>
          <Botao aoClicar={() => carregarExemplo("ex1")}>Carregar Exercício 1</Botao>
          <Botao aoClicar={() => carregarExemplo("ex2")}>Carregar Exercício 2</Botao>
          <Botao aoClicar={() => carregarExemplo("desafio2")}>Carregar Desafio 02</Botao>
          <Botao variante="perigo" aoClicar={limpar}>
            Limpar tudo
          </Botao>
        </div>
      </Card>

      <Card
        titulo="Integrantes do grupo"
        descricao={
          "Até " + MAX_MEMBROS + " integrantes. Os nomes aparecem no relatório. (" +
          projeto.membros.filter((m) => m.trim() !== "").length + " de " + MAX_MEMBROS + " preenchidos)"
        }
      >
        {projeto.membros.map((m, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(200px, 1fr) auto",
              gap: "10px",
              alignItems: "end",
              marginBottom: "10px",
              maxWidth: "560px",
            }}
          >
            <Campo
              rotulo={"Integrante " + (i + 1)}
              valor={m}
              aoMudar={(v) => mudarMembro(i, v)}
              placeholder="Nome completo"
              decimal={false}
            />
            <Botao aoClicar={() => removerMembro(i)}>Remover</Botao>
          </div>
        ))}
        <div style={{ marginTop: "14px" }}>
          <Botao
            aoClicar={adicionarMembro}
            desabilitado={projeto.membros.length >= MAX_MEMBROS}
          >
            Adicionar integrante
          </Botao>
        </div>
      </Card>

      <Card titulo="Vazão e gravidade">
        <Grade>
          <Campo
            rotulo="Vazão"
            valor={projeto.vazao}
            aoMudar={(v) => atualizar((p) => ({ ...p, vazao: v }))}
            placeholder="Ex.: 36"
          />
          <Selecao
            rotulo="Unidade da vazão"
            valor={projeto.unidadeVazao}
            aoMudar={(v) =>
              atualizar((p) => ({
                ...p,
                unidadeVazao: v === "ls" ? "ls" : v === "m3s" ? "m3s" : "m3h",
              }))
            }
            opcoes={[
              { valor: "m3h", rotulo: "m³/h" },
              { valor: "ls", rotulo: "L/s" },
              { valor: "m3s", rotulo: "m³/s" },
            ]}
          />
          <Campo
            rotulo="Gravidade (m/s²)"
            valor={projeto.gravidade}
            aoMudar={(v) => atualizar((p) => ({ ...p, gravidade: v }))}
          />
        </Grade>
      </Card>

      <Card titulo="Fluido">
        <Grade>
          <Selecao
            rotulo="Tipo de fluido"
            valor={projeto.fluido.tipo}
            aoMudar={(v) =>
              atualizar((p) => ({
                ...p,
                fluido: { ...p.fluido, tipo: v === "manual" ? "manual" : "agua" },
              }))
            }
            opcoes={[
              { valor: "agua", rotulo: "Água (propriedades pela temperatura)" },
              { valor: "manual", rotulo: "Dados informados no enunciado" },
            ]}
          />
          {projeto.fluido.tipo === "agua" ? (
            <Campo
              rotulo="Temperatura da água (°C)"
              valor={projeto.fluido.temperatura}
              aoMudar={(v) =>
                atualizar((p) => ({ ...p, fluido: { ...p.fluido, temperatura: v } }))
              }
              placeholder="Ex.: 20"
            />
          ) : (
            <>
              <Campo
                rotulo="Nome do fluido"
                valor={projeto.fluido.nome}
                aoMudar={(v) =>
                  atualizar((p) => ({ ...p, fluido: { ...p.fluido, nome: v } }))
                }
                placeholder="Ex.: Água quente a 80 °C"
                decimal={false}
              />
              <Campo
                rotulo="Massa específica (kg/m³)"
                valor={projeto.fluido.densidade}
                aoMudar={(v) =>
                  atualizar((p) => ({ ...p, fluido: { ...p.fluido, densidade: v } }))
                }
                placeholder="Ex.: 1000"
              />
              <Selecao
                rotulo="Viscosidade informada"
                valor={projeto.fluido.tipoViscosidade}
                aoMudar={(v) =>
                  atualizar((p) => ({
                    ...p,
                    fluido: {
                      ...p.fluido,
                      tipoViscosidade: v === "cinematica" ? "cinematica" : "dinamica",
                    },
                  }))
                }
                opcoes={[
                  { valor: "dinamica", rotulo: "Dinâmica μ (mPa·s = cP)" },
                  { valor: "cinematica", rotulo: "Cinemática ν (mm²/s)" },
                ]}
              />
              <Campo
                rotulo={
                  projeto.fluido.tipoViscosidade === "dinamica"
                    ? "Viscosidade dinâmica (mPa·s)"
                    : "Viscosidade cinemática (mm²/s)"
                }
                valor={projeto.fluido.viscosidade}
                aoMudar={(v) =>
                  atualizar((p) => ({ ...p, fluido: { ...p.fluido, viscosidade: v } }))
                }
                placeholder="Obrigatória para calcular f e Reynolds"
                ajuda="1 Pa·s = 1000 mPa·s. 1 m²/s = 1.000.000 mm²/s."
              />
            </>
          )}
        </Grade>
      </Card>

      <Card
        titulo="Condições do sistema"
        descricao="Cotas referidas ao eixo da bomba. As velocidades nas superfícies dos reservatórios são consideradas desprezíveis."
      >
        <Grade>
          <Campo
            rotulo="Pressão na superfície de origem (kPa)"
            valor={projeto.pressaoOrigem}
            aoMudar={(v) => atualizar((p) => ({ ...p, pressaoOrigem: v }))}
            placeholder="Ex.: 101,3"
          />
          <Campo
            rotulo="Pressão na superfície de destino (kPa)"
            valor={projeto.pressaoDestino}
            aoMudar={(v) => atualizar((p) => ({ ...p, pressaoDestino: v }))}
            placeholder="Ex.: 101,3"
          />
          <Selecao
            rotulo="As pressões informadas são"
            valor={projeto.tipoPressao}
            aoMudar={(v) =>
              atualizar((p) => ({
                ...p,
                tipoPressao: v === "absoluta" ? "absoluta" : "manometrica",
              }))
            }
            opcoes={[
              { valor: "manometrica", rotulo: "Manométricas" },
              { valor: "absoluta", rotulo: "Absolutas" },
            ]}
          />
          {projeto.tipoPressao === "manometrica" && (
            <Campo
              rotulo="Pressão atmosférica local (kPa)"
              valor={projeto.pressaoAtm}
              aoMudar={(v) => atualizar((p) => ({ ...p, pressaoAtm: v }))}
              ajuda="Usada só para converter em absoluta no NPSH."
            />
          )}
          <Campo
            rotulo="Cota da superfície de origem (m)"
            valor={projeto.cotaOrigem}
            aoMudar={(v) => atualizar((p) => ({ ...p, cotaOrigem: v }))}
            placeholder="Ex.: 1,5"
          />
          <Campo
            rotulo="Cota da superfície de destino (m)"
            valor={projeto.cotaDestino}
            aoMudar={(v) => atualizar((p) => ({ ...p, cotaDestino: v }))}
            placeholder="Ex.: 30"
          />
        </Grade>
        <p style={{ color: cor.apagado, fontSize: "12px", margin: "12px 0 0 0" }}>
          Se o enunciado só informa o desnível, use cota de origem 0 e cota de destino igual ao desnível.
        </p>
      </Card>

      <Card
        titulo="Linhas de tubulação"
        descricao="Marque a opção abaixo quando o enunciado separar sucção e recalque (necessário para o NPSH)."
      >
        <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "14px" }}>
          <input
            type="checkbox"
            checked={projeto.usarSuccao}
            onChange={(ev) => atualizar((p) => ({ ...p, usarSuccao: ev.target.checked }))}
          />
          O enunciado tem linha de sucção e linha de recalque separadas
        </label>
      </Card>

      {projeto.usarSuccao && (
        <FormLinha
          titulo="Linha de sucção"
          descricao="Trecho do reservatório de origem até a entrada da bomba."
          linha={projeto.succao}
          aoMudar={(l) => atualizar((p) => ({ ...p, succao: l }))}
        />
      )}

      <FormLinha
