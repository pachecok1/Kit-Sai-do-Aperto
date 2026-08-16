import './globals.css';

export const metadata = {
  title: 'Kit Sai do Aperto',
  description: 'Organize suas finanças e respire mais tranquilo todo mês.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
