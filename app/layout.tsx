import './globals.css';
import { DataProvider } from './DataContext';
import { Sidebar } from './components/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className="dark">
      <body className="bg-slate-50 dark:bg-black antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <DataProvider>
          <div className="flex min-h-screen">
            
            {/* SIDEBAR */}
            <div className="w-72 h-screen fixed left-0 top-0 z-40">
              <Sidebar />
            </div>

            {/* CONTEÚDO: O ml-72 empurra o conteúdo para depois da sidebar */}
            <main className="flex-1 ml-72 min-h-screen">
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