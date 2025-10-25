import './globals.css'
import { Inter } from 'next/font/google'
import SessionProviderWrapper from './SessionProviderWrapper'
import { Toaster } from 'react-hot-toast'
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
        <ConfigProvider theme={darkTheme}>
          <SessionProviderWrapper>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                },
              }}
            />
          </SessionProviderWrapper>
        </ConfigProvider>
      </body>
    </html>
  )
}
