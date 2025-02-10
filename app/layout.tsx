import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from "./providers"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Company Manager',
  description: 'Manage your company efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Analytics/>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
