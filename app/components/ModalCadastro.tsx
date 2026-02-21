"use client";
import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nome: string, preco: number, qtd: number) => boolean; // Mudança aqui
}

export default function ModalCadastro({ isOpen, onClose, onSave }: ModalProps) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [qtd, setQtd] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !preco || !qtd) return alert("Preencha todos os campos");
    
    // Tenta salvar e verifica se foi permitido
    const sucesso = onSave(nome, parseFloat(preco), parseInt(qtd));
    
    if (sucesso) {
      setNome(''); 
      setPreco(''); 
      setQtd('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Nova Bebida</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nome do Produto</label>
            <input 
              type="text" value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-black focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder="Ex: Coca-Cola 350ml"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preço (R$)</label>
              <input 
                type="number" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-black focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estoque Inicial</label>
              <input 
                type="number" value={qtd} onChange={(e) => setQtd(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-black focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder="0"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 mt-4"
          >
            CONFIRMAR CADASTRO
          </button>
        </form>
      </div>
    </div>
  );
}