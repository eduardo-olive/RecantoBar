"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- INTERFACES ---
export interface Categoria { id: number; nome: string; }
export interface Produto { 
  id: number; 
  nome: string; 
  preco: number; 
  precoCusto: number; 
  estoque: number; 
  estoqueMinimo: number;
  estoqueSeguro: number;
  categoriaId: number; 
}
export interface Movimentacao { 
  id: number; 
  data: string; 
  desc: string; 
  pagamento?: string; 
  tipo: 'ENTRADA' | 'SAIDA'; 
  valor: number; 
}
export interface Perda {
  id: number;
  data: string;
  produtoId: number;
  qtd: number;
  motivo: string;
}

interface DataContextType {
  categorias: Categoria[];
  produtos: Produto[];
  movimentacoes: Movimentacao[];
  perdas: Perda[];
  adicionarProduto: (p: any) => void;
  adicionarEntrada: (itens: any[]) => void;
  venderProduto: (carrinho: any[], pagamento: string) => void;
  registrarPerda: (p: Omit<Perda, 'id' | 'data'>) => void;
  adicionarCategoria: (nome: string) => void;
  excluirCategoria: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Inicializa como array vazio para ser 100% dinâmico
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [perdas, setPerdas] = useState<Perda[]>([]);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const c = localStorage.getItem('@sys:categorias');
    const p = localStorage.getItem('@sys:produtos');
    const m = localStorage.getItem('@sys:movimentacoes');
    const per = localStorage.getItem('@sys:perdas');
    
    if (c) setCategorias(JSON.parse(c));
    if (p) setProdutos(JSON.parse(p));
    if (m) setMovimentacoes(JSON.parse(m));
    if (per) setPerdas(JSON.parse(per));
  }, []);

  // --- SALVAR DADOS ---
  useEffect(() => {
    localStorage.setItem('@sys:categorias', JSON.stringify(categorias));
    localStorage.setItem('@sys:produtos', JSON.stringify(produtos));
    localStorage.setItem('@sys:movimentacoes', JSON.stringify(movimentacoes));
    localStorage.setItem('@sys:perdas', JSON.stringify(perdas));
  }, [categorias, produtos, movimentacoes, perdas]);

  // --- IMPLEMENTAÇÃO DAS CATEGORIAS ---
  const adicionarCategoria = (nome: string) => {
    const nova = { 
      id: Date.now(), 
      nome: nome.toUpperCase().trim() 
    };
    setCategorias(prev => [...prev, nova]);
  };

  const excluirCategoria = (id: number) => {
    setCategorias(prev => prev.filter(cat => cat.id !== id));
    // Opcional: Você pode adicionar lógica aqui para avisar se houver produtos vinculados
  };

  const adicionarProduto = (p: any) => {
    setProdutos(prev => [...prev, { 
      ...p, 
      id: Date.now(), 
      nome: p.nome.toUpperCase(),
      estoque: 0 
    }]);
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
            preco: Number(itemNovo.precoVenda)
          };
        }
        return prod;
      });
    });

    const totalCusto = itensEntrada.reduce((acc, i) => acc + (i.precoCusto * i.qtd), 0);
    setMovimentacoes(prev => [...prev, {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      desc: `ENTRADA: ${itensEntrada.length} ITENS`,
      tipo: 'SAIDA',
      valor: totalCusto
    }]);
  };

  const venderProduto = (carrinho: any[], pagamento: string) => {
    let total = 0;
    setProdutos(prev => prev.map(prod => {
      const item = carrinho.find(c => c.produtoId === prod.id);
      if (item) {
        total += prod.preco * item.qtd;
        return { ...prod, estoque: prod.estoque - item.qtd };
      }
      return prod;
    }));

    setMovimentacoes(prev => [...prev, {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      desc: `VENDA PDV - ${carrinho.length} ITENS`,
      pagamento,
      tipo: 'ENTRADA',
      valor: total
    }]);
  };

  const registrarPerda = (p: Omit<Perda, 'id' | 'data'>) => {
    const produtoAlvo = produtos.find(prod => prod.id === p.produtoId);
    if (!produtoAlvo) return;

    const novaPerda: Perda = {
      ...p,
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR')
    };
    setPerdas(prev => [...prev, novaPerda]);

    setProdutos(prev => prev.map(prod => 
      prod.id === p.produtoId ? { ...prod, estoque: prod.estoque - p.qtd } : prod
    ));

    setMovimentacoes(prev => [...prev, {
      id: Date.now(),
      data: new Date().toLocaleString('pt-BR'),
      desc: `PERDA: ${produtoAlvo.nome} (${p.motivo})`,
      tipo: 'SAIDA',
      valor: produtoAlvo.precoCusto * p.qtd
    }]);
  };

  return (
    <DataContext.Provider value={{ 
      categorias, 
      produtos, 
      movimentacoes, 
      perdas,
      adicionarProduto, 
      adicionarEntrada, 
      venderProduto,
      registrarPerda,
      adicionarCategoria, // Exportado
      excluirCategoria    // Exportado
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