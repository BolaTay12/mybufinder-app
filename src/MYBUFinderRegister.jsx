import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import stuffImage from './assets/stuff.png';
import LoadingSpinner from './components/LoadingSpinner';
import { useUI } from './context/UIContext';

const MYBUFinderRegister = () => {
    const navigate = useNavigate();
    const { showToast } = useUI();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [registerError, setRegisterError] = useState(null);
    const [registerSuccess, setRegisterSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleInputFocus = () => {
        if (registerError) setRegisterError(null);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setRegisterError(null);

        try {
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
            const response = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: data.name.trim(),
                    email: data.email.trim().toLowerCase(),
                    universityId: data.matricNumber.trim(),
                    password: data.password
                }),
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                if (text.includes('Proxy error') || text.includes('<!DOCTYPE html>')) {
                    throw new Error('Our servers are waking up from inactivity! This usually takes about 30-40 seconds. Please wait a moment and try registering again.');
                }
                throw new Error('Server returned an invalid response. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(result?.message || 'Registration failed');
            }

            setRegisterSuccess(true);
            showToast('Account created successfully!', 'success');
            // Optional: Auto login or redirect to login after a delay
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setRegisterError(err.message);
            showToast(err.message || 'Registration failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div style={{ backgroundImage: `linear-gradient(rgba(246, 247, 248, 0.95), rgba(246, 247, 248, 0.95)), url(${stuffImage})` }} className="text-[#0d131b] dark:text-white min-h-screen flex flex-col font-display antialiased bg-cover bg-center dark:bg-slate-950 transition-colors duration-300">
            <header className="w-full border-b border-[#e7ecf3] dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="text-[#136dec] size-8">
                                <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="48" height="48" rx="12" fill="#E8F0FE" />
                                    <path d="M24 14L12 20.5L24 27L36 20.5L24 14Z" fill="#136DEC" />
                                    <path d="M15 23.5V31.5C15 31.5 19 36 24 36C29 36 33 31.5 33 31.5V23.5L24 28.5L15 23.5Z" fill="#136DEC" />
                                    <path d="M35 21V29C35 29 35 30.5 36.5 30.5C38 30.5 38 29 38 29V19.5L35 21Z" fill="#136DEC" />
                                </svg>
                            </div>
                            <h2 className="text-[#0d131b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">MYBUFinder</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <a className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white text-sm font-medium leading-normal flex items-center gap-2 transition-colors" href="#">
                                <span className="material-symbols-outlined text-lg">help</span>
                                <span>Help / Support</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border-t-4 border-[#136dec] animate-fade-in-up transition-colors duration-300">
                    <div className="pt-8 pb-4 px-8 text-center">
                        <h1 className="text-[#0d131b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal mt-2">Join MYBUFinder today</p>
                    </div>

                    <form className="px-8 pb-8 pt-2 space-y-5" onSubmit={handleSubmit(onSubmit)}>

                        {/* Error Alert */}
                        {registerError && (
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {registerError}
                            </div>
                        )}

                        {/* Success Alert */}
                        {registerSuccess && (
                            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Registration successful! Redirecting...
                            </div>
                        )}

                        <div className="animate-fade-in delay-75">
                            <label className="block text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal mb-2" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-[#d1d5db] dark:border-slate-700 focus:border-[#136dec]'} bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[#136dec] h-12 placeholder:text-[#9ca3af] px-4 text-base transition-shadow`}
                                id="name"
                                placeholder="e.g. John Doe"
                                type="text"
                                {...register("name", {
                                    required: "Full Name is required",
                                    minLength: { value: 3, message: "Name must be at least 3 characters" },
                                    onBlur: handleInputFocus
                                })}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="animate-fade-in delay-100">
                            <label className="block text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal mb-2" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white border ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-[#d1d5db] dark:border-slate-700 focus:border-[#136dec]'} bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[#136dec] h-12 placeholder:text-[#9ca3af] px-4 text-base transition-shadow`}
                                id="email"
                                placeholder="john.doe@babcock.edu.ng"
                                type="email"
                                {...register("email", {
                                    required: "Email Address is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    },
                                    onBlur: handleInputFocus
                                })}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="animate-fade-in delay-150">
                            <label className="block text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal mb-2" htmlFor="matric">
                                Matric Number / Staff ID
                            </label>
                            <input
                                className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d131b] dark:text-white border ${errors.matricNumber ? 'border-red-500 focus:border-red-500' : 'border-[#d1d5db] dark:border-slate-700 focus:border-[#136dec]'} bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[#136dec] h-12 placeholder:text-[#9ca3af] px-4 text-base transition-shadow`}
                                id="matric"
                                placeholder="e.g. 19/1234 or Staff ID"
                                type="text"
                                {...register("matricNumber", {
                                    required: "Matric Number/ID is required",
                                    minLength: { value: 3, message: "ID must be at least 3 characters" },
                                    onBlur: handleInputFocus
                                })}
                            />
                            {errors.matricNumber && (
                                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.matricNumber.message}</p>
                            )}
                        </div>

                        <div className="animate-fade-in delay-200">
                            <label className="text-[#0d131b] dark:text-slate-200 text-sm font-medium leading-normal mb-2 block" htmlFor="password">
                                Password
                            </label>
                            <div className="relative flex w-full items-stretch">
                                <input
                                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#0d131b] dark:text-white border ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-[#d1d5db] dark:border-slate-700 focus:border-[#136dec]'} bg-white dark:bg-slate-800 focus:ring-1 focus:ring-[#136dec] h-12 placeholder:text-[#9ca3af] px-4 border-r-0 text-base transition-shadow`}
                                    id="password"
                                    placeholder="Create a password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                                        onBlur: handleInputFocus
                                    })}
                                />
                                <button
                                    className="flex items-center justify-center px-4 rounded-r-lg border border-l-0 border-[#d1d5db] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#136dec] dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            className="w-full flex items-center justify-center rounded-lg h-12 px-4 bg-[#136dec] hover:bg-[#0f5bbd] text-white text-base font-bold leading-normal tracking-wide shadow-sm hover:shadow-md transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed animate-fade-in delay-300"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <LoadingSpinner size="sm" color="white" /> : 'Register'}
                        </button>

                        <div className="relative mt-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">Already have an account?</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <Link to="/" className="inline-flex items-center gap-1 text-[#136dec] dark:text-blue-400 hover:text-[#0f5bbd] dark:hover:text-blue-300 font-semibold text-sm transition-colors">
                                Sign In
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                            </Link>
                        </div>
                    </form>

                    <div className="bg-[#f9fafb] dark:bg-slate-800/50 py-3 text-center border-t border-[#e5e7eb] dark:border-slate-800">
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>lock</span>
                            Secure Registration
                        </p>
                    </div>
                </div>
            </main >

            <footer className="w-full py-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    © 2026 Babcock University. All rights reserved.
                </p>
                <div className="flex justify-center gap-4 mt-2">
                    <a className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors" href="#">Privacy Policy</a>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <a className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors" href="#">Terms of Service</a>
                </div>
            </footer>
        </div >
    );
};

export default MYBUFinderRegister;
