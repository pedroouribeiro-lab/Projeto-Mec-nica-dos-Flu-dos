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
import {
  calcularProjeto,
  lerNumero,
  type ClasseNpsh,
  type Projeto,
  type ResultadoNpsh,
} from "../../lib/hidraulica";
import { diametroMinimo, vazaoMaxima, type Limite } from "../../lib/cavitacao";

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

function parecer(n: ResultadoNpsh, razaoSegura: number): string {
  const comparacao =
    "NPSH disponível de " + fmt(n.npshDisponivel, 2) + " m contra " +
    fmt(n.npshRequerido, 2) + " m requeridos (margem de " + fmt(n.margem, 2) +
    " m, razão NPSHA/NPSHR de " + fmt(n.razao, 2) + "). ";

  if (n.classe === "segura") {
    return (
      comparacao +
      "A folga atende a razão mínima adotada (" + fmt(razaoSegura, 2) +
      "). O risco de cavitação é baixo nas condições informadas."
    );
  }
  if (n.classe === "limitrofe") {
    return (
      comparacao +
      "O NPSH disponível supera o requerido, mas a folga é menor que a razão mínima adotada (" +
      fmt(razaoSegura, 2) +
      "). O sistema opera próximo ao limite de sucção e pode cavitar diante de variações de temperatura, nível ou vazão."
    );
  }
  return (
    comparacao +
    "O NPSH disponível é menor que o requerido, portanto há condição para cavitação. O sistema não é adequado nessas condições."
  );
}

function textoDiametro(l: Limite): string {
  if (l.valor === null) {
    return "não atingível";
  }
  return fmt(l.valor, 4) + " m (" + fmt(l.valor * 1000, 1) + " mm)";
}

function textoVazao(l: Limite): string {
  if (l.valor === null) {
    return "não atingível";
  }
  return fmt(l.valor, 5) + " m³/s (" + fmt(l.valor * 3600, 1) + " m³/h)";
}

type Condicao = {
  titulo: string;
  npsh: ResultadoNpsh;
};

function BlocoLimites(props: {
  condicao: Condicao;
  projeto: Projeto;
  vazaoM3s: number;
  razaoSegura: number;
}) {
  const { condicao, projeto, vazaoM3s, razaoSegura } = props;
  const z0 = condicao.npsh.cotaOrigem;
  const npshr = condicao.npsh.npshRequerido;
  const alvoMargem = npshr * razaoSegura;
  const diametroInstalado = lerNumero(projeto.succao.diametro);

  const dSem = diametroMinimo(projeto, vazaoM3s, z0, npshr);
  const dCom = diametroMinimo(projeto, vazaoM3s, z0, alvoMargem);
  const qSem = vazaoMaxima(projeto, diametroInstalado, z0, npshr);
  const qCom = vazaoMaxima(projeto, diametroInstalado, z0, alvoMargem);

  const atende = dSem.valor !== null && diametroInstalado >= dSem.valor;

  const linhas: LinhaTabela[] = [
    {
      rotulo: "Diâmetro mínimo (NPSHd = NPSHr, sem margem)",
      valor: textoDiametro(dSem),
      destaque: true,
    },
    {
      rotulo: "Diâmetro mínimo com margem (NPSHd = " + fmt(razaoSegura, 2) + " × NPSHr)",
      valor: textoDiametro(dCom),
      destaque: true,
    },
    { rotulo: "Diâmetro instalado na sucção", valor: fmt(diametroInstalado, 4) + " m (" + fmt(diametroInstalado * 1000, 1) + " mm)" },
    {
      rotulo: "Instalado atende o mínimo sem margem?",
      valor: dSem.valor === null ? "não atingível" : atende ? "Sim" : "Não",
      cor: dSem.valor === null ? cor.vermelho : atende ? cor.verde : cor.vermelho,
    },
    {
      rotulo: "Vazão máxima com o diâmetro instalado (sem margem)",
      valor: textoVazao(qSem),
      destaque: true,
    },
    {
      rotulo: "Vazão máxima com o diâmetro instalado (com margem)",
      valor: textoVazao(qCom),
    },
    { rotulo: "Vazão de projeto", valor: fmt(vazaoM3s, 5) + " m³/s (" + fmt(vazaoM3s * 3600, 1) + " m³/h)" },
  ];

  return (
    <Card
      titulo={"Dimensão limite da sucção: " + condicao.titulo}
      descricao={"Cota de origem de " + fmt(z0, 2) + " m. Varia só o diâmetro (ou só a vazão); comprimento, acessórios e rugosidade são mantidos."}
    >
      <Tabela linhas={linhas} />
      {(dSem.motivo !== null || dCom.motivo !== null) && (
        <p style={{ color: cor.amarelo, fontSize: "13px", margin: "12px 0 0 0" }}>
          {dCom.motivo !== null
            ? "Com margem: " + dCom.motivo
            : "Sem margem: " + (dSem.motivo as string)}
        </p>
      )}
    </Card>
  );
}

