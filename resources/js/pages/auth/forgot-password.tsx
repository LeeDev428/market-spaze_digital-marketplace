import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password" />

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="flex flex-col items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">MarketSpaze</h1>
                </div>

                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <div className="mb-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Forgot password</h2>
                        <p className="text-sm text-gray-600 mb-4">Enter your email to receive a 6-digit password reset code</p>
                    </div>

                    {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

                    <form onSubmit={submit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                value={data.email}
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="email@example.com"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.email && (
                                <div className="mt-2 text-sm text-red-600">{errors.email}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <button 
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin inline mr-2" />}
                                Send 6-digit reset code
                            </button>
                        </div>
                    </form>

                    <div className="text-center">
                        <span className="text-sm text-gray-600">Or, return to </span>
                        <TextLink href={route('login')}>log in</TextLink>
                    </div>
                </div>
            </div>
        </>
    );
}
