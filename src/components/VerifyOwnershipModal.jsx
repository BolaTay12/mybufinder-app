
import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyOwnershipModal = ({ isOpen, onClose, item, onSubmit }) => {
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const minLength = 20;
    const isValid = description.length >= minLength;

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (isValid) {
            setIsSubmitting(true);
            setErrorMessage('');

            try {
                const userString = localStorage.getItem('user');
                const user = userString ? JSON.parse(userString) : null;

                if (!user?.token) {
                    setErrorMessage('You must be logged in to claim an item.');
                    setIsSubmitting(false);
                    return;
                }

                const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');
                const response = await fetch(`${baseUrl}/claims`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        itemId: item.id,
                        description: description
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to submit claim.');
                }

                onSubmit(description);
                setDescription(''); // Reset form
            } catch (error) {
                console.error('Error submitting claim:', error);
                setErrorMessage(error.message || 'An error occurred while submitting your claim.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Verify Ownership</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-6">

                    <p className="text-sm text-slate-600 leading-relaxed">
                        To prevent theft and ensure this item is returned to its rightful owner, please
                        provide a unique description that clearly proves ownership.
                    </p>

                    {/* Item Summary */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="h-16 w-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                            <img
                                src={item.image || "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?w=800&fit=crop"}
                                alt={item.title}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">
                                Found Item #{item.id || 'N/A'}
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                <span className="line-clamp-1">{item.location || 'Unknown Location'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-900">
                            Describe a unique feature
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="E.g., There is a small 'NASA' sticker on the bottom left corner, a scratch near the charging port, and the login screen has a picture of a golden retriever..."
                            className="w-full h-32 p-3 text-sm text-slate-700 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
                        ></textarea>
                        <div className="flex justify-end">
                            <span className={`text-xs ${isValid ? 'text-green-600' : 'text-slate-400'}`}>
                                {isValid ? 'Looks good!' : `Minimum ${minLength} characters required`} ({description.length} chars)
                            </span>
                        </div>
                    </div>

                    {/* Warning Alert */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                        <span className="material-symbols-outlined text-red-500 shrink-0">gavel</span>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-red-900">Disciplinary Warning</h4>
                            <p className="text-xs text-red-700 leading-relaxed">
                                False claims are a violation of the Student Handbook and may lead to
                                strict disciplinary action by the Student Disciplinary Committee.
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            {errorMessage}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-5 bg-white border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all shadow-md
                            ${isValid && !isSubmitting
                                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-200 cursor-pointer'
                                : 'bg-slate-300 cursor-not-allowed shadow-none'
                            }
                        `}
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" color="white" />
                                <span className="ml-2">Submitting...</span>
                            </>
                        ) : (
                            <>
                                Submit Claim
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default VerifyOwnershipModal;
