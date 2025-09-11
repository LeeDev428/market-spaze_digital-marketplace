import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Check } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    user_type: 'customer' | 'vendor' | 'rider';
    // Rider specific fields
    phone?: string;
    vehicle_type?: string;
    license_number?: string;
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_type: 'customer',
        phone: '',
        vehicle_type: 'motorcycle',
        license_number: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Use different routes based on user type
        const routeName = data.user_type === 'rider' ? 'rider.register' : 'register';
        
        post(route(routeName), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Password strength checker
    const passwordChecks = [
        { label: '8+ chars', valid: data.password.length >= 8 },
        { label: 'Upper', valid: /[A-Z]/.test(data.password) },
        { label: 'Lower', valid: /[a-z]/.test(data.password) },
        { label: 'Number', valid: /\d/.test(data.password) },
    ];

    return (
        <>
            <Head title="Join MarketSpaze" />
            
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full min-h-[650px]">
                    {/* Left Side - Info Panel */}
                    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-400 to-blue-500 text-white flex-col justify-center items-center p-10">
                        <div className="text-center">
                            <div className="mb-6">
                                <img
                                    src="/img/marketspazemainlogo.png"
                                    alt="MarketSpaze"
                                    className="h-12 w-12 mx-auto mb-4 rounded-lg"
                                />
                                <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                            </div>
                            <p className="text-lg mb-6 opacity-90">
                                To keep connected with us please login with your personal info
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-white text-teal-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>

                    {/* Right Side - Registration Form */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                <img src="/img/marketspazemainlogo.png" alt="MarketSpaze" className="h-8 w-auto" />
                                <span className="ml-2 text-xl font-bold text-gray-800">MarketSpaze</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                            <p className="text-gray-500">Use your email to register</p>
                        </div>

                        {/* Social Registration */}
                        <div className="mb-6">
                            <a
                                href={route('google.redirect')}
                                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#fbbc04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Sign up with Google
                            </a>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-3">
                            {/* User type selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Register as</label>
                                <select
                                    value={data.user_type}
                                    onChange={(e) => setData('user_type', e.target.value as 'customer' | 'vendor' | 'rider')}
                                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                >
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="rider">Rider</option>
                                </select>
                                <InputError message={errors.user_type} className="text-red-600 text-xs mt-1" />
                            </div>

                            {/* Name and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Full name"
                                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                    />
                                    <InputError message={errors.name} className="text-red-600 text-xs mt-1" />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Email address"
                                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                    />
                                    <InputError message={errors.email} className="text-red-600 text-xs mt-1" />
                                </div>
                            </div>

                            {/* Rider specific fields */}
                            {data.user_type === 'rider' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone || ''}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                        />
                                        <InputError message={errors.phone} className="text-red-600 text-xs mt-1" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Vehicle Type</label>
                                            <select
                                                value={data.vehicle_type || 'motorcycle'}
                                                onChange={(e) => setData('vehicle_type', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                            >
                                                <option value="motorcycle">Motorcycle</option>
                                                <option value="bicycle">Bicycle</option>
                                                <option value="car">Car</option>
                                                <option value="van">Van</option>
                                            </select>
                                            <InputError message={errors.vehicle_type} className="text-red-600 text-xs mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">License Number</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.license_number || ''}
                                                onChange={(e) => setData('license_number', e.target.value)}
                                                placeholder="License number"
                                                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                            />
                                            <InputError message={errors.license_number} className="text-red-600 text-xs mt-1" />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Password */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Password"
                                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 pr-10 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="text-red-600 text-xs mt-1" />
                                
                                {/* Password strength indicators */}
                                {data.password && (
                                    <div className="mt-2 flex space-x-2">
                                        {passwordChecks.map((check, index) => (
                                            <div
                                                key={index}
                                                className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                                                    check.valid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                <Check size={10} className={check.valid ? 'text-green-600' : 'text-gray-400'} />
                                                <span>{check.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        autoComplete="new-password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 pr-10 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="text-red-600 text-xs mt-1" />
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        <span>Creating account...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
