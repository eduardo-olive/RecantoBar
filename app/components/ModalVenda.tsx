"use client";
import React, { useState, useEffect } from 'react';

interface Bebida {
  id: number;
  nome: string;
  preco: number;
  qtd: number;
}

interface ModalVendaProps {
  isOpen: boolean;
  onClose: () => void;
  bebida: Bebida | null;
  onConfirm: (quantidade: number, formaPagamento: string) => void;
}

export default function ModalVenda({ isOpen, onClose, bebida, onConfirm }: ModalVendaProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [pagamento, setPagamento] = useState('DINHEIRO');

  useEffect(() => {
    if (!isOpen) return;

    setQuantidade(1);
    setPagamento('DINHEIRO');

  }, [isOpen]);

  if (!isOpen || !bebida) return null;

  const total = bebida.preco * quantidade;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantidade > bebida.qtd) return alert("Quantidade superior ao estoque disponível!");
    if (quantidade <= 0) return alert("Informe uma quantidade válida!");
    
    onConfirm(quantidade, pagamento);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">Confirmar Venda</h2>
        <p className="text-blue-600 font-bold mb-6">{bebida.nome}</p>
        
        <form onSubmit={handleConfirm} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quantidade (Max: {bebida.qtd})</label>
            <input 
              type="number" min="1" max={bebida.qtd} value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value))}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-black focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-1 gap-2">
              {['PIX', 'DINHEIRO', 'CARTÂO'].map((tipo) => (
                <button
                  key={tipo} type="button"
                  onClick={() => setPagamento(tipo)}
                  className={`p-3 rounded-xl font-black text-xs transition ${pagamento === tipo ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="font-bold text-gray-400">TOTAL:</span>
            <span className="text-3xl font-black text-gray-900">R$ {total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">CANCELAR</button>
            <button type="submit" className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition shadow-lg shadow-emerald-100">FINALIZAR VENDA</button>
          </div>
        </form>
      </div>
    </div>
  );
}