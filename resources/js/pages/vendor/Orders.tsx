import VendorLayout from '../../layouts/app/VendorLayout';

export default function Orders() {
    return (
        <VendorLayout>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#FF6F1A', marginBottom: '1rem' }}>
                Orders
            </h1>
            <div style={{
                background: '#fff',
                borderRadius: '1rem',
                boxShadow: '0 2px 8px rgba(255,136,0,0.08)',
                padding: '2rem',
            }}>
                <p>Here you can view and manage your orders.</p>
                {/* Example table placeholder */}
                <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#FFF8E1', color: '#FF6F1A' }}>
                            <th style={{ padding: '0.5rem', border: '1px solid #FFE0B2' }}>Order ID</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #FFE0B2' }}>Product</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #FFE0B2' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '0.5rem', border: '1px solid #FFE0B2' }}>12345</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #FFE0B2' }}>Sample Product</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #FFE0B2' }}>Pending</td>
                        </tr>
                        {/* Add more rows as needed */}
                    </tbody>
                </table>
            </div>
        </VendorLayout>
    );
}