import React from 'react';

export default function Pagination({ current, total, onPageChange }: { current: number, total: number, onPageChange: (page: number) => void }) {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
            {[...Array(total)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    style={{
                        background: current === i + 1 ? '#FFA726' : '#FFF3E0',
                        color: current === i + 1 ? '#fff' : '#FFA726',
                        border: '1px solid #FFA726',
                        borderRadius: '0.3rem',
                        padding: '0.3rem 0.7rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                    }}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
}