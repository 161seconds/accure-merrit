import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import HomePage from '@/pages/HomePage'
import KarmaPage from '@/pages/KarmaPage'
import IncensePage from '@/pages/IncensePage'
import WoodenFishPage from '@/pages/WoodenFishPage'
import SettingsPage from '@/pages/SettingsPage'
import DonationPage from '@/pages/DonationPage'
import ChatPage from '@/pages/ChatPage'
import TaskPage from '@/pages/TaskPage'

export default function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(13, 10, 4, 0.95)',
                        color: '#F0E6C8',
                        border: '1px solid rgba(201, 168, 76, 0.3)',
                        fontSize: '13px',
                        fontFamily: "'Noto Serif', serif"
                    }
                }}
            />

            <Routes>
                <Route element={<Layout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/karma" element={<KarmaPage />} />
                        <Route path="/incense" element={<IncensePage />} />
                        <Route path="/wooden-fish" element={<WoodenFishPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/tasks" element={<TaskPage />} />
                        <Route path="/donate" element={<DonationPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                    </Route>
                </Route>
            </Routes>
        </>
    )
}