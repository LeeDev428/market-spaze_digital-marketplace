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
    resend_verification?: boolean;
}

export default function Login({ status, canResetPassword, resend_verification }: LoginProps) {
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
            
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full min-h-[650px]">
                    {/* Left Side - Login Form */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                <img src="/img/marketspazemainlogo.png" alt="MarketSpaze" className="h-8 w-auto" />
                                <span className="ml-2 text-xl font-bold text-gray-800">MarketSpaze</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                            <p className="text-gray-500">Don't have an account? 
                                <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold ml-1">Create now</Link>
                            </p>
                        </div>

                        {/* Social Login */}
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
                                Continue with Google
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

                        {/* Status message */}
                        {status && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm text-center">
                                {status}
                            </div>
                        )}

                        {/* Email verification error */}
                        {errors.email && errors.email.includes('verify') && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm text-center">
                                <p className="mb-2">{errors.email}</p>
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                                >
                                    Resend Verification Email
                                </Link>
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden">
                            <form onSubmit={submit} className="space-y-3 h-full overflow-y-auto pr-2">
                                {/* User type selection */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Login as</label>
                                    <select
                                        value={data.user_type}
                                        onChange={(e) => setData('user_type', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="rider">Rider</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <InputError message={errors.user_type} className="text-red-600 text-xs mt-1" />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                    />
                                    <InputError message={errors.email} className="text-red-600 text-xs mt-1" />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="text-red-600 text-xs mt-1" />
                                </div>

                                {/* Remember me & Forgot password */}
                                <div className="flex items-center justify-between text-xs">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="mr-2 rounded border-gray-300"
                                        />
                                        <span className="text-gray-600">Remember me</span>
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-orange-600 hover:text-orange-800"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <div className="text-center text-xs text-gray-600 pt-2">
                                    Don't have an account?{' '}
                                    <Link
                                        href="/register"
                                        className="text-orange-600 hover:text-orange-800 font-medium"
                                    >
                                        Sign up
                                    </Link>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-3"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <LoaderCircle className="h-3 w-3 animate-spin" />
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        'Log in'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Side - Welcome Panel */}
                    <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-400 to-blue-500 text-white flex-col justify-center items-center p-10">
                        <div className="text-center">
                            <div className="mb-6">
                                <img
                                    src="/img/marketspazemainlogo.png"
                                    alt="MarketSpaze"
                                    className="h-12 w-12 mx-auto mb-4 rounded-lg"
                                />
                                <h1 className="text-3xl font-bold mb-2">New Here?</h1>
                            </div>
                            <p className="text-lg mb-6 opacity-90">
                                Sign up and discover a great amount of new opportunities!
                            </p>
                            <Link
                                href="/register"
                                className="inline-block bg-white text-teal-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}