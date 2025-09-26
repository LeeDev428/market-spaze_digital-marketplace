<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * Get messages for a user (compatible with MongoDB service)
     */
    public function getUserMessages(Request $request, $userId)
    {
        try {
            // First try to get from MongoDB service
            $response = Http::timeout(5)->get("http://127.0.0.1:3003/api/messages/user/{$userId}", [
                'page' => $request->get('page', 1),
                'limit' => $request->get('limit', 20)
            ]);
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (\Exception $e) {
            Log::warning('MongoDB service unavailable, falling back to database: ' . $e->getMessage());
        }

        // Fallback to Laravel database
        try {
            $messages = Message::where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('recipient_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('limit', 20));

            return response()->json([
                'success' => true,
                'messages' => $messages->items(),
                'pagination' => [
                    'current_page' => $messages->currentPage(),
                    'total_pages' => $messages->lastPage(),
                    'total' => $messages->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load messages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send a message (compatible with MongoDB service)
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'sender_id' => 'required|integer',
            'sender_type' => 'required|string',
            'sender_name' => 'required|string',
            'recipient_id' => 'required|integer',
            'recipient_type' => 'required|string',
            'recipient_name' => 'required|string',
            'content' => 'required|string',
            'message_type' => 'string'
        ]);

        try {
            // First try to send to MongoDB service
            $response = Http::timeout(10)->post('http://127.0.0.1:3003/api/messages/send', $request->all());
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (\Exception $e) {
            Log::warning('MongoDB service unavailable, storing in database: ' . $e->getMessage());
        }

        // Fallback to Laravel database
        try {
            $message = Message::create([
                'sender_id' => $request->sender_id,
                'sender_type' => $request->sender_type,
                'sender_name' => $request->sender_name,
                'recipient_id' => $request->recipient_id,
                'recipient_type' => $request->recipient_type,
                'recipient_name' => $request->recipient_name,
                'content' => $request->content,
                'message_type' => $request->message_type ?? 'text',
                'status' => 'sent'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => [
                    '_id' => $message->id,
                    'sender' => [
                        'user_id' => $message->sender_id,
                        'user_type' => $message->sender_type,
                        'name' => $message->sender_name
                    ],
                    'recipient' => [
                        'user_id' => $message->recipient_id,
                        'user_type' => $message->recipient_type,
                        'name' => $message->recipient_name
                    ],
                    'content' => $message->content,
                    'message_type' => $message->message_type,
                    'status' => $message->status,
                    'created_at' => $message->created_at->toISOString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's conversations with unread counts
     */
    public function getConversations(Request $request, $userId)
    {
        try {
            // First try MongoDB service
            $response = Http::timeout(5)->get("http://127.0.0.1:3003/api/messages/conversations/{$userId}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (\Exception $e) {
            Log::warning('MongoDB service unavailable, using database: ' . $e->getMessage());
        }

        // Fallback to Laravel database
        try {
            $conversations = Message::selectRaw('
                CASE 
                    WHEN sender_id = ? THEN recipient_id 
                    ELSE sender_id 
                END as other_user_id,
                CASE 
                    WHEN sender_id = ? THEN recipient_name 
                    ELSE sender_name 
                END as other_user_name,
                CASE 
                    WHEN sender_id = ? THEN recipient_type 
                    ELSE sender_type 
                END as other_user_type,
                MAX(created_at) as last_message_time,
                COUNT(*) as total_messages,
                SUM(CASE WHEN recipient_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count
            ', [$userId, $userId, $userId, $userId])
            ->where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('recipient_id', $userId);
            })
            ->groupByRaw('other_user_id, other_user_name, other_user_type')
            ->orderBy('last_message_time', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'conversations' => $conversations->map(function($conv) {
                    return [
                        'user_id' => $conv->other_user_id,
                        'user_name' => $conv->other_user_name,
                        'user_type' => $conv->other_user_type,
                        'last_message_time' => $conv->last_message_time,
                        'total_messages' => $conv->total_messages,
                        'unread_count' => $conv->unread_count
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load conversations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get total unread message count for a user
     */
    public function getUnreadCount(Request $request, $userId)
    {
        try {
            // First try MongoDB service
            $response = Http::timeout(5)->get("http://127.0.0.1:3003/api/messages/unread-count/{$userId}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (\Exception $e) {
            Log::warning('MongoDB service unavailable, using database: ' . $e->getMessage());
        }

        // Fallback to Laravel database
        try {
            $unreadCount = Message::where('recipient_id', $userId)
                                 ->where('is_read', false)
                                 ->count();

            return response()->json([
                'success' => true,
                'unread_count' => $unreadCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get unread count: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversation between two users
     */
    public function getConversation(Request $request, $user1, $user2)
    {
        try {
            // First try MongoDB service
            $response = Http::timeout(5)->get("http://127.0.0.1:3003/api/messages/conversation/{$user1}/{$user2}");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (\Exception $e) {
            Log::warning('MongoDB service unavailable, using database: ' . $e->getMessage());
        }

        // Fallback to Laravel database
        try {
            $messages = Message::where(function($query) use ($user1, $user2) {
                $query->where(function($q) use ($user1, $user2) {
                    $q->where('sender_id', $user1)->where('recipient_id', $user2);
                })->orWhere(function($q) use ($user1, $user2) {
                    $q->where('sender_id', $user2)->where('recipient_id', $user1);
                });
            })
            ->orderBy('created_at', 'asc')
            ->get();

            return response()->json([
                'success' => true,
                'messages' => $messages->map(function($message) {
                    return [
                        '_id' => $message->id,
                        'sender' => [
                            'user_id' => $message->sender_id,
                            'user_type' => $message->sender_type,
                            'name' => $message->sender_name
                        ],
                        'recipient' => [
                            'user_id' => $message->recipient_id,
                            'user_type' => $message->recipient_type,
                            'name' => $message->recipient_name
                        ],
                        'content' => $message->content,
                        'message_type' => $message->message_type,
                        'status' => $message->status,
                        'created_at' => $message->created_at->toISOString()
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to load conversation: ' . $e->getMessage()
            ], 500);
        }
    }
}
