import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Check, CheckCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface User {
    id: number;
    name: string;
    email: string;
    user_type: string;
}

interface Message {
    _id: string;
    sender: {
        user_id: number;
        user_type: string;
        name: string;
    };
    recipient: {
        user_id: number;
        user_type: string;
        name: string;
    };
    content: string;
    message_type: string;
    status: string;
    is_read: boolean;
    created_at: string;
}

interface MessengerProps {
    currentUser: User;
    vendorId: number;
    vendorName: string;
    vendorType?: string;
    className?: string;
    isModal?: boolean;
    onClose?: () => void;
}

export default function CustomerMessenger({ 
    currentUser, 
    vendorId, 
    vendorName, 
    vendorType = 'vendor',
    className = '',
    isModal = false,
    onClose 
}: MessengerProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
                userId: currentUser.id,
                userType: currentUser.user_type || 'customer',
                userName: currentUser.name
            });
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        // Listen for new messages
        socket.on('new_message', (message: Message) => {
            console.log('📨 New message received:', message);
            
            // Add message if it's for this conversation
            if ((message.sender.user_id === vendorId && message.recipient.user_id === currentUser.id) ||
                (message.sender.user_id === currentUser.id && message.recipient.user_id === vendorId)) {
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

        // Listen for read confirmations
        socket.on('messages_read', (data: { messageIds: string[]; readBy: number }) => {
            console.log('👁️ Messages marked as read:', data);
            setMessages(prev => 
                prev.map(msg => 
                    data.messageIds.includes(msg._id) 
                        ? { ...msg, is_read: true }
                        : msg
                )
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [currentUser, vendorId]);

    // Load conversation on component mount
    useEffect(() => {
        loadConversation();
    }, [currentUser.id, vendorId]);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversation = async () => {
        try {
            const response = await fetch(`/messages/conversation/${currentUser.id}/${vendorId}`);
            const data = await response.json();
            
            if (data.success) {
                setMessages(data.messages);
                
                // Mark messages as read
                const unreadMessages = data.messages
                    .filter((msg: Message) => msg.recipient.user_id === currentUser.id && !msg.is_read)
                    .map((msg: Message) => msg._id);
                
                if (unreadMessages.length > 0 && socketRef.current) {
                    socketRef.current.emit('mark_as_read', {
                        messageIds: unreadMessages,
                        userId: currentUser.id
                    });
                }
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to load conversation:', error);
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !socketRef.current) return;

        const messageData = {
            sender_id: currentUser.id,
            sender_name: currentUser.name,
            sender_type: currentUser.user_type || 'customer',
            recipient_id: vendorId,
            recipient_name: vendorName,
            recipient_type: vendorType,
            content: newMessage,
            message_type: 'text'
        };

        // Send via Socket.IO for real-time delivery
        socketRef.current.emit('send_message', messageData);
        
        setNewMessage('');
        inputRef.current?.focus();
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
                <div className="p-4 text-center text-gray-500">Loading conversation...</div>
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {vendorName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {connected ? 'Connected' : 'Connecting...'}
                            </p>
                        </div>
                    </div>
                    {isModal && onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                        <p>Start a conversation with {vendorName}</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className={`flex ${
                                message.sender.user_id === currentUser.id ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender.user_id === currentUser.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <div className={`flex items-center justify-between mt-1 space-x-2 ${
                                    message.sender.user_id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    <span className="text-xs">
                                        {formatTime(message.created_at)}
                                    </span>
                                    {message.sender.user_id === currentUser.id && (
                                        <div className="flex items-center">
                                            {message.is_read ? (
                                                <CheckCheck size={14} />
                                            ) : (
                                                <Check size={14} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${vendorName}...`}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                        disabled={!connected}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || !connected}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}