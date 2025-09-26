import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import VendorLayout from '@/layouts/app/VendorLayout';
import { MessageSquare, Send, User, Clock, Check, CheckCheck } from 'lucide-react';
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

interface Conversation {
    user_id: number;
    user_name: string;
    user_type: string;
    last_message: string;
    last_message_time: string;
    total_messages: number;
    unread_count: number;
}

interface MessagesProps {
    auth: {
        user: User;
    };
}

export default function Messages({ auth }: MessagesProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        socketRef.current = io('http://127.0.0.1:3003', {
            withCredentials: true
        });

        const socket = socketRef.current;

        // Join the socket with user info
        socket.emit('join', {
            userId: auth.user.id,
            userType: auth.user.user_type || 'vendor',
            userName: auth.user.name
        });

        // Listen for new messages
        socket.on('new_message', (message: Message) => {
            console.log('📨 New message received:', message);
            console.log('🔍 Current vendor ID:', auth.user.id);
            console.log('🔍 Message sender:', message.sender.user_id, message.sender.name);
            console.log('🔍 Message recipient:', message.recipient.user_id, message.recipient.name);
            console.log('🔍 Selected conversation:', selectedConversation);
            
            // Check if this message is for this vendor
            const isForThisVendor = message.recipient.user_id === auth.user.id || message.sender.user_id === auth.user.id;
            
            if (isForThisVendor) {
                console.log('✅ Message is for this vendor');
                
                // Add message to current conversation if it's open
                if (selectedConversation && 
                    (message.sender.user_id === selectedConversation || 
                     message.recipient.user_id === selectedConversation)) {
                    console.log('➕ Adding message to current conversation');
                    setMessages(prev => [...prev, message]);
                    scrollToBottom();
                }

                // Update conversation list
                console.log('🔄 Updating conversations list');
                updateConversationsList();
            } else {
                console.log('❌ Message is not for this vendor');
            }
        });

        // Listen for message sent confirmation
        socket.on('message_sent', (message: Message) => {
            console.log('✅ Message sent confirmation:', message);
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        // Listen for message read confirmations
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

        // Listen for user online/offline status
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

        return () => {
            socket.disconnect();
        };
    }, [auth.user, selectedConversation]);

    // Load conversations on component mount
    useEffect(() => {
        loadConversations();
    }, []);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadConversations = async () => {
        try {
            console.log('🔄 Loading conversations for vendor:', auth.user.id);
            const response = await fetch(`http://127.0.0.1:3003/api/messages/conversations/${auth.user.id}`);
            const data = await response.json();
            
            console.log('📋 Conversations response:', data);
            
            if (data.success) {
                setConversations(data.conversations);
                console.log('✅ Loaded conversations:', data.conversations.length);
            } else {
                console.error('❌ Failed to load conversations:', data);
            }
            setLoading(false);
        } catch (error) {
            console.error('❌ Failed to load conversations:', error);
            setLoading(false);
        }
    };

    const updateConversationsList = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:3003/api/messages/conversations/${auth.user.id}`);
            const data = await response.json();
            
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Failed to update conversations:', error);
        }
    };

    const loadConversation = async (userId: number) => {
        try {
            console.log('💬 Loading conversation between vendor', auth.user.id, 'and user', userId);
            setSelectedConversation(userId);
            const response = await fetch(`http://127.0.0.1:3003/api/messages/conversation/${auth.user.id}/${userId}`);
            const data = await response.json();
            
            console.log('📨 Conversation messages response:', data);
            
            if (data.success) {
                setMessages(data.messages);
                console.log('✅ Loaded messages:', data.messages.length);
                
                // Mark messages as read
                const unreadMessages = data.messages
                    .filter((msg: Message) => msg.recipient.user_id === auth.user.id && !msg.is_read)
                    .map((msg: Message) => msg._id);
                
                if (unreadMessages.length > 0 && socketRef.current) {
                    console.log('👁️ Marking messages as read:', unreadMessages);
                    socketRef.current.emit('mark_as_read', {
                        messageIds: unreadMessages,
                        userId: auth.user.id
                    });
                }
            } else {
                console.error('❌ Failed to load conversation:', data);
            }
        } catch (error) {
            console.error('❌ Failed to load conversation:', error);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newMessage.trim() || !selectedConversation || !socketRef.current) return;

        const selectedUser = conversations.find(conv => conv.user_id === selectedConversation);
        if (!selectedUser) return;

        const messageData = {
            sender_id: auth.user.id,
            sender_name: auth.user.name,
            sender_type: auth.user.user_type || 'vendor',
            recipient_id: selectedConversation,
            recipient_name: selectedUser.user_name,
            recipient_type: selectedUser.user_type,
            content: newMessage,
            message_type: 'text'
        };

        // Send via Socket.IO for real-time delivery
        socketRef.current.emit('send_message', messageData);
        
        setNewMessage('');
        updateConversationsList();
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

    const selectedUser = conversations.find(conv => conv.user_id === selectedConversation);

    if (loading) {
        return (
            <VendorLayout>
                <Head title="Messages" />
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Loading conversations...</div>
                </div>
            </VendorLayout>
        );
    }

    return (
        <VendorLayout>
            <Head title="Messages" />
            
            {/* Page Header */}
            <div className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
                </div>
            </div>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="flex h-[600px]">
                            {/* Conversations List */}
                            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Conversations
                                    </h3>
                                </div>
                                
                                <div className="overflow-y-auto h-full">
                                    {conversations.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            No conversations yet
                                        </div>
                                    ) : (
                                        conversations.map((conversation) => (
                                            <div
                                                key={conversation.user_id}
                                                onClick={() => loadConversation(conversation.user_id)}
                                                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                                    selectedConversation === conversation.user_id 
                                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                                <User size={20} className="text-gray-600 dark:text-gray-400" />
                                                            </div>
                                                            {onlineUsers.has(conversation.user_id) && (
                                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {conversation.user_name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                                {conversation.last_message}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <p className="text-xs text-gray-400">
                                                            {formatTime(conversation.last_message_time)}
                                                        </p>
                                                        {conversation.unread_count > 0 && (
                                                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                                {conversation.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                                    <span>{conversation.total_messages} messages</span>
                                                    <span className="capitalize">{conversation.user_type}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col">
                                {selectedConversation && selectedUser ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                                        <User size={20} className="text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    {onlineUsers.has(selectedUser.user_id) && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                        {selectedUser.user_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                        {onlineUsers.has(selectedUser.user_id) ? 'Online' : 'Offline'} • {selectedUser.user_type}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {messages.map((message) => (
                                                <div
                                                    key={message._id}
                                                    className={`flex ${
                                                        message.sender.user_id === auth.user.id ? 'justify-end' : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                            message.sender.user_id === auth.user.id
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                                        }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <div className={`flex items-center justify-between mt-1 space-x-2 ${
                                                            message.sender.user_id === auth.user.id ? 'text-blue-100' : 'text-gray-500'
                                                        }`}>
                                                            <span className="text-xs">
                                                                {formatTime(message.created_at)}
                                                            </span>
                                                            {message.sender.user_id === auth.user.id && (
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
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Message Input */}
                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                            <form onSubmit={sendMessage} className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="text-center text-gray-500">
                                            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>Select a conversation to start messaging</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}