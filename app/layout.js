import '../styles/index.css';
import 'tailwindcss/tailwind.css';

export const metadata = {
  title: 'Vivek Patel Portfolio - Computer Engineering Student',
  description: "Vivek Patel's (vivek9patel) Personal Portfolio Website. Made with Ubuntu 20.4 (Linux) theme by Next.js and Tailwind CSS.",
  keywords: "vivek9patel, vivek9patel's portfolio, vivek9patel linux, ubuntu portfolio, vivek patel protfolio,vivek patel computer, vivek patel, vivek ubuntu, vivek patel ubuntu portfolio",
  authors: [{ name: 'Vivek Patel (vivek9patel)' }],
  robots: 'index, follow',
  themeColor: '#E95420',
  openGraph: {
    title: 'Vivek Patel Portfolio - Computer Engineering Student',
    description: "Vivek Patel's (vivek9patel) Personal Portfolio Website. Made with Ubuntu 20.4 (Linux) theme by Next.js and Tailwind CSS.",
    url: 'http://vivek9patel.github.io/',
    siteName: 'Vivek Patel Personal Portfolio',
    images: [
      {
        url: 'images/logos/logo_1200.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Vivek Patel Portfolio - Computer Engineering Student',
    description: "Vivek Patel's (vivek9patel) Personal Portfolio Website. Made with Ubuntu 20.4 (Linux) theme by Next.js and Tailwind CSS.",
    site: 'vivek9patel',
    creator: 'vivek9patel',
    images: ['images/logos/logo_1024.png'],
  },
  icons: {
    icon: 'images/logos/fevicon.svg',
    apple: 'images/logos/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" as="style" />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
