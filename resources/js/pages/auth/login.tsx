import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
    user_type: string;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
        user_type: 'customer',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Sign in to MarketSpaze" />
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
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Main content */}
                <main className="relative flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Login card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Welcome back
                                </h1>
                                <p className="text-slate-300">
                                    Sign in to your MarketSpaze account
                                </p>
                            </div>

                            {/* Status message */}
                            {status && (
                                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm text-center">
                                    {status}
                                </div>
                            )}

                            {/* Login form */}
                            <form onSubmit={submit} className="space-y-6">
                                {/* User type selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="user_type" className="text-white font-medium">
                                        Login as
                                    </Label>
                                    <select
                                        id="user_type"
                                        value={data.user_type}
                                        onChange={(e) => setData('user_type', e.target.value)}
                                        className="w-full bg-white/10 border-white/20 text-white rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                    >
                                        <option value="customer" className="bg-slate-800">Customer</option>
                                        <option value="vendor" className="bg-slate-800">Vendor</option>
                                        <option value="rider" className="bg-slate-800">Rider</option>
                                        <option value="admin" className="bg-slate-800">Admin</option>
                                    </select>
                                    <InputError message={errors.user_type} className="text-red-400 text-sm" />
                                </div>
                                
                                {/* Email field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white font-medium">
                                        Email address
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full bg-white/10 border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:border-orange-500/50 focus:ring-orange-500/25"
                                        />
                                    </div>
                                    <InputError message={errors.email} className="text-red-400 text-sm" />
                                </div>

                                {/* Password field */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-white font-medium">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter your password"
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
                                    <InputError message={errors.password} className="text-red-400 text-sm" />
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                        className="border-white/30 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                    />
                                    <Label htmlFor="remember" className="text-slate-300 text-sm">
                                        Remember me for 30 days
                                    </Label>
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
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </form>

                            {/* Alternative sign in methods */}
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

                        {/* Sign up link */}
                        <div className="text-center mt-8">
                            <p className="text-slate-400">
                                New to MarketSpaze?{' '}
                                <Link
                                    href="/register"
                                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                                >
                                    Create an account
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