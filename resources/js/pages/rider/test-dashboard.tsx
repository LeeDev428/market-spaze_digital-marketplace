import { Head } from '@inertiajs/react';

export default function TestDashboard({ rider, stats, debug }: any) {
    console.log('TestDashboard rendered with props:', { rider, stats, debug });
    
    return (
        <div>
            <Head title="Test Rider Dashboard" />
            <div style={{ padding: '20px', background: 'white' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    MINIMAL TEST DASHBOARD
                </h1>
                
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontWeight: 'bold' }}>Simple Test:</h2>
                    <p>This page is working if you can see this text.</p>
                    <p>Current time: {new Date().toLocaleString()}</p>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontWeight: 'bold' }}>Rider Data:</h2>
                    <p>Rider exists: {rider ? 'YES' : 'NO'}</p>
                    {rider && <p>Rider Name: {rider.name}</p>}
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontWeight: 'bold' }}>Stats Data:</h2>
                    <p>Stats exists: {stats ? 'YES' : 'NO'}</p>
                    {stats && <p>Total Earnings: {stats.total_earnings}</p>}
                </div>
            </div>
        </div>
    );
}
