import type { Metadata } from 'next';
import './globals.css';

// Configuración de los metadatos
export const metadata: Metadata = {
  title: 'BonkUpload',
  description: 'The official Bonk app to upload, download, and share files — fast and simple.',
  generator: 'v0.dev',
  openGraph: {
    title: 'BonkUpload',
    description: 'The official Bonk app to upload, download, and share files — fast and simple.',
    url: 'http://bonkupload.fun/',  // Reemplaza con tu dominio
    siteName: 'BonkUpload',
    images: [
      {
        url: '/logo-bonkupload.png', // Ruta relativa al ícono
        width: 1200,
        height: 630,
        alt: 'BonkUpload Logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BonkUpload',
    description: 'The official Bonk app to upload, download, and share files — fast and simple.',
    images: ['/logo-bonkupload.png'], // Ruta relativa al ícono
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Enlaza el ícono de la aplicación */}
        <link rel="icon" href="/logo-bonkupload.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
