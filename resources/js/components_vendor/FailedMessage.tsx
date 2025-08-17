import React from 'react';

export default function FailedMessage({ message }: { message: string }) {
    return (
        <div style={{
            background: '#FFF8E1',
            color: '#FFA726',
            padding: '0.7rem 1.2rem',
            borderRadius: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600,
            border: '1px solid #FFD54F',
        }}>
            {message}
        </div>
    );
}