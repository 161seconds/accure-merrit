import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useAuth } from '@/contexts/AuthContext'
import FloatingAssistant from '@/components/ui/FloatingAssistant'

export default function Layout() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="relative flex flex-col min-h-screen page-bg">
            <Header />

            <main className="flex flex-col flex-1 overflow-hidden">
                <Outlet />
            </main>

            {isAuthenticated && <Footer />}

            {isAuthenticated && <FloatingAssistant />}
        </div>
    )
}