import { Noto_Serif, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap'
});

export const metadata = {
  title: 'Operation Yarra',
  description:
    'Vote on activities, check the itinerary, track group expenses. Built because the group chat is not a project management tool.',
  openGraph: {
    title: 'Operation Yarra',
    description: 'A very serious planning website for a deeply unserious weekend.',
    url: 'https://vihan-bucks-weekend.vercel.app',
    images: [
      {
        url: 'https://raw.githubusercontent.com/samcanpadee-arch/vihan-bucks-weekend/refs/heads/main/assets/images/vihan-therewillbeblood.webp'
      }
    ]
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2d4a35'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${plusJakarta.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
              <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍷</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
