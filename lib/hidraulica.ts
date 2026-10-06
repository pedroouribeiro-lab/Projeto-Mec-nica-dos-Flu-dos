// HydroCalc Pro - motor de cálculo hidráulico
// Todas as funções são puras: recebem os dados digitados (texto) e devolvem números.

// ---------------------------------------------------------------------------
// Tipos dos dados de entrada (campos guardados como texto para aceitar vírgula)
// ---------------------------------------------------------------------------

export type Acessorio = {
  id: string;
  nome: string;
  qtd: string;
  k: string;
};

export type Linha = {
  diametro: string; // mm
  comprimento: string; // m
  rugosidade: string; // mm
  modoAtrito: "calcular" | "informado";
  fatorAtrito: string; // usado quando modoAtrito = "informado"
  acessorios: Acessorio[];
};

export type Fluido = {
  tipo: "agua" | "manual";
  temperatura: string; // °C (água)
  nome: string;
  densidade: string; // kg/m³ (manual)
  tipoViscosidade: "dinamica" | "cinematica";
  viscosidade: string; // mPa·s (dinâmica) ou mm²/s (cinemática)
};

export type Projeto = {
  nome: string;
  membros: string[];
  gravidade: string; // m/s²
  vazao: string;
  unidadeVazao: "m3h" | "ls" | "m3s";
  fluido: Fluido;
  usarSuccao: boolean;
  succao: Linha;
  recalque: Linha; // quando não há linha de sucção, é a tubulação principal
  pressaoOrigem: string; // kPa
  pressaoDestino: string; // kPa
  tipoPressao: "absoluta" | "manometrica";
  pressaoAtm: string; // kPa (usada para converter manométrica em absoluta no NPSH)
  cotaOrigem: string; // m, referida ao eixo da bomba
  cotaDestino: string; // m
  rendBomba: string; // %
  rendMotor: string; // % (opcional)
  horasDia: string; // h/dia (opcional)
  diasMes: string; // dias/mês (opcional)
  tarifa: string; // R$/kWh (opcional)
  pressaoVapor: string; // kPa absoluta (opcional, para NPSH)
  npshRequerido: string; // m (opcional, para NPSH)
  razaoSegura: string; // razão mínima NPSHA/NPSHR considerada segura
  cotaOrigemAdicional: string; // m (opcional, condição adicional)
};

export const MAX_MEMBROS = 6;

let contador = 0;
export function novoId(): string {
  contador = contador + 1;
  return "a" + Date.now().toString(36) + contador;
}

export function acessorioVazio(): Acessorio {
  return { id: novoId(), nome: "", qtd: "", k: "" };
}

export function linhaVazia(): Linha {
  return {
    diametro: "",
    comprimento: "",
    rugosidade: "",
    modoAtrito: "calcular",
    fatorAtrito: "",
    acessorios: [acessorioVazio()],
  };
}

export function projetoVazio(): Projeto {
  return {
    nome: "",
    membros: [""],
    gravidade: "9,81",
    vazao: "",
    unidadeVazao: "m3h",
    fluido: {
      tipo: "agua",
      temperatura: "20",
      nome: "",
      densidade: "",
      tipoViscosidade: "dinamica",
      viscosidade: "",
    },
    usarSuccao: false,
    succao: linhaVazia(),
    recalque: linhaVazia(),
    pressaoOrigem: "",
    pressaoDestino: "",
    tipoPressao: "manometrica",
    pressaoAtm: "101,325",
    cotaOrigem: "",
    cotaDestino: "",
    rendBomba: "",
    rendMotor: "",
    horasDia: "",
    diasMes: "",
    tarifa: "",
    pressaoVapor: "",
    npshRequerido: "",
    razaoSegura: "1,3",
    cotaOrigemAdicional: "",
  };
}

function acc(nome: string, qtd: string, k: string): Acessorio {
  return { id: novoId(), nome: nome, qtd: qtd, k: k };
}

// ---------------------------------------------------------------------------
// Exemplos (dados dos exercícios do material de aula e do Desafio 02)
// ---------------------------------------------------------------------------

