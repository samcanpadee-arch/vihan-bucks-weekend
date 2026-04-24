import './globals.css';

export const metadata = {
  title: "Vihan's Yarra Valley Bucks Weekend",
  description: 'Trip hub and itinerary for Vihan\'s Yarra Valley bucks weekend.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
