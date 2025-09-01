import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function Payments() {
    return (
        <AppLayout>
            <Head title="Payments" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-slate-900 dark:text-slate-100">
                            
                            {/* Header */}
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Payments & Billing</h1>
                                    <p className="text-slate-600 dark:text-slate-400">Manage your payments and billing</p>
                                </div>
                            </div>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 dark:text-slate-400">No payments yet</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">Your payment history will appear here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