const estiloTexto = {
  color: cor.suave,
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "0 0 10px 0",
};

export default function CavitacaoPage() {
  const { projeto, carregado } = useProjeto();
  const resposta = calcularProjeto(projeto);

  if (!carregado) {
    return (
      <Pagina titulo="Cavitação">
        <p style={{ color: cor.suave }}>Carregando dados do projeto...</p>
      </Pagina>
    );
  }

  const r = resposta.resultado;
  const condicoes: Condicao[] = [];
  if (r !== null && r.npsh !== null) {
    condicoes.push({ titulo: "condição base", npsh: r.npsh });
  }
  if (r !== null && r.npshAdicional !== null) {
    condicoes.push({ titulo: "condição adicional", npsh: r.npshAdicional });
  }

  return (
    <Pagina
      titulo="Cavitação e NPSH"
      subtitulo="Verificação do NPSH disponível, parecer técnico e dimensão limite da sucção."
    >
      {r === null && (
        <Aviso tipo="alerta">
          <strong>Faltam dados para calcular:</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            {resposta.erros.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <Link href="/novo-projeto" style={{ color: cor.azulClaro }}>
            Ir para Novo Projeto
          </Link>
        </Aviso>
      )}

      {r !== null && r.npsh === null && (
        <Aviso tipo="info">
          Para verificar a cavitação, em <strong>Novo Projeto</strong> marque a opção de linha de sucção e
          recalque separadas, e informe a pressão de vapor e o NPSH requerido.{" "}
          <Link href="/novo-projeto" style={{ color: cor.azulClaro }}>
            Ir para Novo Projeto
          </Link>
        </Aviso>
      )}

      {r !== null && r.npsh !== null && (
        <>
          <Grade minimo={420}>
            {condicoes.map((c) => (
              <Card key={c.titulo} titulo={"NPSH disponível: " + c.titulo}>
                <Tabela
                  linhas={[
                    { rotulo: "Carga de pressão na origem (P0abs / ρg)", valor: fmt(c.npsh.cargaPressao, 3), unidade: "m" },
                    { rotulo: "Carga de pressão de vapor (Pv / ρg)", valor: fmt(c.npsh.cargaVapor, 3), unidade: "m" },
                    { rotulo: "Cota de origem z0", valor: fmt(c.npsh.cotaOrigem, 2), unidade: "m" },
                    { rotulo: "Perda total na sucção", valor: fmt(c.npsh.perdaSuccao, 3), unidade: "m" },
                    { rotulo: "NPSH disponível", valor: fmt(c.npsh.npshDisponivel, 3), unidade: "m", destaque: true },
                    { rotulo: "NPSH requerido", valor: fmt(c.npsh.npshRequerido, 3), unidade: "m" },
                    { rotulo: "Margem (NPSHd − NPSHr)", valor: fmt(c.npsh.margem, 3), unidade: "m", cor: c.npsh.margem >= 0 ? cor.verde : cor.vermelho },
                    { rotulo: "Razão NPSHd / NPSHr", valor: fmt(c.npsh.razao, 3) },
                    { rotulo: "Classificação", valor: textoClasse(c.npsh.classe), cor: corClasse(c.npsh.classe), destaque: true },
                  ]}
                />
                <p style={{ color: cor.suave, fontSize: "13px", lineHeight: 1.6, margin: "14px 0 0 0" }}>
                  <strong style={{ color: corClasse(c.npsh.classe) }}>Parecer técnico:</strong>{" "}
                  {parecer(c.npsh, r.razaoSegura)}
                </p>
              </Card>
            ))}
          </Grade>

          <Aviso tipo="info">
            <strong>Fórmula:</strong> NPSHd = (P0abs − Pv) / ρg + z0 − hs, com pressões absolutas e hs a perda
            total na linha de sucção. A razão mínima segura adotada é {fmt(r.razaoSegura, 2)} (editável em Novo Projeto).
          </Aviso>

          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "8px 0 6px 0" }}>
            Até que dimensão o tubo pode ter sem cavitar?
          </h2>
          <p style={{ ...estiloTexto, maxWidth: "820px" }}>
            Na sucção, um tubo maior reduz a velocidade e as perdas e aumenta o NPSH disponível. Por isso o limite
            que evita a cavitação é um <strong>diâmetro mínimo</strong>. Os valores abaixo são calculados mantendo
            a vazão de projeto. O mesmo raciocínio dá também a <strong>vazão máxima</strong> que o diâmetro
            instalado suporta. Na prática, adote o diâmetro comercial imediatamente acima do calculado.
          </p>

          <Grade minimo={420}>
            {condicoes.map((c) => (
              <BlocoLimites
                key={c.titulo}
                condicao={c}
                projeto={projeto}
                vazaoM3s={r.vazaoM3s}
                razaoSegura={r.razaoSegura}
              />
            ))}
          </Grade>
        </>
      )}

      <h2 style={{ fontSize: "18px", fontWeight: 600, margin: "16px 0 14px 0" }}>
        Entenda a cavitação
      </h2>

      <Grade minimo={420}>
        <Card titulo="O que é">
          <p style={estiloTexto}>
            Cavitação é a formação de bolhas de vapor dentro do líquido quando a pressão local cai abaixo da pressão
            de vapor do fluido na temperatura de operação. Ao chegar a regiões de pressão mais alta, essas bolhas
            colapsam de forma violenta.
          </p>
        </Card>

        <Card titulo="Como acontece em uma bomba">
          <p style={estiloTexto}>
            A pressão é mais baixa na entrada do rotor. Se o líquido chega com pouca energia acima da pressão de
            vapor, a pressão nas pás cai abaixo dela e surgem bolhas. Ao serem levadas para a zona de maior pressão,
            elas implodem junto às pás.
          </p>
          <p style={estiloTexto}>
            Consequências: ruído e vibração, queda de altura manométrica e de rendimento, erosão do rotor e danos a
            vedações e rolamentos.
          </p>
        </Card>

        <Card titulo="O que favorece a cavitação">
          <ul style={{ ...estiloTexto, paddingLeft: "20px" }}>
            <li>Temperatura alta, que aumenta a pressão de vapor.</li>
            <li>Nível baixo no reservatório ou bomba acima dele (altura de sucção).</li>
            <li>Sucção longa, estreita ou com muitos acessórios (perdas de carga).</li>
            <li>Pressão atmosférica baixa, como em locais de grande altitude.</li>
            <li>Vazão acima da prevista.</li>
          </ul>
        </Card>

        <Card titulo="NPSH e como evitar">
          <p style={estiloTexto}>
            O NPSH disponível é a energia que o sistema entrega na entrada da bomba acima da pressão de vapor. O NPSH
            requerido é uma característica da bomba, informada pelo fabricante. É preciso NPSHd maior que NPSHr, com
            margem de segurança.
          </p>
          <p style={estiloTexto}>
            Para aumentar o NPSHd: sucção com diâmetro maior, mais curta e com menos acessórios; nível mais alto ou
            bomba mais baixa; fluido mais frio; reservatório pressurizado. Também é possível escolher uma bomba de
            menor NPSHr.
          </p>
        </Card>
      </Grade>
    </Pagina>
  );
}
