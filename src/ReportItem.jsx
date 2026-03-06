import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import { useUI } from './context/UIContext';

const ReportItem = () => {
    const navigate = useNavigate();
    const { showToast } = useUI();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [itemType, setItemType] = useState('LOST'); // Default to LOST

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

    // Watch for file input changes if we use register, but custom handler is often better for preview
    // const watchedImage = watch("image"); 

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast("File size exceeds 5MB", "error");
                return;
            }
            setSelectedFile(file);
            setValue("image", file); // Register with hook form

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            const formattedDate = new Date(data.dateLost).toLocaleDateString();
            const datePrefix = itemType === 'LOST' ? 'Date Lost:' : 'Date Found:';
            const fullDescription = `${datePrefix} ${formattedDate}\n\n${data.description}`;

            formData.append('title', data.title);
            formData.append('description', fullDescription);
            formData.append('category', data.category);
            formData.append('location', data.location);
            formData.append('type', itemType);

            // dateLost property is rejected by the backend strict schema, so we included it in the description above.

            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const token = localStorage.getItem('token');
            const baseUrl = process.env.NODE_ENV === 'development' ? '' : (process.env.REACT_APP_BASE_URL || 'https://bufinderbackend-production.up.railway.app');

            const response = await fetch(`${baseUrl}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type: multipart/form-data is set automatically with boundary
                },
                body: formData
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();
                    throw new Error(result.message || 'Failed to submit report');
                } else {
                    const text = await response.text();
                    if (text.includes("Proxy error")) {
                        throw new Error("Backend server is waking up (Railway free tier). Please wait 10 seconds and try again!");
                    }
                    throw new Error(`Server returned ${response.status}`);
                }
            }

            const result = await response.json();

            console.log('Report submitted:', result);
            localStorage.removeItem('userLostCount'); // Clear cached count to force refresh
            localStorage.removeItem('userFoundCount');
            showToast('Report submitted successfully!', 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Submission error:", error);
            showToast(error.message || "Failed to submit report", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#f8f9fc] dark:bg-slate-950 overflow-hidden font-['Lexend'] transition-colors duration-300">
            <Header />

            <main className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-4xl mx-auto">
                    {/* Page Title */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Report an Item</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Fill in the details below to help us locate your belongings.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Item Details</span>
                            <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase">Form</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-[#136dec] dark:bg-blue-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-10 transition-colors duration-300">
                        <form onSubmit={handleSubmit(onSubmit)}>

                            {/* Type Selection */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide block mb-3">Report Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setItemType('LOST')}
                                        className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${itemType === 'LOST'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-red-200 text-slate-500 dark:text-slate-400'
                                            }`}
                                    >
                                        <div className={`size-8 rounded-full flex items-center justify-center ${itemType === 'LOST' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-[18px]">search</span>
                                        </div>
                                        <span className="font-bold">I Lost Something</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setItemType('FOUND')}
                                        className={`flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${itemType === 'FOUND'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-green-200 text-slate-500 dark:text-slate-400'
                                            }`}
                                    >
                                        <div className={`size-8 rounded-full flex items-center justify-center ${itemType === 'FOUND' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                            <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
                                        </div>
                                        <span className="font-bold">I Found Something</span>
                                    </button>
                                </div>
                            </div>

                            {/* Basic Information Section */}
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="size-6 rounded-full bg-[#136dec] dark:bg-blue-600 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-[16px]">info</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">Item Category</label>
                                            <div className="relative">
                                                <select
                                                    className={`w-full h-12 pl-4 pr-10 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer`}
                                                    {...register("category", { required: "Please select a category" })}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled className="text-slate-400">Select a category</option>
                                                    <option value="electronics">Electronics</option>
                                                    <option value="documents">Documents & IDs</option>
                                                    <option value="clothing">Clothing & Accessories</option>
                                                    <option value="keys">Keys</option>
                                                    <option value="other">Other</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                                    <span className="material-symbols-outlined">expand_more</span>
                                                </div>
                                            </div>
                                            {errors.category && <p className="mt-1 text-xs text-red-500 font-medium">{errors.category.message}</p>}
                                        </div>

                                        {/* Date Lost/Found */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">Date {itemType === 'LOST' ? 'Lost' : 'Found'}</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className={`w-full h-12 pl-4 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.dateLost ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:[color-scheme:dark]`}
                                                    {...register("dateLost", { required: "Date is required" })}
                                                />
                                            </div>
                                            {errors.dateLost && <p className="mt-1 text-xs text-red-500 font-medium">{errors.dateLost.message}</p>}
                                        </div>
                                    </div>

                                    {/* Item Title */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">Item Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Blue Dell XPS 13 Laptop"
                                            className={`w-full h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-medium placeholder:text-slate-400/70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                                            {...register("title", { required: "Item title is required", minLength: { value: 3, message: "Title must be at least 3 characters" } })}
                                        />
                                        {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title.message}</p>}
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">{itemType === 'LOST' ? 'Last Seen Location' : 'Found Location'}</label>
                                        <div className="relative">
                                            <select
                                                className={`w-full h-12 pl-4 pr-10 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.location ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer`}
                                                {...register("location", { required: "Please select a location" })}
                                                defaultValue=""
                                            >
                                                <option value="" disabled className="text-slate-400">Select a campus landmark</option>
                                                <option value="admin_block_strategy">Admin Block & Strategy Blk</option>
                                                <option value="new_admin_block">New Admin Block</option>
                                                <option value="sc_tech_auditorium">Sc & Tech Auditorium & Bookshop</option>
                                                <option value="andrew_park">Andrew Park</option>
                                                <option value="eah">Joel Awoniyi Faculty of Education & Humanities (EAH)</option>
                                                <option value="bbs">BBS (Babcock Business School)</option>
                                                <option value="staff_quarters">Staff Quarters</option>
                                                <option value="babrite">Shopping Mall-Yetunde Makinde Super Store (BABRITE)</option>
                                                <option value="university_guest_house">University Guest House</option>
                                                <option value="sda_church">Seventh Day Adventist Church</option>
                                                <option value="bu_high_school_admin">BU High School Admin Blk.</option>
                                                <option value="bu_pry_school">Babcock University Pry School</option>
                                                <option value="buth_a_and_e">Accident & Emergency Ward (BUTH)</option>
                                                <option value="buth_ben_carson">Ben Carson college of medicine (BUTH 600 SEATER)</option>
                                                <option value="alumni_building">Alumni Building</option>
                                                <option value="welch_hall">Welch Hall</option>
                                                <option value="amphitheater">Amphitheater</option>
                                                <option value="heritage_building">Heritage Building</option>
                                                <option value="bursary_division">Bursary Division</option>
                                                <option value="new_horizons_1">New Horizons 1</option>
                                                <option value="new_horizons_2_new">New Horizons 2 (NEW)</option>
                                                <option value="procurement_centre_store">Procurement / Centre store</option>
                                                <option value="bucodel">BUCODeL</option>
                                                <option value="laz_otti_library">Laz Otti Library</option>
                                                <option value="adeleke_hall">Adeleke Hall</option>
                                                <option value="topaz_hall">Topaz Hall</option>
                                                <option value="emerald_hall">Emerald Hall</option>
                                                <option value="neal_wilson_hall">Neal Wilson Hall</option>
                                                <option value="winslow_hall">Winslow Hall</option>
                                                <option value="gideon_trooper_hall">Gideon Trooper Hall</option>
                                                <option value="bethel_splendor_hall">Bethel Splendor Hall</option>
                                                <option value="university_cafeteria">University Cafeteria</option>
                                                <option value="mandela_hall">Mandela Hall</option>
                                                <option value="akande_hall">Akande Hall</option>
                                                <option value="queen_esther_hall">Queen Esther Hall</option>
                                                <option value="felicia_adebisi_dada_hall">Felicia Adebisi Dada Hall</option>
                                                <option value="ameyo_adadevoh_hall">Ameyo Adadevoh Hall</option>
                                                <option value="havilah_gold_hall">Havilah Gold Hall</option>
                                                <option value="sports_complex">Stadium Babcock University</option>
                                                <option value="white_hall">White Hall</option>
                                                <option value="nyberg_hall">Nyberg Hall</option>
                                                <option value="crystal_hall">Crystal Hall</option>
                                                <option value="platinum_hall">Platinum Hall</option>
                                                <option value="diamond_hall">Diamond Hall</option>
                                                <option value="sapphire_hall">Sapphire Hall</option>
                                                <option value="water_works">Water Works</option>
                                                <option value="busa_secretariat">BUSA Secretariat</option>
                                                <option value="sat_building">Science and Technology Building (SAT)</option>
                                                <option value="other">Other</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                            </div>
                                        </div>
                                        {errors.location && <p className="mt-1 text-xs text-red-500 font-medium">{errors.location.message}</p>}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">Detailed Description</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Please describe any distinguishing features (scratches, stickers, serial numbers)..."
                                            className={`w-full p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border ${errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'} text-slate-900 dark:text-white font-medium placeholder:text-slate-400/70 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y`}
                                            {...register("description", {
                                                required: "Description is required",
                                                minLength: { value: 10, message: "Description must be at least 10 characters" }
                                            })}
                                        ></textarea>
                                        {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Upload Images Section */}
                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="size-6 rounded-full bg-[#136dec] dark:bg-blue-600 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Image (Optional)</h2>
                                </div>

                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer group relative overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />

                                    {imagePreview ? (
                                        <div className="relative w-full h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                                            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white font-bold">Click to change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                            <div className="size-12 rounded-full bg-white dark:bg-slate-700 text-[#136dec] dark:text-blue-400 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                            </div>
                                            <p className="text-slate-900 dark:text-white font-bold text-sm mb-1">Click to upload <span className="font-normal text-slate-500 dark:text-slate-400">or drag and drop</span></p>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wide">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#136dec] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoadingSpinner size="sm" color="white" />
                                            <span className="ml-2">Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            Submit Report
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                                                <circle cx="12" cy="12" r="10" fill="white" />
                                                <path d="M10 16.4L6 12.4L7.4 11L10 13.6L16.6 7L18 8.4L10 16.4Z" fill="#136dec" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center">
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">© 2023 Babcock University. All rights reserved.</p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ReportItem;
