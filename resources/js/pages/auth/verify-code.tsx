import { FormEventHandler, useState, useRef, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    email: string;
    type: 'email_verification' | 'password_reset';
}

export default function VerifyCode({ email, type }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        email: email,
    });

    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);
    const codeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (codeInputRef.current) {
            codeInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const routeName = type === 'email_verification' 
            ? 'verification.code.verify' 
            : 'password.code.verify';

        post(route(routeName));
    };

    const resendCode = () => {
        if (!canResend) return;
        
        post(route('verification.code.resend'), {
            preserveScroll: true,
            onSuccess: () => {
                setTimeLeft(300);
                setCanResend(false);
                reset('code');
            }
        });
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setData('code', value);
    };

    const isEmailVerification = type === 'email_verification';
    const title = isEmailVerification ? 'Verify Your Email' : 'Password Reset Verification';
    const description = isEmailVerification 
        ? 'We sent a 6-digit verification code to your email address. Please enter it below to verify your account.'
        : 'We sent a 6-digit code to your email address. Please enter it below to reset your password.';

    return (
        <>
            <Head title={title} />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">MarketSpaze</h1>
                </div>

                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
                        <p className="text-sm text-gray-600 mb-4">{description}</p>
                        <p className="text-sm text-gray-700">
                            Email: <span className="font-medium">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="mb-6">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <input
                                ref={codeInputRef}
                                id="code"
                                type="text"
                                name="code"
                                value={data.code}
                                className="mt-1 block w-full text-center text-2xl tracking-widest border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="000000"
                                maxLength={6}
                                onChange={handleCodeChange}
                                required
                            />
                            {errors.code && (
                                <div className="mt-2 text-sm text-red-600">{errors.code}</div>
                            )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={processing || data.code.length !== 6}
                            >
                                {processing ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </div>

                        <div className="text-center">
                            {!canResend ? (
                                <p className="text-sm text-gray-600">
                                    Resend code in {formatTime(timeLeft)}
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={resendCode}
                                    disabled={processing}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                    Resend verification code
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
