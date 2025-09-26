import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage();
    const { auth } = page.props as any;
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);

    // Fetch unread messages count with real-time updates
    useEffect(() => {
        const fetchUnreadCount = async () => {
            if (auth?.user?.id) {
                try {
                    const response = await fetch(`http://127.0.0.1:3003/api/messages/unread-count/${auth.user.id}`);
                    const data = await response.json();
                    if (data.success) {
                        setUnreadCount(data.unread_count);
                    }
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                }
            }
        };

        // Initialize Socket.IO for real-time updates
        if (auth?.user?.id) {
            socketRef.current = io('http://127.0.0.1:3003', {
                withCredentials: true
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                socket.emit('join', {
                    userId: auth.user.id,
                    userType: auth.user.user_type || 'customer',
                    userName: auth.user.name
                });
            });

            // Listen for real-time unread count updates
            socket.on('unread_count_update', (data: { unreadCount: number }) => {
                console.log('📊 Real-time unread count update:', data.unreadCount);
                setUnreadCount(data.unreadCount);
            });

            // Listen for new messages to immediately update count
            socket.on('new_message', (message: any) => {
                if (message.recipient.user_id === auth.user.id) {
                    setUnreadCount(prev => prev + 1);
                }
            });

            fetchUnreadCount();
        }

        // Poll for updates every 30 seconds as fallback
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => {
            clearInterval(interval);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [auth?.user?.id]);

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 flex-1">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {/* Message Notification Icon */}
            <div className="flex items-center gap-2">
                <Link
                    href="/messages"
                    className="relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                    title={unreadCount > 0 ? `${unreadCount} unread messages` : 'Messages'}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}
