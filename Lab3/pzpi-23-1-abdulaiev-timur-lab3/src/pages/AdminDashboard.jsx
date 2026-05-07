import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Download, Upload, Activity, Users, MapPin, Cpu, Bell } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [devices, setDevices] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'overview') {
                const res = await api.get('/Admin/stats');
                setStats(res.data);
            } else if (activeTab === 'users') {
                const res = await api.get('/Users');
                setUsers(res.data);
                const locRes = await api.get('/Locations');
                setLocations(locRes.data);
            } else if (activeTab === 'locations') {
                const res = await api.get('/Locations');
                setLocations(res.data);
            } else if (activeTab === 'devices') {
                const res = await api.get('/Devices');
                setDevices(res.data);
                const locRes = await api.get('/Locations');
                setLocations(locRes.data);
            } else if (activeTab === 'alerts') {
                const res = await api.get('/Alerts');
                setAlerts(res.data);
            }
        } catch (error) { console.error("Data fetch failed", error); }
    };

    const tabs = [
        { id: 'overview', label: t('overview') || 'Overview', icon: <Activity size={18}/> },
        { id: 'users', label: t('users') || 'Users', icon: <Users size={18}/> },
        { id: 'locations', label: t('locations') || 'Locations', icon: <MapPin size={18}/> },
        { id: 'devices', label: t('devices') || 'Devices', icon: <Cpu size={18}/> },
        { id: 'alerts', label: t('alerts') || 'Alerts', icon: <Bell size={18}/> },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3 mb-8">
                <ShieldAlert className="text-secondary" size={32} />
                {t('admin_panel') || 'Admin Panel'}
            </h1>

            <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 whitespace-nowrap
                        ${activeTab === tab.id ? 'border-secondary text-secondary bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-primary hover:bg-slate-50'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && <OverviewTab stats={stats} t={t} />}
            {activeTab === 'users' && <UsersTab users={users} locations={locations} refresh={fetchData} t={t} />}
            {activeTab === 'locations' && <LocationsTab locations={locations} refresh={fetchData} t={t} />}
            {activeTab === 'devices' && <DevicesTab devices={devices} locations={locations} refresh={fetchData} t={t} />}
            {activeTab === 'alerts' && <AlertsTab alerts={alerts} refresh={fetchData} t={t} />}
        </div>
    );
};


const OverviewTab = ({ stats, t }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {stats && (
                <div className="grid grid-cols-2 gap-4 h-fit">
                    <StatCard title={t('total_users') || "Total Users"} value={stats.totalUsers} />
                    <StatCard title={t('active_devices') || "Active Devices"} value={stats.totalDevices} />
                    <StatCard title={t('active_alerts') || "Active Alerts"} value={stats.activeAlerts} isAlert={stats.activeAlerts > 0} />
                    <StatCard title={t('avg_system_temp') || "Avg System Temp"} value={`${stats.averageTemperature}°C`} />
                </div>
            )}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Download className="text-secondary" /> {t('backup_restore') || 'Backup/Restore'}</h2>
                <p className="text-slate-500 mb-6 text-sm">{t('export_import_desc') || 'Export/Import system JSON backups.'}</p>
                <div className="flex gap-4">
                    <button className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 text-sm"><Download size={18} /> {t('export_data') || 'Export Data'}</button>
                    <label className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl hover:bg-emerald-100 transition-all flex justify-center items-center gap-2 text-sm cursor-pointer"><Upload size={18} /> {t('import_data') || 'Import Data'}<input type="file" className="hidden" /></label>
                </div>
            </div>
        </div>
    );
};


