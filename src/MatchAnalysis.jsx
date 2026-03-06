import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';

const MatchAnalysis = () => {
    const navigate = useNavigate();
    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-slate-950 transition-colors duration-300">
            <Header />

            <main className="flex-1 w-full overflow-y-auto bg-[#f8f9fa] dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="hover:text-primary cursor-pointer">Lost Reports</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-semibold text-slate-900 dark:text-white">Match Analysis #L-4029</span>
                    </div>

                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Potential Match Found
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                                Our system found an item that strongly resembles your lost report. Please review the comparison below.
                            </p>
                        </div>

                        {/* AI Confidence Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 min-w-[300px]">
                            <div className="relative size-16">
                                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                    {/* Background Circle */}
                                    <path
                                        className="text-blue-100 dark:text-blue-900/30"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    />
                                    {/* Progress Circle */}
                                    <path
                                        className="text-blue-600 dark:text-blue-500"
                                        strokeDasharray="92, 100"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center pt-1">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">92%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">AI Confidence</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">High Match Probability</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Section */}
                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                        {/* Center Arrow (Absolute centered for desktop, hidden or adjusted for mobile if needed) */}
                        <div className="hidden md:flex absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 rounded-full p-2 shadow-md border border-slate-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">compare_arrows</span>
                        </div>

                        {/* Left Card: Your Report */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">inventory_2</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Your Report (#L-4029)</span>
                                </div>
                                <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">Lost Item</span>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                {/* Image */}
                                <div className="aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-slate-800">
                                    <img
                                        src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop"
                                        alt="My Lost Backpack"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Dark mode overlay for image brightness if needed, or leave as is */}
                                </div>

                                {/* Details List */}
                                <div className="space-y-0 text-sm">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-slate-500 dark:text-slate-400">Item Type</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">Backpack</span>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-slate-500 dark:text-slate-400">Brand</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">Nike</span>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-slate-500 dark:text-slate-400">Color</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">Navy Blue</span>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                                        <span className="text-slate-500 dark:text-slate-400">Location Lost</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">Main Cafeteria</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-slate-500 dark:text-slate-400">Date Lost</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">Oct 24, 2023</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Card: Potential Match */}
                        <div className="bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-500/20 dark:border-blue-500/30 shadow-sm overflow-hidden flex flex-col h-full ring-4 ring-blue-500/5 dark:ring-blue-500/10">
                            <div className="p-4 border-b border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">find_in_page</span>
                                    <span className="font-bold text-slate-900 dark:text-white">Potential Match (#F-9912)</span>
                                </div>
                                <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">Found Item</span>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                {/* Image */}
                                <div className="aspect-video w-full rounded-xl bg-white dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-slate-800">
                                    <img
                                        src="https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=400&fit=crop"
                                        alt="Found Backpack"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Details List */}
                                <div className="space-y-0 text-sm">
                                    <div className="flex items-center justify-between py-3 border-b border-blue-100/50 dark:border-blue-900/30">
                                        <span className="text-slate-500 dark:text-slate-400">Item Type</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">Backpack</span>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-blue-100/50 dark:border-blue-900/30">
                                        <span className="text-slate-500 dark:text-slate-400">Brand</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">Nike</span>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-blue-100/50 dark:border-blue-900/30">
                                        <span className="text-slate-500 dark:text-slate-400">Color</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-900 dark:text-white">Navy Blue</span>
                                            <span className="material-symbols-outlined text-blue-500 text-[18px]">check_circle</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-blue-100/50 dark:border-blue-900/30 bg-orange-50 dark:bg-orange-900/20 -mx-6 px-6 relative">
                                        {/* Highlight for different but close location */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-300 dark:bg-orange-500"></div>
                                        <span className="text-slate-500 dark:text-slate-400">Location Found</span>
                                        <div className="text-right">
                                            <div className="font-semibold text-slate-900 dark:text-white">Cafeteria Entrance</div>
                                            <div className="text-[10px] text-orange-500 dark:text-orange-400 font-bold uppercase">Close Proximity</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-slate-500 dark:text-slate-400">Date Found</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">Oct 25, 2023</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Action Footer */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm border border-slate-100 dark:border-slate-700 md:mb-12">
                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Does this item belong to you?</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                                Confirming ownership will notify the finder and allow you to arrange a pickup.
                                If this isn't yours, reject it to help our algorithm learn.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <button
                                className="h-11 px-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                onClick={() => console.log('Not my item')}
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                                Not My Item
                            </button>
                            <button
                                className="h-11 px-6 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200 dark:shadow-blue-900/20"
                                onClick={() => console.log('Confirm match')}
                            >
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                Confirm This is Mine
                            </button>
                        </div>

                        <div>
                            <button className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center justify-center gap-1.5 mx-auto">
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Message Finder for more details
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default MatchAnalysis;
