import { useState, useEffect, useRef } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    MessageSquare, 
    Send, 
    User, 
    Users, 
    ArrowLeft,
    Search,
    Star,
    Building2,
    BadgeCheck,
    Phone,
    Mail,
    MapPin,
    Clock,
    RefreshCw,
    ChevronRight
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Messages', href: '/messages' },
];

interface Message {
    _id: string;
    sender: {
        user_id: number;
        user_type: string;
        name: string;
        avatar?: string;
    };
    recipient: {
        user_id: number;
        user_type: string;
        name: string;
        avatar?: string;
    };
    content: string;
    message_type: string;
    status: string;
    created_at: string;
}

interface Vendor {
    id: number;
    business_name: string;
    description: string;
    address: string;
    contact_phone: string;
    contact_email: string;
    rating?: number;
    total_reviews?: number;
    verified?: boolean;
    response_time?: string;
    business_type?: string;
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            user_type?: string;
        };
    };
    vendors: Vendor[];
    selectedVendorId?: string;
}

export default function Messages() {
    const { auth, vendors: initialVendors, selectedVendorId } = usePage<PageProps>().props;
    const [currentView, setCurrentView] = useState<'vendors' | 'conversation'>('vendors');
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [vendors, setVendors] = useState<Vendor[]>(initialVendors || []);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        socketRef.current = io('http://127.0.0.1:3003', {
            withCredentials: true
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setConnected(true);
            // Join the socket with user info
            socket.emit('join', {
                userId: auth.user.id,
                userType: auth.user.user_type || 'customer',
                userName: auth.user.name
            });
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        // Listen for online/offline status
        socket.on('user_online', (userData: { userId: number; userType: string; userName: string }) => {
            setOnlineUsers(prev => new Set([...prev, userData.userId]));
        });

        socket.on('user_offline', (userData: { userId: number; userType: string; userName: string }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userData.userId);
                return newSet;
            });
        });

        socket.on('online_users', (userIds: number[]) => {
            setOnlineUsers(new Set(userIds));
        });

        // Listen for new messages
        socket.on('new_message', (message: Message) => {
            console.log('📨 New message received:', message);
            
            // Add message if it's for the current conversation
            if (selectedVendor && 
                ((message.sender.user_id === selectedVendor.id && message.recipient.user_id === auth.user.id) ||
                 (message.sender.user_id === auth.user.id && message.recipient.user_id === selectedVendor.id))) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        });

        // Listen for message sent confirmation
        socket.on('message_sent', (message: Message) => {
            console.log('✅ Message sent confirmation:', message);
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, [selectedVendor, auth.user.id]);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle vendor selection from URL params or props
    useEffect(() => {
        if (selectedVendorId) {
            const vendorId = parseInt(selectedVendorId);
            const vendor = vendors.find(v => v.id === vendorId);
            if (vendor) {
                setSelectedVendor(vendor);
                setCurrentView('conversation');
                loadMessages(vendorId);
            }
        }
        
        // For testing: Set some vendors as online
        const vendorIds = vendors.map(v => v.id);
        setOnlineUsers(new Set(vendorIds));
    }, [selectedVendorId, vendors]);

    const loadVendors = async () => {
        // Vendors are now loaded from props, no need to fetch separately
        setLoading(false);
    };

    const loadVendorById = async (vendorId: number) => {
        setLoading(true);
        try {
            const vendor = vendors.find(v => v.id === vendorId);
            if (vendor) {
                setSelectedVendor(vendor);
                setCurrentView('conversation');
                await loadMessages(vendorId);
            }
        } catch (error) {
            console.error('Error loading vendor:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (vendorId?: number) => {
        if (!vendorId && !selectedVendor) return;
        
        const targetVendorId = vendorId || selectedVendor?.id;
        setLoading(true);
        try {
            const response = await fetch(`/api/messages/user/${auth.user.id}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Messages response:', data);
            
            if (data.messages && Array.isArray(data.messages)) {
                // Filter messages for this vendor conversation
                const vendorMessages = data.messages.filter((msg: Message) => 
                    (msg.sender.user_id === targetVendorId && msg.recipient.user_id === auth.user.id) ||
                    (msg.sender.user_id === auth.user.id && msg.recipient.user_id === targetVendorId)
                );
                // Sort messages by created_at to show newest at bottom
                vendorMessages.sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setMessages(vendorMessages);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageContent.trim() || !selectedVendor || !socketRef.current || !connected) {
            alert('Please enter a message or check your connection');
            return;
        }

        setSending(true);
        try {
            const messageData = {
                sender_id: auth.user.id,
                sender_type: auth.user.user_type || 'customer',
                sender_name: auth.user.name,
                recipient_id: selectedVendor.id,
                recipient_type: 'vendor',
                recipient_name: selectedVendor.business_name,
                content: messageContent,
                message_type: 'text'
            };

            console.log('Sending message via Socket.IO:', messageData);

            // Send via Socket.IO for real-time delivery
            socketRef.current.emit('send_message', messageData);

            // Clear form immediately (message will be added via socket confirmation)
            setMessageContent('');
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSending(false);
        }
    };
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (error) {
            return dateString;
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleVendorSelect = async (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setCurrentView('conversation');
        await loadMessages(vendor.id);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Vendors List View */}
                        {currentView === 'vendors' && (
                            <div>
                                {/* Header */}
                                <div className="mb-8">
                                    <div className="flex items-center mb-6">
                                        <MessageSquare className="h-8 w-8 text-blue-500 mr-4" />
                                        <div>
                                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                                Messages
                                            </h1>
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                                Choose a vendor to start a conversation
                                            </p>
                                        </div>
                                    </div>

                                    {/* Search */}
                                    <div className="relative max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search vendors..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Vendors Grid */}
                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                        <span className="ml-4 text-slate-600 dark:text-slate-400">Loading vendors...</span>
                                    </div>
                                ) : filteredVendors.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 max-w-md mx-auto">
                                            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                                                No vendors found
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-400">
                                                Try adjusting your search or check back later.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {filteredVendors.map((vendor) => (
                                            <button
                                                key={vendor.id}
                                                onClick={() => handleVendorSelect(vendor)}
                                                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300 text-left group"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="relative">
                                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                                    {vendor.business_name}
                                                                </h3>
                                                                {onlineUsers.has(vendor.id) && (
                                                                    <div className="absolute -top-1 -right-2 w-3 h-3 bg-green-400 rounded-full border border-white shadow-sm"></div>
                                                                )}
                                                            </div>
                                                            {vendor.verified && (
                                                                <BadgeCheck className="text-blue-500" size={20} />
                                                            )}
                                                            {onlineUsers.has(vendor.id) && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Online</span>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                                            {vendor.description}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                                    <div className="flex items-center">
                                                        <Star className="text-yellow-400 fill-current mr-1" size={14} />
                                                        <span>{vendor.rating || 4.8}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Users className="mr-1" size={14} />
                                                        <span>{vendor.total_reviews || 0} reviews</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                                                    <span className="line-clamp-1">{vendor.address}</span>
                                                </div>

                                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                    <Clock size={14} className="mr-1" />
                                                    <span>Responds {vendor.response_time || 'within 24 hours'}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Conversation View */}
                        {currentView === 'conversation' && selectedVendor && (
                            <div>
                                {/* Header */}
                                <div className="mb-8">
                                    <button
                                        onClick={() => setCurrentView('vendors')}
                                        className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors group"
                                    >
                                        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-medium">Back to vendors</span>
                                    </button>

                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="relative mr-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <Building2 className="text-white" size={24} />
                                                    </div>
                                                    {onlineUsers.has(selectedVendor.id) && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                                            {selectedVendor.business_name}
                                                        </h2>
                                                        {selectedVendor.verified && (
                                                            <BadgeCheck className="text-blue-500" size={20} />
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                                                        <span className={onlineUsers.has(selectedVendor.id) ? 'text-green-500' : 'text-gray-500'}>
                                                            {onlineUsers.has(selectedVendor.id) ? '🟢 Online' : '⚫ Offline'} • 
                                                        </span> {selectedVendor.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={`tel:${selectedVendor.contact_phone}`}
                                                    className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <Phone size={20} />
                                                </a>
                                                <a
                                                    href={`mailto:${selectedVendor.contact_email}`}
                                                    className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                                >
                                                    <Mail size={20} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
                                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                Conversation
                                            </h3>
                                            <button
                                                onClick={() => loadMessages()}
                                                disabled={loading}
                                                className="p-2 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                <span className="ml-2 text-slate-600 dark:text-slate-400">Loading messages...</span>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                                <p className="text-slate-600 dark:text-slate-400 mb-2">No messages yet</p>
                                                <p className="text-sm text-slate-500">Start the conversation by sending a message below</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {messages.map((message) => (
                                                    <div 
                                                        key={message._id}
                                                        className={`flex ${message.sender.user_id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                                            message.sender.user_id === auth.user.id
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                                                        }`}>
                                                            <p className="text-sm">{message.content}</p>
                                                            <div className={`text-xs mt-2 ${
                                                                message.sender.user_id === auth.user.id
                                                                    ? 'text-blue-100'
                                                                    : 'text-slate-500 dark:text-slate-400'
                                                            }`}>
                                                                {formatDate(message.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Send Message Form */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                                    <form onSubmit={sendMessage} className="p-6">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <textarea
                                                    placeholder="Type your message..."
                                                    value={messageContent}
                                                    onChange={(e) => setMessageContent(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                                                />
                                                <div className="text-xs text-slate-500 mt-2">
                                                    {messageContent.length}/1000 characters
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={sending || !messageContent.trim() || !connected}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center self-start"
                                            >
                                                <Send size={20} className="mr-2" />
                                                {sending ? 'Sending...' : connected ? 'Send' : 'Connecting...'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