export type IdExemplo = "ex1" | "ex2" | "desafio2";

export function exemplo(id: IdExemplo): Projeto {
  const base = projetoVazio();

  if (id === "ex1") {
    return {
      ...base,
      nome: "Exercício 1 - Reservatórios abertos",
      vazao: "12",
      unidadeVazao: "ls",
      fluido: {
        ...base.fluido,
        tipo: "manual",
        nome: "Água",
        densidade: "1000",
      },
      recalque: {
        diametro: "80",
        comprimento: "65",
        rugosidade: "",
        modoAtrito: "informado",
        fatorAtrito: "0,022",
        acessorios: [
          acc("Entrada da tubulação", "1", "0,5"),
          acc("Cotovelo de 90°", "4", "0,9"),
          acc("Válvula gaveta totalmente aberta", "1", "0,15"),
          acc("Válvula de retenção", "1", "2"),
          acc("Saída para o reservatório", "1", "1"),
        ],
      },
      pressaoOrigem: "0",
      pressaoDestino: "0",
      tipoPressao: "manometrica",
      cotaOrigem: "0",
      cotaDestino: "18",
      rendBomba: "75",
    };
  }

  if (id === "ex2") {
    return {
      ...base,
      nome: "Exercício 2 - Tanques pressurizados",
      vazao: "18",
      unidadeVazao: "ls",
      fluido: {
        ...base.fluido,
        tipo: "manual",
        nome: "Água",
        densidade: "1000",
        tipoViscosidade: "cinematica",
        viscosidade: "1",
      },
      recalque: {
        diametro: "100",
        comprimento: "120",
        rugosidade: "0,045",
        modoAtrito: "calcular",
        fatorAtrito: "",
        acessorios: [
          acc("Entrada", "1", "0,5"),
          acc("Cotovelo de 90°", "6", "0,9"),
          acc("Válvula globo totalmente aberta", "1", "10"),
          acc("Válvula de retenção", "1", "2"),
          acc("Saída", "1", "1"),
        ],
      },
      pressaoOrigem: "150",
      pressaoDestino: "350",
      tipoPressao: "manometrica",
      cotaOrigem: "0",
      cotaDestino: "12",
      rendBomba: "72",
    };
  }

  return {
    ...base,
    nome: "Desafio 02 - Circuito de água quente",
    vazao: "36",
    unidadeVazao: "m3h",
    fluido: {
      ...base.fluido,
      tipo: "manual",
      nome: "Água quente a 80 °C",
      densidade: "971,8",
      tipoViscosidade: "dinamica",
      viscosidade: "0,355",
    },
    usarSuccao: true,
    succao: {
      diametro: "75",
      comprimento: "12",
      rugosidade: "0,045",
      modoAtrito: "calcular",
      fatorAtrito: "",
      acessorios: [
        acc("Entrada no tubo", "1", "0,5"),
        acc("Cotovelo 90°", "1", "0,9"),
        acc("Válvula gaveta totalmente aberta", "1", "0,15"),
        acc("Filtro/strainer limpo", "1", "2"),
      ],
    },
    recalque: {
      diametro: "65",
      comprimento: "80",
      rugosidade: "0,045",
      modoAtrito: "calcular",
      fatorAtrito: "",
      acessorios: [
        acc("Cotovelo 90°", "5", "0,9"),
        acc("Válvula gaveta totalmente aberta", "1", "0,15"),
        acc("Válvula de retenção", "1", "2"),
        acc("Saída para reservatório", "1", "1"),
      ],
    },
    pressaoOrigem: "101,3",
    pressaoDestino: "101,3",
    tipoPressao: "absoluta",
    cotaOrigem: "1,5",
    cotaDestino: "30",
    rendBomba: "70",
    rendMotor: "90",
    horasDia: "16",
    diasMes: "24",
    tarifa: "0,92",
    pressaoVapor: "47,4",
    npshRequerido: "4,6",
    razaoSegura: "1,3",
    cotaOrigemAdicional: "0,3",
  };
}

