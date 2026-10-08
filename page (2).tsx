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
  avaliarExpressao,
  calcularProjeto,
  type Linha,
} from "../../lib/hidraulica";

function FormLinha(props: {
  titulo: string;
  descricao: string;
  linha: Linha;
  aoMudar: (linha: Linha) => void;
}) {
  const { linha, aoMudar } = props;
  const somaK = avaliarExpressao(linha.somaK);

  return (
    <Card titulo={props.titulo} descricao={props.descricao}>
      <Grade>
        <Campo
          rotulo="Diâmetro interno D (m)"
          valor={linha.diametro}
          aoMudar={(v) => aoMudar({ ...linha, diametro: v })}
          placeholder="Ex.: 0,08"
          obrigatorio
        />
        <Campo
          rotulo="Comprimento L (m)"
          valor={linha.comprimento}
          aoMudar={(v) => aoMudar({ ...linha, comprimento: v })}
          placeholder="Ex.: 65"
          obrigatorio
        />
        <Selecao
          rotulo="Fator de atrito f"
          valor={linha.modoAtrito}
          aoMudar={(v) =>
            aoMudar({ ...linha, modoAtrito: v === "calcular" ? "calcular" : "informado" })
          }
          opcoes={[
            { valor: "informado", rotulo: "Informado no enunciado" },
            { valor: "calcular", rotulo: "Calcular (Swamee-Jain)" },
          ]}
        />
        {linha.modoAtrito === "informado" ? (
          <Campo
            rotulo="Fator de atrito de Darcy f"
            valor={linha.fatorAtrito}
            aoMudar={(v) => aoMudar({ ...linha, fatorAtrito: v })}
            placeholder="Ex.: 0,022"
            obrigatorio
          />
        ) : (
          <Campo
            rotulo="Rugosidade absoluta ε (m)"
            valor={linha.rugosidade}
            aoMudar={(v) => aoMudar({ ...linha, rugosidade: v })}
            placeholder="Ex.: 0,000045"
            ajuda="0,045 mm = 0,000045 m (também aceita 4,5e-5)"
            obrigatorio
          />
        )}
        <Campo
          rotulo="Soma dos coeficientes K (ΣK)"
          valor={linha.somaK}
          aoMudar={(v) => aoMudar({ ...linha, somaK: v })}
          placeholder="Ex.: 0,5+4*0,9+1"
          decimal={false}
          obrigatorio
          ajuda={
            isNaN(somaK)
              ? "Digite o valor ou a soma, como na prova: 0,5+1,4+0,3"
              : "ΣK = " + fmt(somaK, 2)
          }
        />
      </Grade>
    </Card>
  );
}

