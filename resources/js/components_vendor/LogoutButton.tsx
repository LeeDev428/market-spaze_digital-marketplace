import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);

    function handleLogout(e: React.MouseEvent) {
        e.preventDefault();
        setShowConfirm(true);
    }

    function confirmLogout() {
        setShowConfirm(false);
        router.post('/logout');
    }

    function cancelLogout() {
        setShowConfirm(false);
    }

    return (
        <>
            <button
                onClick={handleLogout}
                style={{
                    background: '#FFA726',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1.2rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #FFA72644',
                    transition: 'background 0.2s',
                }}
            >
                Logout
            </button>
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: '1rem',
                        padding: '2rem 2.5rem',
                        boxShadow: '0 4px 32px #FFA72633',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 320,
                    }}>
                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
                            <circle cx="12" cy="12" r="12" fill="#FFF8E1"/>
                            <path d="M15.75 9V7.5A3.75 3.75 0 0 0 12 3.75a3.75 3.75 0 0 0-3.75 3.75V9" stroke="#FFA726" strokeWidth="1.5" strokeLinecap="round"/>
                            <rect x="6.75" y="9" width="10.5" height="8.25" rx="2" stroke="#FFA726" strokeWidth="1.5"/>
                            <path d="M12 13.25v2" stroke="#FFA726" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#FFA726', marginBottom: 8 }}>
                            Confirm Logout
                        </div>
                        <div style={{ color: '#333', marginBottom: 24, textAlign: 'center' }}>
                            Are you sure you want to log out of your vendor account?
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    background: '#FFA726',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1.5rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px #FFA72644',
                                }}
                            >
                                Yes, Logout
                            </button>
                            <button
                                onClick={cancelLogout}
                                style={{
                                    background: '#FFF8E1',
                                    color: '#FFA726',
                                    border: '1px solid #FFA726',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem 1.5rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}