// ---------------------------------------------------------------------------
// Propriedades da água (pressão atmosférica), interpolação linear
// ---------------------------------------------------------------------------

type PontoAgua = { t: number; rho: number; nu: number };

const TABELA_AGUA: PontoAgua[] = [
  { t: 0, rho: 999.8, nu: 1.787e-6 },
  { t: 5, rho: 1000.0, nu: 1.519e-6 },
  { t: 10, rho: 999.7, nu: 1.307e-6 },
  { t: 15, rho: 999.1, nu: 1.139e-6 },
  { t: 20, rho: 998.2, nu: 1.004e-6 },
  { t: 25, rho: 997.0, nu: 0.893e-6 },
  { t: 30, rho: 995.7, nu: 0.801e-6 },
  { t: 35, rho: 994.0, nu: 0.724e-6 },
  { t: 40, rho: 992.2, nu: 0.658e-6 },
  { t: 45, rho: 990.2, nu: 0.602e-6 },
  { t: 50, rho: 988.0, nu: 0.553e-6 },
  { t: 55, rho: 985.7, nu: 0.511e-6 },
  { t: 60, rho: 983.2, nu: 0.474e-6 },
  { t: 65, rho: 980.5, nu: 0.441e-6 },
  { t: 70, rho: 977.8, nu: 0.413e-6 },
  { t: 75, rho: 974.9, nu: 0.387e-6 },
  { t: 80, rho: 971.8, nu: 0.364e-6 },
  { t: 85, rho: 968.6, nu: 0.343e-6 },
  { t: 90, rho: 965.3, nu: 0.326e-6 },
  { t: 95, rho: 961.9, nu: 0.309e-6 },
  { t: 100, rho: 958.4, nu: 0.294e-6 },
];

export function propriedadesAgua(temperatura: number): { rho: number; nu: number } {
  for (let i = 0; i < TABELA_AGUA.length - 1; i++) {
    const a = TABELA_AGUA[i];
    const b = TABELA_AGUA[i + 1];
    if (temperatura <= b.t) {
      const fracao = (temperatura - a.t) / (b.t - a.t);
      return {
        rho: a.rho + fracao * (b.rho - a.rho),
        nu: a.nu + fracao * (b.nu - a.nu),
      };
    }
  }
  const ultimo = TABELA_AGUA[TABELA_AGUA.length - 1];
  return { rho: ultimo.rho, nu: ultimo.nu };
}

// ---------------------------------------------------------------------------
// Tipos dos resultados
// ---------------------------------------------------------------------------

export type MetodoAtrito = "informado" | "Swamee-Jain" | "64/Re (laminar)";

export type ResultadoLinha = {
  diametroM: number;
  comprimento: number;
  area: number;
  velocidade: number;
  cargaCinetica: number;
  reynolds: number | null;
  regime: string | null;
  rugosidadeRelativa: number | null;
  fatorAtrito: number;
  metodoAtrito: MetodoAtrito;
  somaK: number;
  hd: number;
  hloc: number;
  ht: number;
};

export type ClasseNpsh = "segura" | "limitrofe" | "incompativel";

export type ResultadoNpsh = {
  cotaOrigem: number;
  cargaPressao: number; // P0 abs / (rho g)
  cargaVapor: number; // Pv / (rho g)
  perdaSuccao: number;
  npshDisponivel: number;
  npshRequerido: number;
  margem: number;
  razao: number;
  classe: ClasseNpsh;
};

export type ResultadoProjeto = {
  vazaoM3s: number;
  gravidade: number;
  rho: number;
  nu: number | null;
  fluidoNome: string;
  succao: ResultadoLinha | null;
  recalque: ResultadoLinha;
  perdaTotal: number;
  cargaPressao: number;
  cargaEstatica: number;
  alturaManometrica: number;
  potenciaHidraulica: number;
  potenciaEixo: number;
  potenciaEletrica: number | null;
  consumoMensal: number | null;
  custoMensal: number | null;
  npsh: ResultadoNpsh | null;
  npshAdicional: ResultadoNpsh | null;
  razaoSegura: number;
  avisos: string[];
};

