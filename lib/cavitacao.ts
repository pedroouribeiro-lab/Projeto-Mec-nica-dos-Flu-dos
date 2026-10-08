// HydroCalc Pro - limites de projeto para evitar cavitação na sucção
// Usa o motor de cálculo completo, variando apenas o diâmetro da sucção ou a vazão.
// Todas as grandezas em unidades do Sistema Internacional (m e m³/s).

import { calcularProjeto, type Projeto } from "./hidraulica";

export type Limite = {
  valor: number | null; // diâmetro em m ou vazão em m³/s
  motivo: string | null; // explica por que não foi possível calcular
};

// NPSH disponível para um diâmetro de sucção, uma vazão e uma cota de origem.
// Devolve -Infinity quando o cálculo não é possível (por exemplo, rugosidade maior que o diâmetro).
function npshDisponivel(
  p: Projeto,
  diametro: number,
  vazao: number,
  cotaOrigem: number
): number {
  const teste: Projeto = {
    ...p,
    vazao: String(vazao),
    cotaOrigem: String(cotaOrigem),
    succao: { ...p.succao, diametro: String(diametro) },
  };
  const resposta = calcularProjeto(teste);
  if (resposta.resultado === null || resposta.resultado.npsh === null) {
    return -Infinity;
  }
  return resposta.resultado.npsh.npshDisponivel;
}

// Menor diâmetro de sucção (m) para o qual NPSH disponível >= alvo
export function diametroMinimo(
  p: Projeto,
  vazao: number,
  cotaOrigem: number,
  alvoNpsh: number
): Limite {
  const minimo = 0.002;
  const maximo = 2;

  if (npshDisponivel(p, maximo, vazao, cotaOrigem) < alvoNpsh) {
    return {
      valor: null,
      motivo:
        "Mesmo com diâmetro muito grande o NPSH disponível não atinge o alvo. A limitação está na altura de sucção, na temperatura ou na pressão de origem.",
    };
  }
  if (npshDisponivel(p, minimo, vazao, cotaOrigem) >= alvoNpsh) {
    return { valor: minimo, motivo: null };
  }

  let baixo = minimo;
  let alto = maximo;
  for (let i = 0; i < 80; i++) {
    const meio = (baixo + alto) / 2;
    if (npshDisponivel(p, meio, vazao, cotaOrigem) >= alvoNpsh) {
      alto = meio;
    } else {
      baixo = meio;
    }
  }
  return { valor: alto, motivo: null };
}

// Maior vazão (m³/s) para o diâmetro de sucção instalado sem que o NPSH disponível fique abaixo do alvo
export function vazaoMaxima(
  p: Projeto,
  diametro: number,
  cotaOrigem: number,
  alvoNpsh: number
): Limite {
  const minima = 0.000001;
  const maxima = 5;

  if (npshDisponivel(p, diametro, minima, cotaOrigem) < alvoNpsh) {
    return {
      valor: null,
      motivo:
        "Mesmo com vazão muito baixa o NPSH disponível não atinge o alvo. A limitação está na altura de sucção, na temperatura ou na pressão de origem.",
    };
  }
  if (npshDisponivel(p, diametro, maxima, cotaOrigem) >= alvoNpsh) {
    return { valor: maxima, motivo: null };
  }

  let baixo = minima;
  let alto = maxima;
  for (let i = 0; i < 80; i++) {
    const meio = (baixo + alto) / 2;
    if (npshDisponivel(p, diametro, meio, cotaOrigem) >= alvoNpsh) {
      baixo = meio;
    } else {
      alto = meio;
    }
  }
  return { valor: baixo, motivo: null };
}
