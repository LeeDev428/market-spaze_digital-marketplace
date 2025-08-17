import React from 'react';

export default function ErrorMessage({ message }: { message: string }) {
    return (
        <div style={{
            background: '#FFCDD2',
            color: '#D32F2F',
            padding: '0.7rem 1.2rem',
            borderRadius: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600,
        }}>
            {message}
        </div>
    );
}