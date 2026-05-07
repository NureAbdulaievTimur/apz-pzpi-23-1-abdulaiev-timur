import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Thermometer, Droplets, Wind, Settings2, Save, MessageSquare } from 'lucide-react';
import api from '../services/api';

const ManagerDashboard = ({ currentUser }) => {
    const { t, i18n } = useTranslation();
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelectedLocationId] = useState("");
    const [device, setDevice] = useState(null);
    const [climateData, setClimateData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    
    const [rules, setRules] = useState(null);
    const [ruleForm, setRuleForm] = useState({
        minTemperature: 18, maxTemperature: 25,
        minHumidity: 30, maxHumidity: 60, maxCo2Level: 800
    });

    useEffect(() => {
        if (currentUser) fetchAssignedLocations();
    }, [currentUser]);

    useEffect(() => {
        if (selectedLocationId) fetchZoneData(selectedLocationId);
    }, [selectedLocationId]);

    useEffect(() => {
        if (!device) return;
        const interval = setInterval(() => fetchReadings(device.id), 5000);
        return () => clearInterval(interval);
    }, [device]);

    const fetchAssignedLocations = async () => {
        try {
            const res = await api.get(`/Users/${currentUser.id}/locations`);
            setLocations(res.data);
            if (res.data.length > 0) setSelectedLocationId(res.data[0].id);
        } catch (err) { console.error("Error fetching locations", err); }
    };

    const fetchZoneData = async (locId) => {
        try {
            const devicesRes = await api.get('/Devices');
            const targetDevice = devicesRes.data.find(d => d.locationId === parseInt(locId));
            
            if (targetDevice) {
                setDevice(targetDevice);
                fetchReadings(targetDevice.id);
                fetchRules(targetDevice.id);
                fetchFeedbacks(targetDevice.id);
            } else {
                setDevice(null);
                setClimateData(null);
                setFeedbacks([]);
            }
        } catch (err) { console.error(err); }
    };

    const fetchReadings = async (deviceId) => {
        try {
            const res = await api.get(`/Readings/history/${deviceId}`);
            if (res.data.length > 0) setClimateData(res.data[0]);
        } catch (err) { console.error(err); }
    };

    const fetchFeedbacks = async (deviceId) => {
        try {
            const res = await api.get(`/Feedback/${deviceId}`);
            setFeedbacks(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchRules = async (deviceId) => {
        try {
            const res = await api.get(`/ClimateRules/device/${deviceId}`);
            setRules(res.data);
            setRuleForm(res.data);
        } catch (err) {
            setRules(null);
            setRuleForm({
                minTemperature: 18, maxTemperature: 25,
                minHumidity: 30, maxHumidity: 60, maxCo2Level: 800
            });
        }
    };

    const handleSaveRules = async () => {
        try {
            if (rules) {
                await api.put(`/ClimateRules/${rules.id}`, { ...ruleForm, id: rules.id, deviceId: device.id });
            } else {
                const { id, ...formWithoutId } = ruleForm; 
                await api.post('/ClimateRules', { ...formWithoutId, deviceId: device.id });
            }
            alert(t('save_settings') + " - OK!");
            fetchRules(device.id);
        } catch (err) { alert(err.response?.data || "Error saving rules"); }
    };

    const formatLocalizedDate = (dateString) => {
        if (!dateString) return "";
        return new Intl.DateTimeFormat(i18n.language, {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <header className="mb-10 text-center flex flex-col items-center">
                <p className="text-secondary font-semibold uppercase tracking-wider text-sm mb-2">{t('dashboard')}</p>
                
                {locations.length === 0 ? (
                    <h2 className="text-2xl font-bold text-slate-400 py-4">{t('no_locations_assigned')}</h2>
                ) : (
                    <select 
                        className="text-3xl font-extrabold text-primary bg-transparent border-b-2 border-slate-300 focus:border-secondary outline-none py-2 text-center text-center-last cursor-pointer"
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                    >
                        <option value="" disabled>{t('select_zone')}</option>
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                )}

                <p className="text-slate-400 mt-3 text-sm">
                    {t('last_updated')} {climateData ? formatLocalizedDate(climateData.timestamp) : '-'}
                </p>
            </header>

            {locations.length > 0 && (
                !device ? (
                    <div className="text-center text-slate-400 py-20 text-lg bg-white rounded-3xl border border-slate-100">{t('no_device')}</div>
                ) : !climateData ? (
                    <div className="text-center text-slate-400 py-20 text-lg bg-white rounded-3xl border border-slate-100">{t('awaiting_data')}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <MetricCard title={t('temperature')} value={`${climateData.temperature}°C`} icon={<Thermometer />} color="bg-orange-50 text-orange-600" />
                            <MetricCard title={t('humidity')} value={`${climateData.humidity}%`} icon={<Droplets />} color="bg-blue-50 text-blue-600" />
                            <MetricCard title={t('air_quality')} value={`${climateData.co2Level} ppm`} icon={<Wind />} color={climateData.co2Level > (ruleForm.maxCo2Level||800) ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
                                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                    <Settings2 className="text-secondary"/> {t('climate_settings')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <InputField label={t('min_temp')} type="number" value={ruleForm.minTemperature} onChange={e => setRuleForm({...ruleForm, minTemperature: e.target.value})} />
                                    <InputField label={t('max_temp')} type="number" value={ruleForm.maxTemperature} onChange={e => setRuleForm({...ruleForm, maxTemperature: e.target.value})} />
                                    <InputField label={t('min_hum')} type="number" value={ruleForm.minHumidity} onChange={e => setRuleForm({...ruleForm, minHumidity: e.target.value})} />
                                    <InputField label={t('max_hum')} type="number" value={ruleForm.maxHumidity} onChange={e => setRuleForm({...ruleForm, maxHumidity: e.target.value})} />
                                    <InputField label={t('max_co2')} type="number" value={ruleForm.maxCo2Level} onChange={e => setRuleForm({...ruleForm, maxCo2Level: e.target.value})} />
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleSaveRules} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium w-full sm:w-auto justify-center">
                                        <Save size={18} /> {t('save_settings')}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">
                                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                                    <MessageSquare className="text-emerald-500"/> {t('feedback_list')}
                                </h3>
                                {feedbacks.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">{t('no_feedback')}</p>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                        {feedbacks.map(f => (
                                            <div key={f.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                                <span className="font-medium text-slate-700">{f.type}</span>
                                                <span className="text-xs text-slate-400">{formatLocalizedDate(f.timestamp)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )
            )}
        </div>
    );
};

const InputField = ({ label, type, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm font-semibold text-slate-500 mb-2">{label}</label>
        <input type={type} value={value} onChange={onChange} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all" />
    </div>
);

const MetricCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className={`p-4 rounded-full mb-4 ${color} transition-transform group-hover:scale-110`}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <p className="text-slate-500 font-medium mb-1">{title}</p>
        <p className="text-3xl font-black text-primary">{value}</p>
    </div>
);

export default ManagerDashboard;