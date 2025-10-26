import './globals.css'
import { Inter } from 'next/font/google'
import SessionProviderWrapper from './SessionProviderWrapper'
import { ConfigProvider } from 'antd'
import darkTheme from '@/lib/theme'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'GrowthTracker - Personal Growth & Collaboration',
  description: 'Track your personal growth with notes, todos, goals, and collaborate with others',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider 
          theme={darkTheme}
          notification={{
            placement: 'topRight',
            duration: 3,
          }}
        >
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </ConfigProvider>
      </body>
    </html>
  )
}
