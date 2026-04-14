import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout() {
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen flex flex-col page-bg">
            <Header />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Outlet />
            </main>
            {isAuthenticated && <Footer />}
        </div>
    )
}