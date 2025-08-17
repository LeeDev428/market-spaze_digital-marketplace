import React from 'react';

export default function SuccessMessage({ message }: { message: string }) {
    return (
        <div style={{
            background: '#E1F5FE',
            color: '#0277BD',
            padding: '0.7rem 1.2rem',
            borderRadius: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600,
            border: '1px solid #81D4FA',
        }}>
            {message}
        </div>
    );
}