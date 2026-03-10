"use client";

import { useState } from "react";
import { Coins, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SaldoInicialPage() {
  const [valor, setValor] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/caixa/abrir', {
      method: 'POST',
      body: JSON.stringify({ valor: parseFloat(valor) }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      alert("Caixa aberto com sucesso!");
      // Redireciona para o dashboard
      window.location.href = "/dashboard";
    }
  }


  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* Cabeçalho inspirado no seu layout de 'Produtos' */}
      <div className="mb-10 border-l-4 border-blue-600 pl-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">
          Saldo <span className="text-blue-600">Inicial</span>
        </h1>
        <p className="text-slate-500 uppercase text-xs font-bold tracking-widest mt-1">
          Defina o capital disponível para compras e estoque
        </p>
      </div>

      {/* Card Centralizado estilo Dashboard */}
      <div className="max-w-xl mx-auto bg-[#0f172a] border border-slate-800 rounded-[32px] p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center gap-5 mb-4">
            <div className="bg-blue-600/20 p-4 rounded-2xl">
              <Coins className="text-blue-600" size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Entrada de Capital</p>
              <h3 className="text-xl font-bold uppercase italic">Abertura de Caixa</h3>
            </div>
          </div>

          {/* Campo de Valor com o estilo dos seus inputs de Produtos */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
              Valor para Investimento (R$)
            </label>
            <input 
              type="number"
              required
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full bg-[#1e293b] border-none rounded-2xl p-6 text-4xl font-black text-blue-500 outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-700"
            />
          </div>

          {/* Botão de Ação seguindo o padrão 'Registrar Item' */}
          <div className="flex gap-4 pt-4">
            <Link 
              href="/dashboard"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-tighter"
            >
              <ArrowLeft size={18} /> Voltar
            </Link>
            
            <button 
              type="submit"
              className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 uppercase text-xs tracking-tighter"
            >
              <Save size={18} /> Confirmar Saldo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}