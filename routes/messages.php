<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Messages API Routes
|--------------------------------------------------------------------------
*/

// Temporarily remove auth for testing
Route::group([], function () {
    
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
            'message_type' => 'sometimes|string|in:text,image,file',
            'sender_id' => 'sometimes|integer',
            'sender_name' => 'sometimes|string'
        ]);
        
        try {
            $user = $request->user();
            
            // Use authenticated user data if available, otherwise use request data
            if ($user) {
                $messageData = [
                    'sender_id' => $user->id,
                    'sender_type' => $user->user_type ?? 'customer',
                    'sender_name' => $user->name,
                    'recipient_id' => $validated['recipient_id'],
                    'recipient_type' => $validated['recipient_type'],
                    'recipient_name' => $validated['recipient_name'],
                    'content' => $validated['content'],
                    'message_type' => $validated['message_type'] ?? 'text'
                ];
            } else {
                // For testing without authentication
                $messageData = [
                    'sender_id' => $validated['sender_id'] ?? 1,
                    'sender_type' => 'customer',
                    'sender_name' => $validated['sender_name'] ?? 'Test User',
                    'recipient_id' => $validated['recipient_id'],
                    'recipient_type' => $validated['recipient_type'],
                    'recipient_name' => $validated['recipient_name'],
                    'content' => $validated['content'],
                    'message_type' => $validated['message_type'] ?? 'text'
                ];
            }
            
            $response = Http::post('http://127.0.0.1:3003/api/messages/send', $messageData);
            
            return response()->json($response->json());
        } catch (\Exception $e) {
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