const UsersTab = ({ users, locations, refresh, t }) => {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', role: 0, password: ''
    });

    const handleAddUser = async () => {
        if (form.firstName && form.lastName && form.email && form.password) {
            try {
                await api.post('/Users', form);
                setForm({ firstName: '', lastName: '', email: '', role: 0, password: '' });
                refresh();
            } catch (err) {
                alert(err.response?.data || "Error creating user");
            }
        } else {
            alert("Please fill in all required fields.");
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Delete user?')) { 
            await api.delete(`/Users/${id}`); 
            refresh(); 
        }
    };

    const handleRoleChange = async (user, newRole) => {
        try {
            await api.put(`/Users/${user.id}`, { ...user, role: parseInt(newRole) });
            refresh();
        } catch (err) {
            alert(err.response?.data || "Error updating role");
        }
    };

    const handleAssignLocation = async (userId, locationId) => {
        if (!locationId) return;
        try {
            await api.post(`/Users/${userId}/assign-location/${locationId}`);
            refresh();
        } catch (err) {
            alert(err.response?.data || "Error assigning location");
        }
    };

    const handleUnassignLocation = async (userId, locationId) => {
        if(window.confirm('Remove this location from the user?')) {
            try {
                await api.post(`/Users/${userId}/unassign-location/${locationId}`);
                refresh();
            } catch (err) {
                alert(err.response?.data || "Error unassigning location");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 p-4 bg-white border border-slate-200 rounded-xl items-center shadow-sm">
                <input placeholder={t('first_name') || "First Name"} className="border p-2 rounded flex-1 min-w-[120px]" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} />
                <input placeholder={t('last_name') || "Last Name"} className="border p-2 rounded flex-1 min-w-[120px]" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} />
                <input placeholder={t('email') || "Email"} type="email" className="border p-2 rounded flex-1 min-w-[150px]" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                <input placeholder={t('password') || "Password"} type="password" className="border p-2 rounded flex-1 min-w-[120px]" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
                
                <select className="border p-2 rounded flex-1 min-w-[120px]" value={form.role} onChange={e=>setForm({...form, role: parseInt(e.target.value)})}>
                    <option value={0}>{t('role_employee') || "Employee"}</option>
                    <option value={1}>{t('role_manager') || "Manager"}</option>
                    <option value={2}>{t('role_admin') || "Admin"}</option>
                </select>
                
                <button onClick={handleAddUser} className="bg-primary text-white px-6 py-2 rounded hover:bg-slate-800 whitespace-nowrap transition-colors font-medium">
                    {t('add_new') || "Add User"}
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm min-w-max">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4">{t('name') || "Name"}</th>
                                <th className="p-4">{t('email') || "Email"}</th>
                                <th className="p-4">{t('role') || "Role"}</th>
                                <th className="p-4">{t('assigned_locations') || "Assigned Locations"}</th>
                                <th className="p-4">{t('actions') || "Actions"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                                    <td className="p-4 text-slate-500">{u.email}</td>
                                    <td className="p-4">
                                        <select 
                                            value={u.role} 
                                            onChange={(e) => handleRoleChange(u, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border-none cursor-pointer outline-none transition-colors appearance-none text-center
                                            ${u.role === 2 ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 
                                              u.role === 1 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 
                                              'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                        >
                                            <option value={0} className="bg-white text-slate-800">{t('role_employee') || 'Employee'}</option>
                                            <option value={1} className="bg-white text-slate-800">{t('role_manager') || 'Manager'}</option>
                                            <option value={2} className="bg-white text-slate-800">{t('role_admin') || 'Admin'}</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            {u.locations && u.locations.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-1">
                                                    {u.locations.map(loc => (
                                                        <span key={loc.id} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs text-slate-700">
                                                            {loc.name}
                                                            <button 
                                                                onClick={() => handleUnassignLocation(u.id, loc.id)} 
                                                                className="text-red-400 hover:text-red-700 font-bold ml-1 transition-colors"
                                                                title="Unassign"
                                                            >×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <select 
                                                className="border rounded p-1 text-xs w-full max-w-[180px] bg-white cursor-pointer text-slate-600 outline-none focus:border-secondary" 
                                                value="" 
                                                onChange={(e) => handleAssignLocation(u.id, e.target.value)}
                                            >
                                                <option value="" disabled>{t('assign_location') || "Assign to location..."}</option>
                                                {locations.map(loc => (
                                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={()=>handleDelete(u.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">
                                            {t('delete') || "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const LocationsTab = ({ locations, refresh, t }) => {
    const [form, setForm] = useState({ name: '', description: '' });
    
    const handleAdd = async () => {
        if(form.name) { 
            await api.post('/Locations', form); 
            setForm({name:'', description:''}); 
            refresh(); 
        }
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Delete location?')) { 
            await api.delete(`/Locations/${id}`); 
            refresh(); 
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <input placeholder={t('name') || "Name"} className="border p-2 rounded w-1/3" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                <input placeholder={t('description') || "Description"} className="border p-2 rounded w-1/3" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
                <button onClick={handleAdd} className="bg-primary text-white px-6 rounded hover:bg-slate-800 font-medium">{t('add_new') || "Add New"}</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr><th className="p-4">ID</th><th className="p-4">{t('name') || "Name"}</th><th className="p-4">{t('description') || "Description"}</th><th className="p-4">{t('actions') || "Actions"}</th></tr>
                    </thead>
                    <tbody>
                        {locations.map(l => (
                            <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="p-4 text-slate-500">{l.id}</td>
                                <td className="p-4 font-medium">{l.name}</td>
                                <td className="p-4 text-slate-500">{l.description}</td>
                                <td className="p-4"><button onClick={()=>handleDelete(l.id)} className="text-red-500 hover:text-red-700 font-medium">{t('delete') || "Delete"}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const DevicesTab = ({ devices, locations, refresh, t }) => {
    const [form, setForm] = useState({ name: '', macAddress: '' });
    
    const handleAdd = async () => {
        if(form.name && form.macAddress) { 
            await api.post('/Devices', form); 
            setForm({name:'', macAddress:''}); 
            refresh(); 
        }
    };
    
    const handleAssign = async (deviceId, locationId) => {
        if(locationId === "") await api.post(`/Devices/${deviceId}/unassign-location`);
        else await api.post(`/Devices/${deviceId}/assign-location/${locationId}`);
        refresh();
    };
    
    const handleDelete = async (id) => {
        if(window.confirm('Delete device?')) { 
            await api.delete(`/Devices/${id}`); 
            refresh(); 
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <input placeholder={t('name') || "Name"} className="border p-2 rounded w-1/3" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                <input placeholder={t('mac_address') || "MAC Address"} className="border p-2 rounded w-1/3" value={form.macAddress} onChange={e=>setForm({...form, macAddress:e.target.value})} />
                <button onClick={handleAdd} className="bg-primary text-white px-6 rounded hover:bg-slate-800 font-medium">{t('add_new') || "Add New"}</button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr><th className="p-4">{t('name') || "Name"}</th><th className="p-4">{t('mac_address') || "MAC Address"}</th><th className="p-4">{t('assigned_location') || "Assigned Location"}</th><th className="p-4">{t('actions') || "Actions"}</th></tr>
                    </thead>
                    <tbody>
                        {devices.map(d => (
                            <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="p-4 font-medium">{d.name}</td>
                                <td className="p-4 text-slate-500 font-mono">{d.macAddress}</td>
                                <td className="p-4">
                                    <select className="border rounded p-1" value={d.locationId || ""} onChange={(e) => handleAssign(d.id, e.target.value)}>
                                        <option value="">{t('unassigned') || "Unassigned"}</option>
                                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </td>
                                <td className="p-4"><button onClick={()=>handleDelete(d.id)} className="text-red-500 hover:text-red-700 font-medium">{t('delete') || "Delete"}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AlertsTab = ({ alerts, refresh, t }) => {
    const handleResolve = async (id) => { await api.post(`/Admin/alerts/${id}/resolve`); refresh(); };
    const handleResolveAll = async () => { await api.post(`/Admin/alerts/resolve-all`); refresh(); };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={handleResolveAll} className="bg-secondary text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition font-medium">
                    {t('resolve_all') || "Resolve All"}
                </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr><th className="p-4">{t('message') || "Message"}</th><th className="p-4">{t('created_at') || "Created At"}</th><th className="p-4">{t('status') || "Status"}</th><th className="p-4">{t('actions') || "Actions"}</th></tr>
                    </thead>
                    <tbody>
                        {alerts.map(a => (
                            <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="p-4 font-medium">{a.message}</td>
                                <td className="p-4 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {a.isResolved ? (t('resolved') || 'Resolved') : (t('active') || 'Active')}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {!a.isResolved && <button onClick={()=>handleResolve(a.id)} className="text-secondary font-bold hover:underline">{t('resolve') || "Resolve"}</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const StatCard = ({ title, value, isAlert }) => (
    <div className={`p-6 rounded-2xl shadow-sm border ${isAlert ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${isAlert ? 'text-red-600' : 'text-primary'}`}>{value}</p>
    </div>
);

export default AdminDashboard;