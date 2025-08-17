import React from 'react';

export default function FailedMessage({ message }: { message: string }) {
    return (
        <div style={{
            background: '#FFF3E0',
            color: '#FF6F1A',
            padding: '0.7rem 1.2rem',
            borderRadius: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600,
        }}>
            {message}
        </div>
    );
}