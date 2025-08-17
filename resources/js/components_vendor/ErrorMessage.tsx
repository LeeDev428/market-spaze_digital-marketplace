import React from 'react';

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div style={{
            background: '#FFEBEE',
            color: '#C62828',
            padding: '0.7rem 1.2rem',
            borderRadius: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600,
            border: '1px solid #FF8A80',
        }}>
            {message}
        </div>
    );
}