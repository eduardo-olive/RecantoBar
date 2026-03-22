import './globals.css';
import { DataProvider } from './DataContext';
import { AuthProvider } from './components/AuthProvider';
import { AppShell } from './components/AppShell';

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
        <AuthProvider>
          <DataProvider>
            <AppShell>
              {children}
            </AppShell>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
