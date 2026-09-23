import type { Metadata } from 'next'; import './globals.css';
export const metadata: Metadata = { title:'Entre Páginas', description:'Clube de leitura compartilhado', manifest:'/manifest.webmanifest' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