// Se "resultado" for nulo, a lista "erros" explica o que falta preencher
export type RespostaCalculo = {
  resultado: ResultadoProjeto | null;
  erros: string[];
};

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

export function lerNumero(texto: string): number {
  const limpo = texto.trim().replace(",", ".");
  if (limpo === "") {
    return NaN;
  }
  return Number(limpo);
}

function vazio(texto: string): boolean {
  return texto.trim() === "";
}

export function classificarRegime(re: number): string {
  if (re < 2000) {
    return "Laminar";
  }
  if (re <= 4000) {
    return "Transição";
  }
  return "Turbulento";
}

// Fator de atrito de Darcy pela aproximação de Swamee-Jain
export function swameeJain(rugosidadeRelativa: number, re: number): number {
  const termo = rugosidadeRelativa / 3.7 + 5.74 / Math.pow(re, 0.9);
  const logaritmo = Math.log10(termo);
  return 0.25 / (logaritmo * logaritmo);
}

export function somarK(acessorios: Acessorio[]): { soma: number; erro: string | null } {
  let soma = 0;
  for (const a of acessorios) {
    if (vazio(a.qtd) && vazio(a.k)) {
      continue;
    }
    const qtd = lerNumero(a.qtd);
    const k = lerNumero(a.k);
    if (isNaN(qtd) || isNaN(k) || qtd < 0 || k < 0) {
      const nome = a.nome.trim() !== "" ? a.nome.trim() : "sem nome";
      return {
        soma: 0,
        erro: "Acessório \"" + nome + "\": informe quantidade e K com números maiores ou iguais a zero.",
      };
    }
    soma = soma + qtd * k;
  }
  return { soma: soma, erro: null };
}

// ---------------------------------------------------------------------------
// Cálculo de uma linha de tubulação
// ---------------------------------------------------------------------------

type DadosLinha = {
  titulo: string;
  linha: Linha;
  vazaoM3s: number;
  gravidade: number;
  nu: number | null;
};

function calcularLinha(
  dados: DadosLinha,
  erros: string[],
  avisos: string[]
): ResultadoLinha | null {
  const { titulo, linha, vazaoM3s, gravidade, nu } = dados;

  const dMm = lerNumero(linha.diametro);
  const comprimento = lerNumero(linha.comprimento);
  const inicioErros = erros.length;

  if (isNaN(dMm) || dMm <= 0) {
    erros.push(titulo + ": informe o diâmetro interno (maior que zero).");
  }
  if (isNaN(comprimento) || comprimento <= 0) {
    erros.push(titulo + ": informe o comprimento (maior que zero).");
  }

  const somaK = somarK(linha.acessorios);
  if (somaK.erro !== null) {
    erros.push(titulo + ": " + somaK.erro);
  }

  let rugosidadeM = NaN;
  let fInformado = NaN;
  if (linha.modoAtrito === "calcular") {
    const eMm = lerNumero(linha.rugosidade);
    if (isNaN(eMm) || eMm < 0) {
      erros.push(titulo + ": informe a rugosidade absoluta (zero ou maior).");
    } else if (!isNaN(dMm) && eMm >= dMm) {
      erros.push(titulo + ": a rugosidade deve ser menor que o diâmetro interno.");
    } else {
      rugosidadeM = eMm / 1000;
    }
    if (nu === null) {
      erros.push(titulo + ": para calcular o fator de atrito, informe a viscosidade do fluido.");
    }
  } else {
    fInformado = lerNumero(linha.fatorAtrito);
    if (isNaN(fInformado) || fInformado <= 0) {
      erros.push(titulo + ": informe o fator de atrito (maior que zero).");
    }
  }

  if (erros.length > inicioErros) {
    return null;
  }

  const diametroM = dMm / 1000;
  const area = (Math.PI * diametroM * diametroM) / 4;
  const velocidade = vazaoM3s / area;
  const cargaCinetica = (velocidade * velocidade) / (2 * gravidade);

  let reynolds: number | null = null;
  let regime: string | null = null;
  if (nu !== null) {
    reynolds = (velocidade * diametroM) / nu;
    regime = classificarRegime(reynolds);
  }

  let fatorAtrito = 0;
  let metodoAtrito: MetodoAtrito = "informado";
  let rugosidadeRelativa: number | null = null;

  if (linha.modoAtrito === "informado") {
    fatorAtrito = fInformado;
  } else {
    rugosidadeRelativa = rugosidadeM / diametroM;
    const re = reynolds as number;
    if (re < 2000) {
      fatorAtrito = 64 / re;
      metodoAtrito = "64/Re (laminar)";
    } else {
      fatorAtrito = swameeJain(rugosidadeRelativa, re);
      metodoAtrito = "Swamee-Jain";
      if (re <= 4000) {
        avisos.push(titulo + ": Reynolds na faixa de transição (2000 a 4000); o fator de atrito é uma estimativa.");
      }
      if (re < 5000 || re > 1e8 || rugosidadeRelativa < 1e-6 || rugosidadeRelativa > 1e-2) {
        avisos.push(titulo + ": valores fora da faixa de validade usual da equação de Swamee-Jain (5.000 a 100.000.000 de Reynolds e rugosidade relativa entre 0,000001 e 0,01).");
      }
    }
  }

  const hd = fatorAtrito * (comprimento / diametroM) * cargaCinetica;
  const hloc = somaK.soma * cargaCinetica;

  return {
    diametroM: diametroM,
    comprimento: comprimento,
    area: area,
    velocidade: velocidade,
    cargaCinetica: cargaCinetica,
    reynolds: reynolds,
    regime: regime,
    rugosidadeRelativa: rugosidadeRelativa,
    fatorAtrito: fatorAtrito,
    metodoAtrito: metodoAtrito,
    somaK: somaK.soma,
    hd: hd,
    hloc: hloc,
    ht: hd + hloc,
  };
}

