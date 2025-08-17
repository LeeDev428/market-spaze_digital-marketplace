import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff, Check } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        { label: 'At least 8 characters', valid: data.password.length >= 8 },
        { label: 'Contains uppercase letter', valid: /[A-Z]/.test(data.password) },
        { label: 'Contains lowercase letter', valid: /[a-z]/.test(data.password) },
        { label: 'Contains number', valid: /\d/.test(data.password) },
    ];

    return (
        <>
            <Head title="Join MarketSpaze" />
            <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                {/* Navigation */}
                <nav className="relative z-50 px-6 lg:px-8 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3">
                            <img
                                src="/img/marketspazemainlogo.png"
                                alt="MarketSpaze"
                                className="h-10 w-10 rounded-lg"
                            />
                            <span className="text-xl font-bold text-white">MarketSpaze</span>
                        </Link>
                        <div className="text-sm text-slate-300">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Main content */}
                <main className="relative flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Register card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Create account
                                </h1>
                                <p className="text-slate-300">
                                    Join the MarketSpaze community today
                                </p>
                            </div>

                            {/* Register form */}
                            <form onSubmit={submit} className="space-y-6">
                                {/* User Type Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="user_type" className="text-white font-medium">
                                        I want to register as
                                    </Label>
                                    <select
                                        id="user_type"
                                        value={data.user_type}
                                        onChange={(e) => setData('user_type', e.target.value as 'customer' | 'vendor' | 'rider')}
                                        className="w-full bg-white/10 border-white/20 text-white rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                    >
                                        <option value="customer" className="bg-slate-800">Customer</option>
                                        <option value="vendor" className="bg-slate-800">Vendor/Service Provider</option>
                                        <option value="rider" className="bg-slate-800">Rider/Delivery Partner</option>
                                    </select>
                                    <InputError message={errors.user_type} className="text-red-400 text-sm" />
                                </div>

                                {/* Name field */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-white font-medium">
                                        Full name
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                    />
                                    <InputError message={errors.name} className="text-red-400 text-sm" />
                                </div>

                                {/* Email field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white font-medium">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                    />
                                    <InputError message={errors.email} className="text-red-400 text-sm" />
                                </div>

                                {/* Password field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Create a strong password"
                                            className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 pr-12 focus:border-orange-500/50 focus:ring-orange-500/25"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    
                                    {/* Password strength indicator */}
                                    {data.password && (
                                        <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="text-xs text-slate-300 mb-2">Password strength:</div>
                                            <div className="space-y-1">
                                                {passwordChecks.map((check, index) => (
                                                    <div key={index} className="flex items-center space-x-2 text-xs">
                                                        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                                            check.valid ? 'bg-green-500' : 'bg-slate-600'
                                                        }`}>
                                                            {check.valid && <Check size={8} className="text-white" />}
                                                        </div>
                                                        <span className={check.valid ? 'text-green-400' : 'text-slate-400'}>
                                                            {check.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <InputError message={errors.password} className="text-red-400 text-sm" />
                                </div>

                                {/* Confirm Password field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-white font-medium">
                                        Confirm password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Confirm your password"
                                            className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 pr-12 focus:border-orange-500/50 focus:ring-orange-500/25"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="text-red-400 text-sm" />
                                </div>

                                {/* Rider-specific fields */}
                                {data.user_type === 'rider' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-white font-medium">
                                                Phone Number *
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                required
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Enter your phone number"
                                                className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                            />
                                            <InputError message={errors.phone} className="text-red-400 text-sm" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="vehicle_type" className="text-white font-medium">
                                                Vehicle Type *
                                            </Label>
                                            <select
                                                id="vehicle_type"
                                                required
                                                value={data.vehicle_type}
                                                onChange={(e) => setData('vehicle_type', e.target.value)}
                                                className="w-full bg-white/10 border-white/20 text-white rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                            >
                                                <option value="motorcycle" className="bg-slate-800">Motorcycle</option>
                                                <option value="bicycle" className="bg-slate-800">Bicycle</option>
                                                <option value="car" className="bg-slate-800">Car</option>
                                                <option value="truck" className="bg-slate-800">Truck</option>
                                                <option value="van" className="bg-slate-800">Van</option>
                                            </select>
                                            <InputError message={errors.vehicle_type} className="text-red-400 text-sm" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="license_number" className="text-white font-medium">
                                                Driver's License Number *
                                            </Label>
                                            <Input
                                                id="license_number"
                                                type="text"
                                                required
                                                value={data.license_number}
                                                onChange={(e) => setData('license_number', e.target.value)}
                                                placeholder="Enter your license number"
                                                className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                            />
                                            <InputError message={errors.license_number} className="text-red-400 text-sm" />
                                        </div>
                                    </>
                                )}

                                {/* Terms and Privacy */}
                                <div className="text-xs text-slate-400 leading-relaxed">
                                    By creating an account, you agree to our{' '}
                                    <a href="#" className="text-orange-400 hover:text-orange-300">Terms of Service</a> and{' '}
                                    <a href="#" className="text-orange-400 hover:text-orange-300">Privacy Policy</a>
                                </div>

                                {/* Submit button */}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        'Create account'
                                    )}
                                </Button>
                            </form>

                            {/* Alternative sign up methods */}
                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                      
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                   
                                </div>
                            </div>
                        </div>

                        {/* Sign in link */}
                        <div className="text-center mt-8">
                            <p className="text-slate-400">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                                >
                                    Sign in instead
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative text-center py-6 px-6">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} MarketSpaze. All rights reserved.
                    </p>
                </footer>
            </div>
        </>
    );
}