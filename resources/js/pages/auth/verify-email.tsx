import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verify Email" />
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
                        <Link
                            href="/login"
                            className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Login</span>
                        </Link>
                    </div>
                </nav>

                {/* Main content */}
                <main className="relative flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Verification card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl text-center">
                            {/* Icon */}
                            <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
                                <Mail className="w-8 h-8 text-orange-400" />
                            </div>

                            {/* Header */}
                            <h1 className="text-3xl font-bold text-white mb-4">
                                Check your email
                            </h1>
                            
                            <div className="space-y-4 text-slate-300">
                                <p>
                                    We've sent a verification link to your email address. 
                                    Please click the link to verify your account and complete your registration.
                                </p>
                                
                                <p className="text-sm">
                                    Didn't receive the email? Check your spam folder or click below to resend.
                                </p>
                            </div>

                            {/* Status message */}
                            {status === 'verification-link-sent' && (
                                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                                    <p className="text-green-400 text-sm">
                                        A new verification link has been sent to your email address.
                                    </p>
                                </div>
                            )}

                            {/* Resend form */}
                            <form onSubmit={submit} className="mt-8">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        'Resend verification email'
                                    )}
                                </Button>
                            </form>

                            {/* Alternative actions */}
                            <div className="mt-6 space-y-3">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-slate-900/50 px-3 text-slate-400">or</span>
                                    </div>
                                </div>

                                <Link
                                    href="/login"
                                    className="block w-full text-center py-3 px-6 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>

                        {/* Help text */}
                        <div className="text-center mt-8">
                            <p className="text-slate-400 text-sm">
                                Need help? Contact our{' '}
                                <a href="#" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
                                    support team
                                </a>
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