// ---------------------------------------------------------------------------
// NPSH disponível
// ---------------------------------------------------------------------------

export function calcularNpsh(params: {
  pressaoOrigemAbs: number; // Pa
  pressaoVapor: number; // Pa
  rho: number;
  gravidade: number;
  cotaOrigem: number;
  perdaSuccao: number;
  npshRequerido: number;
  razaoSegura: number;
}): ResultadoNpsh {
  const cargaPressao = params.pressaoOrigemAbs / (params.rho * params.gravidade);
  const cargaVapor = params.pressaoVapor / (params.rho * params.gravidade);
  const npshDisponivel = cargaPressao - cargaVapor + params.cotaOrigem - params.perdaSuccao;
  const margem = npshDisponivel - params.npshRequerido;
  const razao = npshDisponivel / params.npshRequerido;

  let classe: ClasseNpsh = "segura";
  if (npshDisponivel < params.npshRequerido) {
    classe = "incompativel";
  } else if (razao < params.razaoSegura) {
    classe = "limitrofe";
  }

  return {
    cotaOrigem: params.cotaOrigem,
    cargaPressao: cargaPressao,
    cargaVapor: cargaVapor,
    perdaSuccao: params.perdaSuccao,
    npshDisponivel: npshDisponivel,
    npshRequerido: params.npshRequerido,
    margem: margem,
    razao: razao,
    classe: classe,
  };
}

// ---------------------------------------------------------------------------
// Cálculo completo do projeto
// ---------------------------------------------------------------------------