export default function NovoProjetoPage() {
  const { projeto, atualizar, limpar } = useProjeto();
  const resposta = calcularProjeto(projeto);

  const precisaViscosidade =
    projeto.recalque.modoAtrito === "calcular" ||
    (projeto.usarSuccao && projeto.succao.modoAtrito === "calcular");

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
      subtitulo="Informe os dados do enunciado no Sistema Internacional. Campos marcados com * são obrigatórios. Os dados ficam apenas nesta aba do navegador."
    >
      <Card titulo="Identificação">
        <Grade minimo={320}>
          <Campo
            rotulo="Nome do projeto"
            valor={projeto.nome}
            aoMudar={(v) => atualizar((p) => ({ ...p, nome: v }))}
            placeholder="Ex.: Sistema de bombeamento do laboratório"
            decimal={false}
          />
        </Grade>
        <div style={{ marginTop: "18px" }}>
          <Botao variante="perigo" aoClicar={limpar}>
            Limpar todos os dados
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

      <Card
        titulo="Vazão, gravidade e fluido"
        descricao="Use somente números, sem separador de milhar (exemplo: 101300). Vírgula ou ponto como decimal."
      >
        <Grade>
          <Campo
            rotulo="Vazão Q (m³/s)"
            valor={projeto.vazao}
            aoMudar={(v) => atualizar((p) => ({ ...p, vazao: v }))}
            placeholder="Ex.: 0,012"
            ajuda="12 L/s = 0,012 m³/s"
            obrigatorio
          />
          <Campo
            rotulo="Gravidade g (m/s²)"
            valor={projeto.gravidade}
            aoMudar={(v) => atualizar((p) => ({ ...p, gravidade: v }))}
            obrigatorio
          />
          <Selecao
            rotulo="Fluido"
            valor={projeto.fluido.tipo}
            aoMudar={(v) =>
              atualizar((p) => ({
                ...p,
                fluido: { ...p.fluido, tipo: v === "agua" ? "agua" : "manual" },
              }))
            }
            opcoes={[
              { valor: "manual", rotulo: "Dados informados no enunciado" },
              { valor: "agua", rotulo: "Água (propriedades pela temperatura)" },
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
              obrigatorio
            />
          ) : (
            <>
              <Campo
                rotulo="Nome do fluido"
                valor={projeto.fluido.nome}
                aoMudar={(v) =>
                  atualizar((p) => ({ ...p, fluido: { ...p.fluido, nome: v } }))
                }
                placeholder="Ex.: Água"
                decimal={false}
              />
              <Campo
                rotulo="Massa específica ρ (kg/m³)"
                valor={projeto.fluido.densidade}
                aoMudar={(v) =>
                  atualizar((p) => ({ ...p, fluido: { ...p.fluido, densidade: v } }))
                }
                placeholder="Ex.: 1000"
                obrigatorio
              />
              <Selecao
                rotulo="Viscosidade informada"
                valor={projeto.fluido.tipoViscosidade}
                aoMudar={(v) =>
                  atualizar((p) => ({
                    ...p,
                    fluido: {
                      ...p.fluido,
                      tipoViscosidade: v === "dinamica" ? "dinamica" : "cinematica",
                    },
                  }))
                }
                opcoes={[
                  { valor: "cinematica", rotulo: "Cinemática ν (m²/s)" },
                  { valor: "dinamica", rotulo: "Dinâmica μ (Pa·s)" },
                ]}
              />
              <Campo
                rotulo={
                  projeto.fluido.tipoViscosidade === "dinamica"
                    ? "Viscosidade dinâmica μ (Pa·s)"
                    : "Viscosidade cinemática ν (m²/s)"
                }
                valor={projeto.fluido.viscosidade}
                aoMudar={(v) =>
                  atualizar((p) => ({ ...p, fluido: { ...p.fluido, viscosidade: v } }))
                }
                placeholder="Ex.: 0,000001"
                ajuda={
                  precisaViscosidade
                    ? "Obrigatória porque o fator de atrito será calculado."
                    : "Opcional: só é usada para Reynolds e para calcular f."
                }
                obrigatorio={precisaViscosidade}
              />
            </>
          )}
        </Grade>
      </Card>

      <Card
        titulo="Condições do sistema"
        descricao="Cotas referidas ao eixo da bomba. Reservatório aberto: pressão manométrica 0. A velocidade na superfície de origem é desprezada."
      >
        <Grade>
          <Campo
            rotulo="Pressão na origem P1 (Pa)"
            valor={projeto.pressaoOrigem}
            aoMudar={(v) => atualizar((p) => ({ ...p, pressaoOrigem: v }))}
            placeholder="Ex.: 150000"
            ajuda="150 kPa = 150000 Pa"
            obrigatorio
          />
          <Campo
            rotulo="Pressão no destino P2 (Pa)"
            valor={projeto.pressaoDestino}
            aoMudar={(v) => atualizar((p) => ({ ...p, pressaoDestino: v }))}
            placeholder="Ex.: 350000"
            obrigatorio
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
              rotulo="Pressão atmosférica local (Pa)"
              valor={projeto.pressaoAtm}
              aoMudar={(v) => atualizar((p) => ({ ...p, pressaoAtm: v }))}
              ajuda="Usada só para converter em absoluta no NPSH."
            />
          )}
          <Campo
            rotulo="Cota da origem z1 (m)"
            valor={projeto.cotaOrigem}
            aoMudar={(v) => atualizar((p) => ({ ...p, cotaOrigem: v }))}
            placeholder="Ex.: 0"
            obrigatorio
          />
          <Campo
            rotulo="Cota do destino z2 (m)"
            valor={projeto.cotaDestino}
            aoMudar={(v) => atualizar((p) => ({ ...p, cotaDestino: v }))}
            placeholder="Ex.: 18"
            ajuda="Se o enunciado só dá o desnível, use z1 = 0 e z2 = desnível."
            obrigatorio
          />
        </Grade>
      </Card>

      <Card
        titulo="Linhas de tubulação"
        descricao="Marque quando o enunciado separar sucção e recalque. Sem a marcação, use uma única tubulação."
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
        titulo={projeto.usarSuccao ? "Linha de recalque" : "Tubulação"}
        descricao={
          projeto.usarSuccao
            ? "Trecho da saída da bomba até o destino."
            : "Tubulação única entre a origem e o destino."
        }
        linha={projeto.recalque}
        aoMudar={(l) => atualizar((p) => ({ ...p, recalque: l }))}
      />

      <Card
        titulo="Bocal (saída em jato)"
        descricao="Use quando a água sai por um bocal para o ar. A energia cinética na saída entra na altura manométrica."
      >
        <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "14px", marginBottom: "14px" }}>
          <input
            type="checkbox"
            checked={projeto.bocal.ativo}
            onChange={(ev) =>
              atualizar((p) => ({ ...p, bocal: { ...p.bocal, ativo: ev.target.checked } }))
            }
          />
          O sistema termina em um bocal
        </label>
        {projeto.bocal.ativo && (
          <Grade>
            <Campo
              rotulo="Diâmetro de saída do bocal (m)"
              valor={projeto.bocal.diametro}
              aoMudar={(v) =>
                atualizar((p) => ({ ...p, bocal: { ...p.bocal, diametro: v } }))
              }
              placeholder="Ex.: 0,05"
              obrigatorio
            />
            <Campo
              rotulo="K do bocal (opcional)"
              valor={projeto.bocal.k}
              aoMudar={(v) =>
                atualizar((p) => ({ ...p, bocal: { ...p.bocal, k: v } }))
              }
              placeholder="Ex.: 0,8"
              ajuda="Referido à velocidade no bocal."
              decimal={false}
            />
          </Grade>
        )}
      </Card>

      <Card
        titulo="Bomba e energia"
        descricao="O rendimento da bomba é obrigatório, em fração (0,72 e não 72). Os demais campos são opcionais e liberam potência elétrica e custo."
      >
        <Grade>
          <Campo
            rotulo="Rendimento da bomba η (fração)"
            valor={projeto.rendBomba}
            aoMudar={(v) => atualizar((p) => ({ ...p, rendBomba: v }))}
            placeholder="Ex.: 0,72"
            obrigatorio
          />
          <Campo
            rotulo="Rendimento do motor (fração)"
            valor={projeto.rendMotor}
            aoMudar={(v) => atualizar((p) => ({ ...p, rendMotor: v }))}
            placeholder="Ex.: 0,9"
          />
          <Campo
            rotulo="Operação (h/dia)"
            valor={projeto.horasDia}
            aoMudar={(v) => atualizar((p) => ({ ...p, horasDia: v }))}
            placeholder="Ex.: 16"
          />
          <Campo
            rotulo="Operação (dias/mês)"
            valor={projeto.diasMes}
            aoMudar={(v) => atualizar((p) => ({ ...p, diasMes: v }))}
            placeholder="Ex.: 24"
          />
          <Campo
            rotulo="Tarifa de energia (R$/kWh)"
            valor={projeto.tarifa}
            aoMudar={(v) => atualizar((p) => ({ ...p, tarifa: v }))}
            placeholder="Ex.: 0,92"
          />
        </Grade>
        <p style={{ color: cor.apagado, fontSize: "12px", margin: "12px 0 0 0" }}>
          Horas, dias e tarifa seguem a unidade de faturamento do enunciado (h, dia, kWh).
        </p>
      </Card>

      <Card
        titulo="Cavitação (NPSH)"
        descricao="Opcional. Só é calculado com linha de sucção. Para a verificação, informe a pressão de vapor e o NPSH requerido do fabricante."
      >
        <Grade>
          <Campo
            rotulo="Pressão de vapor Pv, absoluta (Pa)"
            valor={projeto.pressaoVapor}
            aoMudar={(v) => atualizar((p) => ({ ...p, pressaoVapor: v }))}
            placeholder="Ex.: 47400"
            ajuda="47,4 kPa = 47400 Pa"
          />
          <Campo
            rotulo="NPSH requerido (m)"
            valor={projeto.npshRequerido}
            aoMudar={(v) => atualizar((p) => ({ ...p, npshRequerido: v }))}
            placeholder="Ex.: 4,6"
          />
          <Campo
            rotulo="Razão mínima segura NPSHA/NPSHR"
            valor={projeto.razaoSegura}
            aoMudar={(v) => atualizar((p) => ({ ...p, razaoSegura: v }))}
            ajuda="Premissa editável. Use o critério definido pelo professor."
          />
          <Campo
            rotulo="Condição adicional: cota da origem (m)"
            valor={projeto.cotaOrigemAdicional}
            aoMudar={(v) => atualizar((p) => ({ ...p, cotaOrigemAdicional: v }))}
            placeholder="Ex.: 0,3"
            ajuda="Nível do tanque de sucção na condição adicional (opcional)."
          />
        </Grade>
      </Card>

      {resposta.resultado !== null ? (
        <Aviso tipo="ok">
          Dados completos. Abra a página <strong>Análise Hidráulica</strong> para ver os cálculos.{" "}
          <Link href="/analise-hidraulica" style={{ color: cor.azulClaro }}>
            Ir para Análise Hidráulica
          </Link>
        </Aviso>
      ) : (
        <Aviso tipo="alerta">
          <strong>Campos obrigatórios pendentes:</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            {resposta.erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Aviso>
      )}
    </Pagina>
  );
}
