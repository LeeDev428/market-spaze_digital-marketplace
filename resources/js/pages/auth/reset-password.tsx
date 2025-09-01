import { Head, useForm, Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    email: string;
    code_verified: boolean;
}

type ResetPasswordForm = {
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ email, code_verified }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.reset.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Redirect if code not verified
    if (!code_verified) {
        window.location.href = route('password.request');
        return null;
    }

    return (
        <>
            <Head title="Reset password" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">MarketSpaze</h1>
                </div>

                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset password</h2>
                        <p className="text-sm text-gray-600 mb-4">Please enter your new password below</p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={data.email}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500"
                                readOnly
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <div className="mt-2 text-sm text-red-600">{errors.email}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                value={data.password}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Password"
                                required
                            />
                            {errors.password && (
                                <div className="mt-2 text-sm text-red-600">{errors.password}</div>
                            )}
                        </div>

                        <div className="mb-6">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Confirm password"
                                required
                            />
                            {errors.password_confirmation && (
                                <div className="mt-2 text-sm text-red-600">{errors.password_confirmation}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin inline mr-2" />}
                                Reset password
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
