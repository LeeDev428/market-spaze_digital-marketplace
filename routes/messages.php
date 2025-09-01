<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Messages API Routes
|--------------------------------------------------------------------------
*/

// Use web middleware group to handle session auth properly
Route::middleware(['web'])->group(function () {
    
    // Debug authentication route
    Route::get('/messages/debug-auth', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'authenticated' => $user ? true : false,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type ?? 'customer'
            ] : null,
            'session_id' => $request->session()->getId(),
            'csrf_token' => csrf_token(),
            'headers' => [
                'x-csrf-token' => $request->header('X-CSRF-TOKEN'),
                'cookie' => $request->header('Cookie')
            ]
        ]);
    });
    
    // Get user's messages
    Route::get('/messages/user/{userId}', function (Request $request, $userId) {
        try {
            $response = Http::get("http://127.0.0.1:3003/api/messages/user/{$userId}", [
                'page' => $request->get('page', 1),
                'limit' => $request->get('limit', 20)
            ]);
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Messaging service unavailable: ' . $e->getMessage()
            ], 503);
        }
    });
    
    // Send a message
    Route::post('/messages/send', function (Request $request) {
        $validated = $request->validate([
            'recipient_id' => 'required|integer',
            'recipient_type' => 'required|string|in:customer,vendor,rider,admin',
            'recipient_name' => 'required|string',
            'content' => 'required|string|max:1000',
            'message_type' => 'sometimes|string|in:text,image,file'
        ]);
        
        try {
            // Multiple ways to get the authenticated user
            $user = $request->user();
            
            // If request->user() doesn't work, try Auth facade
            if (!$user) {
                $user = \Illuminate\Support\Facades\Auth::user();
            }
            
            // If still no user, try to get from session manually
            if (!$user) {
                $userId = $request->session()->get('login_web_59ba36addc2b2f9401580f014c7f58ea4e30989d');
                if ($userId) {
                    $user = \App\Models\User::find($userId);
                }
            }
            
            Log::info('Authentication debug:', [
                'request_user' => $request->user() ? 'found' : 'null',
                'auth_user' => \Illuminate\Support\Facades\Auth::user() ? 'found' : 'null',
                'session_keys' => array_keys($request->session()->all()),
                'final_user' => $user ? ['id' => $user->id, 'name' => $user->name] : 'null'
            ]);
            
            // Make sure user is authenticated
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Could not find authenticated user. Please refresh the page and try again.',
                    'debug' => [
                        'session_id' => $request->session()->getId(),
                        'session_keys' => array_keys($request->session()->all())
                    ]
                ], 401);
            }
            
            // ALWAYS use the authenticated user's real data from MySQL
            $messageData = [
                'sender_id' => $user->id,
                'sender_type' => $user->user_type ?? 'customer',
                'sender_name' => $user->name, // THIS IS YOUR REAL NAME FROM MYSQL DATABASE
                'recipient_id' => $validated['recipient_id'],
                'recipient_type' => $validated['recipient_type'],
                'recipient_name' => $validated['recipient_name'],
                'content' => $validated['content'],
                'message_type' => $validated['message_type'] ?? 'text'
            ];
            
            Log::info('Sending message with REAL USER DATA:', [
                'mysql_user_id' => $user->id,
                'mysql_user_name' => $user->name,
                'mysql_user_email' => $user->email,
                'message_data' => $messageData
            ]);
            
            $response = Http::post('http://127.0.0.1:3003/api/messages/send', $messageData);
            
            if ($response->successful()) {
                Log::info('Message sent successfully to MongoDB with real name:', [
                    'sender_name' => $user->name
                ]);
                return response()->json($response->json());
            } else {
                Log::error('Node.js service error:', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to send message to messaging service'
                ], 500);
            }
            
        } catch (\Exception $e) {
            Log::error('Laravel message send error:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to send message: ' . $e->getMessage()
            ], 500);
        }
    });
    
    // Get conversation between two users
    Route::get('/messages/conversation/{user1}/{user2}', function (Request $request, $user1, $user2) {
        try {
            $response = Http::get("http://localhost:3002/api/messages/conversation/{$user1}/{$user2}", [
                'page' => $request->get('page', 1),
                'limit' => $request->get('limit', 50)
            ]);
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Messaging service unavailable'
            ], 503);
        }
    });
});
