// HydroCalc Pro - motor de cálculo hidráulico
// Todas as entradas são digitadas no Sistema Internacional (m, m³/s, Pa, kg/m³, Pa·s, m²/s).
// As funções são puras: recebem os dados digitados (texto) e devolvem números.

// ---------------------------------------------------------------------------
// Tipos dos dados de entrada (campos guardados como texto para aceitar vírgula)
// ---------------------------------------------------------------------------

export type Linha = {
  diametro: string; // m
  comprimento: string; // m
  rugosidade: string; // m (usada quando o fator de atrito é calculado)
  modoAtrito: "calcular" | "informado";
  fatorAtrito: string; // usado quando modoAtrito = "informado"
  somaK: string; // soma dos K; aceita expressão, ex.: 0,5+4*0,9+1
};

export type Bocal = {
  ativo: boolean;
  diametro: string; // m
  k: string; // K do bocal, referido à velocidade no bocal (opcional)
};

export type Fluido = {
  tipo: "agua" | "manual";
  temperatura: string; // °C (água)
  nome: string;
  densidade: string; // kg/m³ (manual)
  tipoViscosidade: "dinamica" | "cinematica";
  viscosidade: string; // Pa·s (dinâmica) ou m²/s (cinemática)
};

export type Projeto = {
  nome: string;
  membros: string[];
  gravidade: string; // m/s²
  vazao: string; // m³/s
  fluido: Fluido;
  usarSuccao: boolean;
  succao: Linha;
  recalque: Linha; // quando não há linha de sucção, é a tubulação principal
  bocal: Bocal;
  pressaoOrigem: string; // Pa
  pressaoDestino: string; // Pa
  tipoPressao: "absoluta" | "manometrica";
  pressaoAtm: string; // Pa (usada para converter manométrica em absoluta no NPSH)
  cotaOrigem: string; // m, referida ao eixo da bomba
  cotaDestino: string; // m
  rendBomba: string; // fração entre 0 e 1
  rendMotor: string; // fração entre 0 e 1 (opcional)
  horasDia: string; // h/dia (opcional)
  diasMes: string; // dias/mês (opcional)
  tarifa: string; // R$/kWh (opcional)
  pressaoVapor: string; // Pa absoluta (opcional, para NPSH)
  npshRequerido: string; // m (opcional, para NPSH)
  razaoSegura: string; // razão mínima NPSHA/NPSHR considerada segura
  cotaOrigemAdicional: string; // m (opcional, condição adicional)
};

export const MAX_MEMBROS = 6;

export function linhaVazia(): Linha {
  return {
    diametro: "",
    comprimento: "",
    rugosidade: "",
    modoAtrito: "informado",
    fatorAtrito: "",
    somaK: "",
  };
}

