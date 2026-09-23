import type { Metadata } from 'next'; import './globals.css'; import './mobile.css';
export const metadata: Metadata = { title:'Leitura Autêntica', description:'Clube de leitura compartilhado', manifest:'/manifest.webmanifest' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
