import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Wind } from 'lucide-react';
import api from '../services/api';

const Login = ({ onLogin }) => {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'uk' : 'en');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/Users/login', { email, password });
            onLogin(res.data);
        } catch (err) {
            setError(t('invalid_credentials'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative">
            
            <div className="absolute top-6 right-6">
                <button onClick={toggleLanguage} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2 rounded-full font-bold text-sm transition-colors text-slate-700 shadow-sm">
                    <Globe size={16} className="text-secondary" /> {i18n.language === 'en' ? 'Eng' : 'Укр'}
                </button>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 w-full max-w-md">
                
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 shadow-md">
                        <Wind className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-primary">{t('login')}</h1>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium animate-fade-in">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">{t('email')}</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required
                            placeholder="mail@example.com"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 mb-2">{t('password')}</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required
                            placeholder="••••••••"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary transition-all" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-sm mt-2">
                        {t('login_button')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;