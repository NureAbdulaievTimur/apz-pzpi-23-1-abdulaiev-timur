import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Settings, Globe, Wind, LogOut, UserCircle } from 'lucide-react';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import './i18n/i18n';

const AppLayout = ({ children, user, onLogout }) => {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'uk' : 'en');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-primary flex flex-col">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                            <Wind className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">{t('app_title')}</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <Link to="/" className={`flex items-center gap-2 font-medium transition-colors ${location.pathname === '/' ? 'text-secondary' : 'text-slate-500 hover:text-primary'}`}>
                            <LayoutDashboard size={18} /> {t('dashboard')}
                        </Link>
                        
                        {user.role === 2 && (
                            <Link to="/admin" className={`flex items-center gap-2 font-medium transition-colors ${location.pathname.includes('/admin') ? 'text-secondary' : 'text-slate-500 hover:text-primary'}`}>
                                <Settings size={18} /> {t('admin_panel')}
                            </Link>
                        )}

                        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-600 flex items-center gap-2 hidden sm:flex">
                                <UserCircle size={18} className="text-slate-400"/>
                                {user.firstName} {user.lastName}
                            </span>
                            
                            <button onClick={toggleLanguage} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full font-bold text-sm transition-colors">
                                <Globe size={16} /> {i18n.language === 'en' ? 'Eng' : 'Укр'}
                            </button>

                            <button onClick={onLogout} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium transition-colors" title={t('logout')}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow">{children}</main>
        </div>
    );
};

const App = () => {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('climaUser')) || null);

    const handleLogin = (userData) => {
        localStorage.setItem('climaUser', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('climaUser');
        setUser(null);
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    if (user.role === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center relative">
                
                <div className="absolute top-6 right-6">
                    <button onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'uk' : 'en')} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-full font-bold text-sm transition-colors text-slate-700 shadow-sm">
                        <Globe size={16} className="text-secondary" /> {i18n.language === 'en' ? 'Eng' : 'Укр'}
                    </button>
                </div>

                <Wind className="text-secondary mb-4" size={48} />
                <h1 className="text-3xl font-bold text-primary mb-2">
                    {t('welcome_user', { name: user.firstName })}
                </h1>
                <p className="text-slate-500 mb-8 max-w-md leading-relaxed">
                    {t('employee_warning')}
                </p>
                <button onClick={handleLogout} className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2 shadow-sm">
                    <LogOut size={18} /> {t('logout')}
                </button>
            </div>
        );
    }

    return (
        <Router>
            <AppLayout user={user} onLogout={handleLogout}>
                <Routes>
                    
                    <Route path="/" element={<ManagerDashboard currentUser={user} />} />
                    
                    
                    <Route path="/admin" element={
                        user.role === 2 ? <AdminDashboard /> : <Navigate to="/" />
                    } />
                </Routes>
            </AppLayout>
        </Router>
    );
};

export default App;