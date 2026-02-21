import { Trash2 } from 'lucide-react';

interface ListaProps {
  categorias: string[];
  onExcluir: (index: number) => void;
}

export function ListaCategorias({ categorias, onExcluir }: ListaProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700">Categorias Cadastradas</h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {categorias.length === 0 ? (
          <li className="p-4 text-center text-gray-500 italic">Nenhuma categoria encontrada.</li>
        ) : (
          categorias.map((cat, index) => (
            <li key={index} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-800 font-medium">{cat}</span>
              <button
                onClick={() => onExcluir(index)}
                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition-all flex items-center gap-1"
                title="Excluir categoria"
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}