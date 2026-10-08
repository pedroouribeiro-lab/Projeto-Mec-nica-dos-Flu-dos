"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { projetoVazio, type Projeto } from "../lib/hidraulica";

type Contexto = {
  projeto: Projeto;
  carregado: boolean;
  atualizar: (mudar: (anterior: Projeto) => Projeto) => void;
  limpar: () => void;
};

const CHAVE = "hydrocalc-projeto-sessao";

const ProjetoContext = createContext<Contexto | null>(null);

// Junta o que estava salvo com o modelo atual, para não quebrar se faltar algum campo
function mesclar(salvo: Partial<Projeto>): Projeto {
  const base = projetoVazio();
  return {
    ...base,
    ...salvo,
    membros:
      Array.isArray(salvo.membros) && salvo.membros.length > 0
        ? salvo.membros
        : base.membros,
    fluido: { ...base.fluido, ...(salvo.fluido ?? {}) },
    succao: { ...base.succao, ...(salvo.succao ?? {}) },
    recalque: { ...base.recalque, ...(salvo.recalque ?? {}) },
    bocal: { ...base.bocal, ...(salvo.bocal ?? {}) },
  };
}

export function ProjetoProvider({ children }: { children: ReactNode }) {
  const [projeto, setProjeto] = useState<Projeto>(projetoVazio());
  const [carregado, setCarregado] = useState<boolean>(false);

  // Ao recarregar a página, recupera os dados digitados nesta aba (a sessão termina ao fechar a aba)
  useEffect(() => {
    try {
      const texto = window.sessionStorage.getItem(CHAVE);
      if (texto !== null) {
        setProjeto(mesclar(JSON.parse(texto) as Partial<Projeto>));
      }
    } catch {
      // se não for possível ler, segue com o projeto vazio
    }
    setCarregado(true);
  }, []);

  // Salva a cada alteração (somente depois de carregar)
  useEffect(() => {
    if (!carregado) {
      return;
    }
    try {
      window.sessionStorage.setItem(CHAVE, JSON.stringify(projeto));
    } catch {
      // se não for possível salvar, o site continua funcionando
    }
  }, [projeto, carregado]);

  function atualizar(mudar: (anterior: Projeto) => Projeto) {
    setProjeto((anterior) => mudar(anterior));
  }

  function limpar() {
    setProjeto(projetoVazio());
  }

  return (
    <ProjetoContext.Provider
      value={{ projeto, carregado, atualizar, limpar }}
    >
      {children}
    </ProjetoContext.Provider>
  );
}

export function useProjeto(): Contexto {
  const contexto = useContext(ProjetoContext);
  if (contexto === null) {
    throw new Error("useProjeto deve ser usado dentro de ProjetoProvider");
  }
  return contexto;
}
