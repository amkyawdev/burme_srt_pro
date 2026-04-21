import { Inter, Noto_Sans_Myanmar } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const notoSansMyanmar = Noto_Sans_Myanmar({
  subsets: ['myanmar'],
  weight: ['400', '700'],
  variable: '--font-noto-myanmar',
})

export const metadata = {
  title: 'Burme SRT Pro - Social Media Style Subtitle Generator',
  description: 'Create beautiful SRT subtitles for your videos with Burmese + English support',
  keywords: ['SRT', 'Myanmar', 'Subtitle', 'YouTube', 'Burmese', 'Generator'],
  authors: [{ name: 'Aung Myo Kyaw' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="my" className={`${inter.variable} ${notoSansMyanmar.variable}`}>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-[#eef5ff] to-[#d9eaff]">
        {children}
      </body>
    </html>
  )
}
