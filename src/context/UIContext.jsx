import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    // Toast State
    const [toasts, setToasts] = useState([]);

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState(null);

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Play a subtle notification sound based on the type
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            if (type === 'error' || type === 'danger') {
                // Harsh dual-tone error sound
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, context.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            } else if (type === 'warning') {
                // Short double beep
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
                gainNode.gain.setValueAtTime(0.1, context.currentTime);
                gainNode.gain.setValueAtTime(0.0, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, context.currentTime + 0.15);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            } else {
                // Pleasant success chime
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, context.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0, context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, context.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            }

            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + 0.4);
        } catch (e) {
            // Silently fail if Audio API is blocked by browser policies
            console.log("Audio notification failed or blocked", e);
        }

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showConfirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                title: options.title || 'Confirm Action',
                message: options.message || 'Are you sure you want to proceed?',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                type: options.type || 'warning', // 'warning', 'danger', 'info'
                onConfirm: () => {
                    setConfirmDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmDialog(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return (
        <UIContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none font-['Lexend']">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-black/5 transform transition-all duration-300 translate-x-0 opacity-100 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' :
                            toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-l-4 border-rose-500' :
                                toast.type === 'warning' ? 'bg-orange-50 text-orange-800 border-l-4 border-orange-500' :
                                    'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
                            }`}
                        style={{ minWidth: '300px' }}
                    >
                        <span className={`material-symbols-outlined shrink-0 ${toast.type === 'success' ? 'text-emerald-500' :
                            toast.type === 'error' ? 'text-rose-500' :
                                toast.type === 'warning' ? 'text-orange-500' :
                                    'text-blue-500'
                            }`}>
                            {toast.type === 'success' ? 'check_circle' :
                                toast.type === 'error' ? 'error' :
                                    toast.type === 'warning' ? 'warning' : 'info'}
                        </span>
                        <p className="text-sm font-semibold flex-1">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px] opacity-70">close</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirm Dialog Modal */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-['Lexend']">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={confirmDialog.onCancel}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className={`p-6 border-b ${confirmDialog.type === 'danger' ? 'border-rose-100 bg-rose-50/50' :
                            confirmDialog.type === 'warning' ? 'border-orange-100 bg-orange-50/50' :
                                'border-slate-100 bg-slate-50'
                            }`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`material-symbols-outlined text-3xl ${confirmDialog.type === 'danger' ? 'text-rose-500' :
                                    confirmDialog.type === 'warning' ? 'text-orange-500' :
                                        'text-blue-500'
                                    }`}>
                                    {confirmDialog.type === 'danger' ? 'warning' :
                                        confirmDialog.type === 'warning' ? 'help' : 'info'}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {confirmDialog.title}
                                </h3>
                            </div>
                            <p className="text-slate-600 text-sm">{confirmDialog.message}</p>
                        </div>

                        <div className="p-4 flex items-center justify-end gap-3 bg-slate-50">
                            <button
                                onClick={confirmDialog.onCancel}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200/50 transition-colors"
                            >
                                {confirmDialog.cancelText}
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition-colors ${confirmDialog.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' :
                                    confirmDialog.type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' :
                                        'bg-[#136dec] hover:bg-[#0f58c5] shadow-[#136dec]/20'
                                    }`}
                            >
                                {confirmDialog.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UIContext.Provider>
    );
};
