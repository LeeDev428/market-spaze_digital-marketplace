import React from 'react';

export default function SuccessMessage({ message }: { message: string }) {
    return (
        <div style={{
            background: '#C8E6C9',
            color: '#388E3C',
            padding: '0.7rem 1.2rem',
            borderRadius: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600,
        }}>
            {message}
        </div>
    );
}