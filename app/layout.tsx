import './globals.css';
import { DataProvider } from './DataContext';
import { Sidebar } from './components/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-50 dark:bg-black antialiased">
        <DataProvider>
          <div className="flex min-h-screen">
            
            {/* SIDEBAR: h-screen e fixed mantêm ela presa no canto */}
            <aside className="w-64 h-screen fixed left-0 top-0 z-40 bg-slate-900 border-r border-slate-800">
              <Sidebar />
            </aside>

            {/* CONTEÚDO: O ml-64 empurra o conteúdo para depois da sidebar */}
            <main className="flex-1 ml-64 min-h-screen">
              {/* Padding interno para o conteúdo não encostar nas bordas da tela */}
              <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}