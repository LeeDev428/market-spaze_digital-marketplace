import { useState, useEffect } from 'react';
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
    RefreshCw
} from 'lucide-react';

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

interface PageProps extends Record<string, unknown> {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            user_type?: string;
        };
    };
}

export default function Messages() {
    const { auth } = usePage<PageProps>().props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    
    // Send message form state
    const [recipientId, setRecipientId] = useState('');
    const [recipientType, setRecipientType] = useState('vendor');
    const [recipientName, setRecipientName] = useState('');
    const [messageContent, setMessageContent] = useState('');
    
    // Load user's messages
    const loadMessages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/messages/user/${auth.user.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin' // Include session cookies
            });
            
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Send a new message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!recipientId || !recipientName || !messageContent.trim()) {
            alert('Please fill in all fields');
            return;
        }
        
        setSending(true);
        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin', // Important: Include session cookies
                body: JSON.stringify({
                    recipient_id: parseInt(recipientId),
                    recipient_type: recipientType,
                    recipient_name: recipientName,
                    content: messageContent,
                    message_type: 'text'
                })
            });
            
            const data = await response.json();
            if (data.success) {
                // Clear form
                setRecipientId('');
                setRecipientName('');
                setMessageContent('');
                
                // Reload messages
                loadMessages();
                
                alert('Message sent successfully!');
            } else {
                alert(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };
    
    // Simple date formatting function
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    useEffect(() => {
        loadMessages();
    }, []);
    
    return (
        <AppLayout>
            <Head title="Messages" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-slate-900 dark:text-slate-100">
                            
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">Messages</h1>
                                        <p className="text-slate-600 dark:text-slate-400">Send and receive messages</p>
                                    </div>
                                </div>
                                <Button onClick={loadMessages} disabled={loading}>
                                    {loading ? 'Loading...' : 'Refresh'}
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Send Message Form */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Send className="h-5 w-5" />
                                            <span>Send New Message</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={sendMessage} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Recipient ID
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        value={recipientId}
                                                        onChange={(e) => setRecipientId(e.target.value)}
                                                        placeholder="e.g., 2"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        Recipient Type
                                                    </label>
                                                    <select 
                                                        value={recipientType} 
                                                        onChange={(e) => setRecipientType(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="vendor">Vendor</option>
                                                        <option value="rider">Rider</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Recipient Name
                                                </label>
                                                <Input
                                                    value={recipientName}
                                                    onChange={(e) => setRecipientName(e.target.value)}
                                                    placeholder="e.g., John Doe"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Message
                                                </label>
                                                <Textarea
                                                    value={messageContent}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessageContent(e.target.value)}
                                                    placeholder="Type your message here..."
                                                    rows={4}
                                                    maxLength={1000}
                                                    required
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {messageContent.length}/1000 characters
                                                </p>
                                            </div>
                                            
                                            <Button type="submit" disabled={sending} className="w-full">
                                                {sending ? 'Sending...' : 'Send Message'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                                
                                {/* Messages List */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Users className="h-5 w-5" />
                                            <span>Your Messages ({messages.length})</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="text-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                <p className="mt-2 text-slate-600 dark:text-slate-400">Loading messages...</p>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center py-8">
                                                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                                <p className="text-slate-600 dark:text-slate-400">No messages yet</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-500">Send your first message to get started</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {messages.map((message) => (
                                                    <div 
                                                        key={message._id}
                                                        className={`p-4 rounded-lg border ${
                                                            message.sender.user_id === auth.user.id
                                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ml-8'
                                                                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 mr-8'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center space-x-2">
                                                                <User className="h-4 w-4 text-slate-500" />
                                                                <span className="text-sm font-medium">
                                                                    {message.sender.user_id === auth.user.id ? 'You' : message.sender.name}
                                                                </span>
                                                                <span className="text-xs text-slate-500">
                                                                    ({message.sender.user_type})
                                                                </span>
                                                                {message.sender.user_id !== auth.user.id && (
                                                                    <span className="text-xs text-slate-500">
                                                                        to {message.recipient.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-500">
                                                                {formatDate(message.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300">{message.content}</p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                                message.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                                                                message.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                                {message.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