export function calcularProjeto(p: Projeto): RespostaCalculo {
  const erros: string[] = [];
  const avisos: string[] = [];

  // Gravidade e vazão
  const gravidade = lerNumero(p.gravidade);
  if (isNaN(gravidade) || gravidade <= 0) {
    erros.push("Informe a aceleração da gravidade (maior que zero).");
  }

  const vazaoDigitada = lerNumero(p.vazao);
  if (isNaN(vazaoDigitada) || vazaoDigitada <= 0) {
    erros.push("Informe a vazão (maior que zero).");
  }
  let vazaoM3s = vazaoDigitada;
  if (p.unidadeVazao === "m3h") {
    vazaoM3s = vazaoDigitada / 3600;
  } else if (p.unidadeVazao === "ls") {
    vazaoM3s = vazaoDigitada / 1000;
  }

  // Fluido
  let rho = NaN;
  let nu: number | null = null;
  let fluidoNome = "";

  if (p.fluido.tipo === "agua") {
    const temp = lerNumero(p.fluido.temperatura);
    if (isNaN(temp) || temp < 0 || temp > 100) {
      erros.push("Informe a temperatura da água entre 0 e 100 °C.");
    } else {
      const prop = propriedadesAgua(temp);
      rho = prop.rho;
      nu = prop.nu;
      fluidoNome = "Água a " + temp + " °C";
    }
  } else {
    rho = lerNumero(p.fluido.densidade);
    if (isNaN(rho) || rho <= 0) {
      erros.push("Informe a densidade do fluido (maior que zero).");
    }
    fluidoNome = p.fluido.nome.trim() !== "" ? p.fluido.nome.trim() : "Fluido informado";
    if (!vazio(p.fluido.viscosidade)) {
      const visc = lerNumero(p.fluido.viscosidade);
      if (isNaN(visc) || visc <= 0) {
        erros.push("A viscosidade do fluido deve ser um número maior que zero.");
      } else if (p.fluido.tipoViscosidade === "cinematica") {
        nu = visc / 1e6; // mm²/s -> m²/s
      } else if (!isNaN(rho) && rho > 0) {
        nu = visc / 1000 / rho; // mPa·s -> Pa·s, depois nu = mu / rho
      }
    }
  }

  // Sistema
  const p1 = lerNumero(p.pressaoOrigem);
  const p2 = lerNumero(p.pressaoDestino);
  const z1 = lerNumero(p.cotaOrigem);
  const z2 = lerNumero(p.cotaDestino);
  if (isNaN(p1) || isNaN(p2)) {
    erros.push("Informe as pressões de origem e de destino (kPa).");
  }
  if (isNaN(z1) || isNaN(z2)) {
    erros.push("Informe as cotas de origem e de destino (m).");
  }

  const rendBomba = lerNumero(p.rendBomba);
  if (isNaN(rendBomba) || rendBomba <= 0 || rendBomba > 100) {
    erros.push("Informe o rendimento da bomba entre 0 e 100 %.");
  }

  // Linhas
  let succao: ResultadoLinha | null = null;
  if (p.usarSuccao) {
    succao = calcularLinha(
      { titulo: "Linha de sucção", linha: p.succao, vazaoM3s: vazaoM3s, gravidade: gravidade, nu: nu },
      erros,
      avisos
    );
  }
  const tituloRecalque = p.usarSuccao ? "Linha de recalque" : "Tubulação";
  const recalque = calcularLinha(
    { titulo: tituloRecalque, linha: p.recalque, vazaoM3s: vazaoM3s, gravidade: gravidade, nu: nu },
    erros,
    avisos
  );

  if (erros.length > 0 || recalque === null) {
    return { resultado: null, erros: erros };
  }

  // Bernoulli entre as superfícies (velocidades desprezíveis)
  const perdaSuccao = succao !== null ? succao.ht : 0;
  const perdaTotal = perdaSuccao + recalque.ht;
  const cargaPressao = ((p2 - p1) * 1000) / (rho * gravidade);
  const cargaEstatica = z2 - z1;
  const alturaManometrica = cargaPressao + cargaEstatica + perdaTotal;

  // Potências
  const potenciaHidraulica = rho * gravidade * vazaoM3s * alturaManometrica;
  const potenciaEixo = potenciaHidraulica / (rendBomba / 100);

  let potenciaEletrica: number | null = null;
  let consumoMensal: number | null = null;
  let custoMensal: number | null = null;

  if (!vazio(p.rendMotor)) {
    const rendMotor = lerNumero(p.rendMotor);
    if (isNaN(rendMotor) || rendMotor <= 0 || rendMotor > 100) {
      return { resultado: null, erros: ["O rendimento do motor deve estar entre 0 e 100 %."] };
    }
    potenciaEletrica = potenciaEixo / (rendMotor / 100);

    if (!vazio(p.horasDia) && !vazio(p.diasMes)) {
      const horas = lerNumero(p.horasDia);
      const dias = lerNumero(p.diasMes);
      if (isNaN(horas) || isNaN(dias) || horas < 0 || dias < 0 || horas > 24 || dias > 31) {
        return { resultado: null, erros: ["Informe horas por dia (0 a 24) e dias por mês (0 a 31) válidos."] };
      }
      consumoMensal = (potenciaEletrica / 1000) * horas * dias;
      if (!vazio(p.tarifa)) {
        const tarifa = lerNumero(p.tarifa);
        if (isNaN(tarifa) || tarifa < 0) {
          return { resultado: null, erros: ["A tarifa de energia deve ser um número maior ou igual a zero."] };
        }
        custoMensal = consumoMensal * tarifa;
      }
    }
  }

  // NPSH (somente com linha de sucção, pressão de vapor e NPSH requerido)
  const razaoSegura = lerNumero(p.razaoSegura);
  let npsh: ResultadoNpsh | null = null;
  let npshAdicional: ResultadoNpsh | null = null;

  if (succao !== null && !vazio(p.pressaoVapor) && !vazio(p.npshRequerido)) {
    const pv = lerNumero(p.pressaoVapor);
    const npshr = lerNumero(p.npshRequerido);
    const atm = lerNumero(p.pressaoAtm);

    if (isNaN(pv) || pv < 0 || isNaN(npshr) || npshr <= 0) {
      return { resultado: null, erros: ["Informe a pressão de vapor (kPa abs) e o NPSH requerido (m) com valores válidos."] };
    }
    if (isNaN(razaoSegura) || razaoSegura < 1) {
      return { resultado: null, erros: ["A razão mínima segura NPSHA/NPSHR deve ser um número maior ou igual a 1."] };
    }
    if (p.tipoPressao === "manometrica" && (isNaN(atm) || atm <= 0)) {
      return { resultado: null, erros: ["Informe a pressão atmosférica (kPa) para converter a pressão manométrica em absoluta."] };
    }

    let pressaoAbs = p1 * 1000;
    if (p.tipoPressao === "manometrica") {
      pressaoAbs = (p1 + atm) * 1000;
    }

    npsh = calcularNpsh({
      pressaoOrigemAbs: pressaoAbs,
      pressaoVapor: pv * 1000,
      rho: rho,
      gravidade: gravidade,
      cotaOrigem: z1,
      perdaSuccao: succao.ht,
      npshRequerido: npshr,
      razaoSegura: razaoSegura,
    });

    if (!vazio(p.cotaOrigemAdicional)) {
      const zAdicional = lerNumero(p.cotaOrigemAdicional);
      if (isNaN(zAdicional)) {
        return { resultado: null, erros: ["A cota de origem da condição adicional deve ser um número."] };
      }
      npshAdicional = calcularNpsh({
        pressaoOrigemAbs: pressaoAbs,
        pressaoVapor: pv * 1000,
        rho: rho,
        gravidade: gravidade,
        cotaOrigem: zAdicional,
        perdaSuccao: succao.ht,
        npshRequerido: npshr,
        razaoSegura: razaoSegura,
      });
    }
  }

  return {
    erros: [],
    resultado: {
      vazaoM3s: vazaoM3s,
      gravidade: gravidade,
      rho: rho,
      nu: nu,
      fluidoNome: fluidoNome,
      succao: succao,
      recalque: recalque,
      perdaTotal: perdaTotal,
      cargaPressao: cargaPressao,
      cargaEstatica: cargaEstatica,
      alturaManometrica: alturaManometrica,
      potenciaHidraulica: potenciaHidraulica,
      potenciaEixo: potenciaEixo,
      potenciaEletrica: potenciaEletrica,
      consumoMensal: consumoMensal,
      custoMensal: custoMensal,
      npsh: npsh,
      npshAdicional: npshAdicional,
      razaoSegura: isNaN(razaoSegura) ? 1.3 : razaoSegura,
      avisos: avisos,
    },
  };
}
