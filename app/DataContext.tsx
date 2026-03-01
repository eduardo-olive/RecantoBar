"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- INTERFACES ATUALIZADAS (ID agora é string para o Prisma) ---
export interface Categoria { 
  id: string; 
  nome: string; 
  _count?: { produtos: number }; // Para exibir quantos itens tem na categoria
}

export interface Produto { 
  id: string; 
  nome: string; 
  precoVenda: number; 
  precoCusto: number; 
  estoque: number; 
  estoqueMinimo: number;
  estoqueSeguro: number;
  categoriaId: string; 
}

export interface Movimentacao { 
  id: string; 
  data: string; 
  desc: string; 
  pagamento?: string; 
  tipo: 'ENTRADA' | 'SAIDA'; 
  valor: number; 
}

export interface Perda {
  id: string;
  data: string;
  produtoId: string;
  qtd: number;
  motivo: string;
}

interface DataContextType {
  categorias: Categoria[];
  produtos: Produto[];
  movimentacoes: Movimentacao[];
  perdas: Perda[];
  // Funções de Categoria (API)
  carregarCategorias: () => Promise<void>;
  adicionarCategoria: (nome: string) => Promise<boolean>;
  excluirCategoria: (id: string) => Promise<boolean>;
  // Funções de Produto/Venda (Em breve serão API também)
  adicionarProduto: (p: any) => void;
  adicionarEntrada: (itens: any[]) => void;
  venderProduto: (carrinho: any[], pagamento: string) => void;
  registrarPerda: (p: Omit<Perda, 'id' | 'data'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [perdas, setPerdas] = useState<Perda[]>([]);

  // --- 1. CARREGAR DADOS (BUSCA NO BANCO) ---
  const carregarCategorias = async () => {
    try {
      const res = await fetch('/api/categorias');
      if (res.ok) {
        const dados = await res.json();
        setCategorias(dados);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias do banco:", error);
    }
  };

  useEffect(() => {
    carregarCategorias();
    // Aqui você também carregará produtos e movimentações no futuro
  }, []);

  // --- 2. ADICIONAR CATEGORIA (POST API) ---
  const adicionarCategoria = async (nome: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        await carregarCategorias(); // Atualiza a lista vinda do banco
        return true;
      } else {
        const erro = await res.json();
        alert(erro.error || "Erro ao salvar categoria");
        return false;
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      return false;
    }
  };

  // --- 3. EXCLUIR CATEGORIA (DELETE API) ---
  const excluirCategoria = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCategorias(prev => prev.filter(cat => cat.id !== id));
        return true;
      } else {
        const erro = await res.json();
        alert(erro.error || "Erro ao excluir. Verifique se há produtos vinculados.");
        return false;
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      return false;
    }
  };

  // --- LÓGICA DE PRODUTOS (MANTEREMOS LOCAL POR ENQUANTO) ---
  // Nota: Estas funções serão as próximas a serem migradas para API

  const adicionarProduto = (p: any) => {
    const novo = { ...p, id: Math.random().toString(), estoque: 0 };
    setProdutos(prev => [...prev, novo]);
  };

  const adicionarEntrada = (itensEntrada: any[]) => {
    if (itensEntrada.length === 0) return;
    setProdutos(prevProdutos => {
      return prevProdutos.map(prod => {
        const itemNovo = itensEntrada.find(i => i.produtoId === prod.id);
        if (itemNovo) {
          return {
            ...prod,
            estoque: (prod.estoque || 0) + Number(itemNovo.qtd),
            precoVenda: Number(itemNovo.precoVenda)
          };
        }
        return prod;
      });
    });
    // Log de movimentação...
  };

  const venderProduto = (carrinho: any[], pagamento: string) => {
    let total = 0;
    setProdutos(prev => prev.map(prod => {
      const item = carrinho.find(c => c.produtoId === prod.id);
      if (item) {
        total += prod.precoVenda * item.qtd;
        return { ...prod, estoque: prod.estoque - item.qtd };
      }
      return prod;
    }));
    // Log de movimentação...
  };

  const registrarPerda = (p: Omit<Perda, 'id' | 'data'>) => {
    const produtoAlvo = produtos.find(prod => prod.id === p.produtoId);
    if (!produtoAlvo) return;
    setProdutos(prev => prev.map(prod => 
      prod.id === p.produtoId ? { ...prod, estoque: prod.estoque - p.qtd } : prod
    ));
  };

  return (
    <DataContext.Provider value={{ 
      categorias, 
      produtos, 
      movimentacoes, 
      perdas,
      carregarCategorias,
      adicionarCategoria, 
      excluirCategoria,
      adicionarProduto, 
      adicionarEntrada, 
      venderProduto,
      registrarPerda
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData deve ser usado dentro de um DataProvider");
  return context;
};