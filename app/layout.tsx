import type { Metadata } from 'next'; import './globals.css'; import './mobile.css'; import './home.css'; import './books.css'; import './compact.css';
export const metadata: Metadata = { title:'Leitura Autêntica', description:'Clube de leitura compartilhado', manifest:'/manifest.webmanifest', icons:{icon:'/logo-autentica.png',apple:'/logo-autentica.png'} };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR"><body>{children}</body></html>; }
