import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useUI } from './context/UIContext';
import LoadingSpinner from './components/LoadingSpinner';

const Settings = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { showToast } = useUI();
    const [activeTab, setActiveTab] = useState('profile');

    // Local Storage Notification Settings
    const [matchAlerts, setMatchAlerts] = useState(() => localStorage.getItem('setting_matchAlerts') !== 'false');
    const [claimUpdates, setClaimUpdates] = useState(() => localStorage.getItem('setting_claimUpdates') !== 'false');
    const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('setting_emailAlerts') === 'true');

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Help & Support accordion state
    const [expandedHelp, setExpandedHelp] = useState(null);

    const toggleHelp = (id) => {
        setExpandedHelp(expandedHelp === id ? null : id);
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showToast('Please fill in all password fields.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }

        setIsUpdatingPassword(true);

        try {
            const rawBaseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production-04b6.up.railway.app');
            const baseUrl = rawBaseUrl && !rawBaseUrl.startsWith('http') && process.env.NODE_ENV !== 'development' ? 'https://' + rawBaseUrl : rawBaseUrl;

            const response = await fetch(`${baseUrl}/auth/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    currenPassword: currentPassword,
                    password: newPassword
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to update password');
            }

            showToast('Password updated successfully!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.error("Password update error:", error);
            showToast(error.message || 'Failed to update password. Please try again.', 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleToggleSetting = (settingName, currentValue, setterFunc) => {
        const newValue = !currentValue;
        setterFunc(newValue);
        localStorage.setItem(`setting_${settingName}`, newValue.toString());

        if (newValue) {
            showToast(`${settingName.replace(/([A-Z])/g, ' $1').trim()} enabled!`, 'success');
        } else {
            showToast(`${settingName.replace(/([A-Z])/g, ' $1').trim()} disabled.`, 'warning');
        }
    };

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-slate-950 transition-colors duration-300">
            {/* Top Navigation */}
            <Header />

            <div className="flex flex-1 overflow-hidden w-full">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#e8eaed] dark:bg-slate-950 p-6">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your profile, notifications, and security preferences.</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[600px]">
                            {/* Settings Sidebar */}
                            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4">
                                <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                        Profile
                                    </button>
                                    {/* <button
                                        onClick={() => setActiveTab('notifications')}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                                        Notifications
                                    </button>
                                */}
                                    <button
                                        onClick={() => setActiveTab('appearance')}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">palette</span>
                                        Appearance
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'security' ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">lock</span>
                                        Security
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('help')}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'help' ? 'bg-white dark:bg-slate-800 text-primary dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">help</span>
                                        Help & Support
                                    </button>
                                </nav>
                            </div>

                            {/* Settings Content */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                                {activeTab === 'profile' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Update your personal details here.</p>
                                        </div>

                                        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                            <div className="size-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">person</span>
                                            </div>
                                            <div>
                                                <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                                    Change Avatar
                                                </button>
                                                <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                                            </div>
                                        </div>

                                        <form className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={user?.name || ''}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Matric Number</label>
                                                    <input
                                                        type="text"
                                                        defaultValue={user?.matricNumber || ''}
                                                        readOnly
                                                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                                <input
                                                    type="email"
                                                    defaultValue={user?.email || ''}
                                                    readOnly
                                                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+234 800 000 0000"
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                                                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white">
                                                    <option>History and international studies</option>
                                                    <option>English Studies</option>
                                                    <option>French and Foreign Studies</option>
                                                    <option>Christian theology</option>
                                                    <option>Business Education</option>
                                                    <option>Economics Education</option>
                                                    <option>Educational Management</option>
                                                    <option>Guidance and Counselling</option>
                                                    <option>English Education</option>
                                                    <option>Music</option>
                                                    <option>Law</option>
                                                    <option>Accounting</option>
                                                    <option>Finance</option>
                                                    <option>Business Administration</option>
                                                    <option>Marketing</option>
                                                    <option>Information Resources Management</option>
                                                    <option>Economics</option>
                                                    <option>Mass Communication</option>
                                                    <option>Political Science</option>
                                                    <option>Peace Studies and Conflict Resolution</option>
                                                    <option>Public Administration</option>
                                                    <option>Social Work</option>
                                                    <option>Agriculture</option>
                                                    <option>Microbiology</option>
                                                    <option>Computer Science</option>
                                                    <option>Information Technology</option>
                                                    <option>Cyber Security</option>
                                                    <option>Software Engineering</option>
                                                    <option>Human Anatomy</option>
                                                    <option>Physiology</option>
                                                    <option>Biochemistry</option>
                                                    <option>Nutrition and Dietetics</option>
                                                    <option>Public Health</option>
                                                    <option>Medical Laboratory</option>
                                                    <option>Nursing Science</option>
                                                    <option>Computer Engineering</option>
                                                    <option>Civil Engineering</option>
                                                    <option>Mechanical Engineering</option>
                                                    <option>Electrical Engineering</option>
                                                    <option>Architecture</option>
                                                    <option>Estate Management</option>
                                                    <option>Medicine</option>
                                                </select>
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <button type="submit" className="px-6 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Choose how and when you want to be notified.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">New Match Alerts</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get notified when someone finds an item that matches your lost report.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={matchAlerts}
                                                        onChange={() => handleToggleSetting('matchAlerts', matchAlerts, setMatchAlerts)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Claim Updates</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive updates when someone claims an item you found.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={claimUpdates}
                                                        onChange={() => handleToggleSetting('claimUpdates', claimUpdates, setClaimUpdates)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>

                                            <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Email Notifications</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive a daily digest of lost items in your department.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={emailAlerts}
                                                        onChange={() => handleToggleSetting('emailAlerts', emailAlerts, setEmailAlerts)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'security' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your password and account security.</p>
                                        </div>

                                        <form className="space-y-4 max-w-md" onSubmit={handlePasswordUpdate}>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    disabled={isUpdatingPassword}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    disabled={isUpdatingPassword}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmNewPassword}
                                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                    disabled={isUpdatingPassword}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={isUpdatingPassword}
                                                    className="px-6 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isUpdatingPassword ? <LoadingSpinner size="sm" color="white" /> : 'Update Password'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'appearance' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Customize how the app looks and feels.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                <div>
                                                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Switch to a darker theme for better visibility at night.</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={theme === 'dark'}
                                                        onChange={toggleTheme}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'help' && (
                                    <div className="space-y-6 animate-fadeIn">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help & Support</h2>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Get help with using BU Finder.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${expandedHelp === 'report' ? 'border-primary/30 shadow-md shadow-primary/10 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800'}`}>
                                                <button onClick={() => toggleHelp('report')} className="w-full p-5 text-left flex justify-between items-center group">
                                                    <div>
                                                        <h3 className={`text-[15px] font-bold mb-1 transition-colors duration-300 ${expandedHelp === 'report' ? 'text-primary' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>How to report a lost item?</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Learn the improved process for reporting lost items on campus.</p>
                                                    </div>
                                                    <div className={`flex items-center justify-center size-8 rounded-full transition-all duration-300 transform ${expandedHelp === 'report' ? 'bg-primary/10 text-primary rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                                    </div>
                                                </button>
                                                <div className={`grid transition-all duration-300 ease-in-out ${expandedHelp === 'report' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300">
                                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                                <ol className="list-decimal pl-5 space-y-2.5">
                                                                    <li>Navigate to the <span className="font-semibold text-slate-900 dark:text-white">Report Item</span> page from the sidebar menu.</li>
                                                                    <li>Choose whether you are reporting a Lost or Found item.</li>
                                                                    <li>Fill in detailed information including category, date, and location.</li>
                                                                    <li>Upload clear photos to help track the item faster.</li>
                                                                    <li>Submit the report and you will be notified if a match is found.</li>
                                                                </ol>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${expandedHelp === 'safety' ? 'border-primary/30 shadow-md shadow-primary/10 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800'}`}>
                                                <button onClick={() => toggleHelp('safety')} className="w-full p-5 text-left flex justify-between items-center group">
                                                    <div>
                                                        <h3 className={`text-[15px] font-bold mb-1 transition-colors duration-300 ${expandedHelp === 'safety' ? 'text-primary' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>Safety Guidelines</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Important safety tips when meeting up to exchange found items.</p>
                                                    </div>
                                                    <div className={`flex items-center justify-center size-8 rounded-full transition-all duration-300 transform ${expandedHelp === 'safety' ? 'bg-primary/10 text-primary rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                                    </div>
                                                </button>
                                                <div className={`grid transition-all duration-300 ease-in-out ${expandedHelp === 'safety' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300">
                                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                                <ul className="list-disc pl-5 space-y-2.5">
                                                                    <li><span className="font-medium text-slate-900 dark:text-white">Meet in Public:</span> Always arrange meetups in busy, well-lit campus areas (e.g., library, cafeteria).</li>
                                                                    <li><span className="font-medium text-slate-900 dark:text-white">Daylight Hours:</span> Try to schedule exchanges during typical daytime hours.</li>
                                                                    <li><span className="font-medium text-slate-900 dark:text-white">Bring a Friend:</span> Ask a friend or colleague to accompany you to the exchange.</li>
                                                                    <li><span className="font-medium text-slate-900 dark:text-white">Verify Items:</span> Thoroughly verify the item matches before completing the handover.</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${expandedHelp === 'contact' ? 'border-primary/30 shadow-md shadow-primary/10 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800'}`}>
                                                <button onClick={() => toggleHelp('contact')} className="w-full p-5 text-left flex justify-between items-center group">
                                                    <div>
                                                        <h3 className={`text-[15px] font-bold mb-1 transition-colors duration-300 ${expandedHelp === 'contact' ? 'text-primary' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>Contact Support</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Need help? Reach out to the admin team.</p>
                                                    </div>
                                                    <div className={`flex items-center justify-center size-8 rounded-full transition-all duration-300 transform ${expandedHelp === 'contact' ? 'bg-primary/10 text-primary rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                                    </div>
                                                </button>
                                                <div className={`grid transition-all duration-300 ease-in-out ${expandedHelp === 'contact' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300">
                                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                                <div className="flex flex-col space-y-4">
                                                                    <p>If you have any issues or need further assistance, our admin team is here to help.</p>
                                                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5 transition-transform duration-300">
                                                                        <div className="flex items-center justify-center size-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary shrink-0">
                                                                            <span className="material-symbols-outlined text-sm">mail</span>
                                                                        </div>
                                                                        <a href="mailto:support@bufinder.edu" className="text-primary hover:underline font-medium">support@bufinder.edu</a>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5 transition-transform duration-300">
                                                                        <div className="flex items-center justify-center size-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 shrink-0">
                                                                            <span className="material-symbols-outlined text-sm">call</span>
                                                                        </div>
                                                                        <span>+234 800 BUFINDER</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:-translate-y-0.5 transition-transform duration-300">
                                                                        <div className="flex items-center justify-center size-8 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 shrink-0">
                                                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                                                        </div>
                                                                        <span className="flex-1">security on patrol (SOP) office @ amphitheater</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