export function projetoVazio(): Projeto {
  return {
    nome: "",
    membros: [""],
    gravidade: "9,81",
    vazao: "",
    fluido: {
      tipo: "manual",
      temperatura: "",
      nome: "",
      densidade: "",
      tipoViscosidade: "cinematica",
      viscosidade: "",
    },
    usarSuccao: false,
    succao: linhaVazia(),
    recalque: linhaVazia(),
    bocal: { ativo: false, diametro: "", k: "" },
    pressaoOrigem: "",
    pressaoDestino: "",
    tipoPressao: "manometrica",
    pressaoAtm: "101325",
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
  diametro: number; // m
  comprimento: number; // m
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

export type ResultadoBocal = {
  diametro: number;
  area: number;
  velocidade: number;
  cargaCinetica: number;
  k: number;
  perda: number;
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
  bocal: ResultadoBocal | null;
  perdaTotal: number;
  cargaPressao: number;
  cargaEstatica: number;
  cargaCineticaSaida: number;
  alturaManometrica: number;
  potenciaHidraulica: number; // W
  potenciaEixo: number; // W
  potenciaEletrica: number | null; // W
  consumoMensal: number | null; // kWh
  custoMensal: number | null; // R$
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

// Avalia expressões simples com + - * / e parênteses, sem usar eval.
// Exemplo: "0,5+4*0,9+1" resulta em 5,1.
export function avaliarExpressao(texto: string): number {
  const limpo = texto.replace(/\s+/g, "").replace(/,/g, ".");
  if (limpo === "" || !/^[0-9.+\-*/()]+$/.test(limpo)) {
    return NaN;
  }
  const n = limpo.length;
  let pos = 0;

  function fator(): number {
    if (pos >= n) {
      return NaN;
    }
    const c = limpo[pos];
    if (c === "-") {
      pos = pos + 1;
      return -fator();
    }
    if (c === "+") {
      pos = pos + 1;
      return fator();
    }
    if (c === "(") {
      pos = pos + 1;
      const v = soma();
      if (pos >= n || limpo[pos] !== ")") {
        return NaN;
      }
      pos = pos + 1;
      return v;
    }
    const inicio = pos;
    while (pos < n && /[0-9.]/.test(limpo[pos])) {
      pos = pos + 1;
    }
    if (inicio === pos) {
      return NaN;
    }
    return Number(limpo.slice(inicio, pos));
  }

  function produto(): number {
    let v = fator();
    while (pos < n && (limpo[pos] === "*" || limpo[pos] === "/")) {
      const op = limpo[pos];
      pos = pos + 1;
      const w = fator();
      v = op === "*" ? v * w : v / w;
    }
    return v;
  }

  function soma(): number {
    let v = produto();
    while (pos < n && (limpo[pos] === "+" || limpo[pos] === "-")) {
      const op = limpo[pos];
      pos = pos + 1;
      const w = produto();
      v = op === "+" ? v + w : v - w;
    }
    return v;
  }

  const resultado = soma();
  if (pos !== n) {
    return NaN;
  }
  return resultado;
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

  const diametro = lerNumero(linha.diametro);
  const comprimento = lerNumero(linha.comprimento);
  const somaK = avaliarExpressao(linha.somaK);
  const inicioErros = erros.length;

  if (isNaN(diametro) || diametro <= 0) {
    erros.push(titulo + ": informe o diâmetro interno em metros (maior que zero).");
  }
  if (isNaN(comprimento) || comprimento <= 0) {
    erros.push(titulo + ": informe o comprimento em metros (maior que zero).");
  }
  if (isNaN(somaK) || somaK < 0) {
    erros.push(titulo + ": informe a soma dos K (use 0 se não houver acessórios). Exemplo: 0,5+4*0,9+1.");
  }

  let rugosidade = NaN;
  let fInformado = NaN;
  if (linha.modoAtrito === "calcular") {
    rugosidade = lerNumero(linha.rugosidade);
    if (isNaN(rugosidade) || rugosidade < 0) {
      erros.push(titulo + ": informe a rugosidade absoluta em metros (zero ou maior).");
    } else if (!isNaN(diametro) && rugosidade >= diametro) {
      erros.push(titulo + ": a rugosidade deve ser menor que o diâmetro interno.");
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

  const area = (Math.PI * diametro * diametro) / 4;
  const velocidade = vazaoM3s / area;
  const cargaCinetica = (velocidade * velocidade) / (2 * gravidade);

  let reynolds: number | null = null;
  let regime: string | null = null;
  if (nu !== null) {
    reynolds = (velocidade * diametro) / nu;
    regime = classificarRegime(reynolds);
  }

  let fatorAtrito = 0;
  let metodoAtrito: MetodoAtrito = "informado";
  let rugosidadeRelativa: number | null = null;

  if (linha.modoAtrito === "informado") {
    fatorAtrito = fInformado;
  } else {
    rugosidadeRelativa = rugosidade / diametro;
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
        avisos.push(titulo + ": valores fora da faixa de validade usual da equação de Swamee-Jain (Reynolds de 5.000 a 100.000.000 e rugosidade relativa entre 0,000001 e 0,01).");
      }
    }
  }

  const hd = fatorAtrito * (comprimento / diametro) * cargaCinetica;
  const hloc = somaK * cargaCinetica;

  return {
    diametro: diametro,
    comprimento: comprimento,
    area: area,
    velocidade: velocidade,
    cargaCinetica: cargaCinetica,
    reynolds: reynolds,
    regime: regime,
    rugosidadeRelativa: rugosidadeRelativa,
    fatorAtrito: fatorAtrito,
    metodoAtrito: metodoAtrito,
    somaK: somaK,
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
    erros.push("Informe a aceleração da gravidade em m/s² (maior que zero).");
  }

  const vazaoM3s = lerNumero(p.vazao);
  if (isNaN(vazaoM3s) || vazaoM3s <= 0) {
    erros.push("Informe a vazão em m³/s (maior que zero). Exemplo: 0,012.");
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
      erros.push("Informe a massa específica do fluido em kg/m³ (maior que zero).");
    }
    fluidoNome = p.fluido.nome.trim() !== "" ? p.fluido.nome.trim() : "Fluido informado";
    if (!vazio(p.fluido.viscosidade)) {
      const visc = lerNumero(p.fluido.viscosidade);
      if (isNaN(visc) || visc <= 0) {
        erros.push("A viscosidade do fluido deve ser um número maior que zero.");
      } else if (p.fluido.tipoViscosidade === "cinematica") {
        nu = visc; // m²/s
      } else if (!isNaN(rho) && rho > 0) {
        nu = visc / rho; // nu = mu / rho, com mu em Pa·s
      }
    }
  }

  // Sistema
  const p1 = lerNumero(p.pressaoOrigem);
  const p2 = lerNumero(p.pressaoDestino);
  const z1 = lerNumero(p.cotaOrigem);
  const z2 = lerNumero(p.cotaDestino);
  if (isNaN(p1) || isNaN(p2)) {
    erros.push("Informe as pressões de origem e de destino em Pa (use 0 para reservatório aberto, se manométrica).");
  }
  if (isNaN(z1) || isNaN(z2)) {
    erros.push("Informe as cotas de origem e de destino em metros.");
  }

  const rendBomba = lerNumero(p.rendBomba);
  if (isNaN(rendBomba) || rendBomba <= 0 || rendBomba > 1) {
    erros.push("Informe o rendimento da bomba como fração entre 0 e 1 (exemplo: 0,72).");
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

  // Bocal (saída em jato)
  let bocal: ResultadoBocal | null = null;
  if (p.bocal.ativo) {
    const dBocal = lerNumero(p.bocal.diametro);
    let kBocal = 0;
    let bocalValido = true;
    if (isNaN(dBocal) || dBocal <= 0) {
      erros.push("Bocal: informe o diâmetro de saída em metros (maior que zero).");
      bocalValido = false;
    }
    if (!vazio(p.bocal.k)) {
      kBocal = avaliarExpressao(p.bocal.k);
      if (isNaN(kBocal) || kBocal < 0) {
        erros.push("Bocal: o K deve ser um número maior ou igual a zero (ou deixe em branco).");
        bocalValido = false;
      }
    }
    if (bocalValido && !isNaN(vazaoM3s) && !isNaN(gravidade)) {
      const area = (Math.PI * dBocal * dBocal) / 4;
      const velocidade = vazaoM3s / area;
      const cargaCinetica = (velocidade * velocidade) / (2 * gravidade);
      bocal = {
        diametro: dBocal,
        area: area,
        velocidade: velocidade,
        cargaCinetica: cargaCinetica,
        k: kBocal,
        perda: kBocal * cargaCinetica,
      };
    }
  }

  if (erros.length > 0 || recalque === null) {
    return { resultado: null, erros: erros };
  }
  if (p.bocal.ativo && bocal === null) {
    return { resultado: null, erros: ["Verifique os dados do bocal."] };
  }

  // Bernoulli entre as superfícies (velocidade na origem desprezível)
  const perdaSuccao = succao !== null ? succao.ht : 0;
  const perdaBocal = bocal !== null ? bocal.perda : 0;
  const perdaTotal = perdaSuccao + recalque.ht + perdaBocal;
  const cargaPressao = (p2 - p1) / (rho * gravidade);
  const cargaEstatica = z2 - z1;
  const cargaCineticaSaida = bocal !== null ? bocal.cargaCinetica : 0;
  const alturaManometrica = cargaPressao + cargaEstatica + cargaCineticaSaida + perdaTotal;

  // Potências
  const potenciaHidraulica = rho * gravidade * vazaoM3s * alturaManometrica;
  const potenciaEixo = potenciaHidraulica / rendBomba;

  let potenciaEletrica: number | null = null;
  let consumoMensal: number | null = null;
  let custoMensal: number | null = null;

  if (!vazio(p.rendMotor)) {
    const rendMotor = lerNumero(p.rendMotor);
    if (isNaN(rendMotor) || rendMotor <= 0 || rendMotor > 1) {
      return { resultado: null, erros: ["O rendimento do motor deve ser uma fração entre 0 e 1 (exemplo: 0,9)."] };
    }
    potenciaEletrica = potenciaEixo / rendMotor;

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
      return { resultado: null, erros: ["Informe a pressão de vapor em Pa (absoluta) e o NPSH requerido em m com valores válidos."] };
    }
    if (isNaN(razaoSegura) || razaoSegura < 1) {
      return { resultado: null, erros: ["A razão mínima segura NPSHA/NPSHR deve ser um número maior ou igual a 1."] };
    }
    if (p.tipoPressao === "manometrica" && (isNaN(atm) || atm <= 0)) {
      return { resultado: null, erros: ["Informe a pressão atmosférica em Pa para converter a pressão manométrica em absoluta."] };
    }

    let pressaoAbs = p1;
    if (p.tipoPressao === "manometrica") {
      pressaoAbs = p1 + atm;
    }

    npsh = calcularNpsh({
      pressaoOrigemAbs: pressaoAbs,
      pressaoVapor: pv,
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
        pressaoVapor: pv,
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
      bocal: bocal,
      perdaTotal: perdaTotal,
      cargaPressao: cargaPressao,
      cargaEstatica: cargaEstatica,
      cargaCineticaSaida: cargaCineticaSaida,
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
