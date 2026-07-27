<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MissionController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\NotificationController;

// Rota pública de Login
Route::post('/login', [AuthController::class, 'login']);

// Rotas Protegidas (Exigem estar logado)
Route::middleware('auth:sanctum')->group(function () {

    // Retorna os dados de quem está logado (Foto, XP, Btlcs)
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);

    // Notificações
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Dashboards e Rankings (Geral)
    Route::get('/ranking', [DashboardController::class, 'ranking']);

    // Missões (Acesso comum)
    Route::get('/missions', [MissionController::class, 'index']);
    Route::post('/missions/{id}/submit', [MissionController::class, 'submit']); // DBV envia missão

    // Loja (Acesso comum)
    Route::get('/store', [StoreController::class, 'index']);
    Route::post('/store/buy/{id}', [StoreController::class, 'buy']); // DBV compra item

    // ==========================================
    // ROTAS EXCLUSIVAS DA DIRETORIA
    // ==========================================
    Route::middleware('can:admin')->prefix('admin')->group(function () {

        // --- Gestão de Missões ---
        Route::post('/missions', [MissionController::class, 'store']);
        Route::put('/missions/{id}', [MissionController::class, 'update']);
        Route::delete('/missions/{id}', [MissionController::class, 'destroy']);
        Route::get('/missions/all', [MissionController::class, 'manageMissions']);

        // --- Apuração de Evidências ---
        Route::get('/missions/pending', [MissionController::class, 'pendingSubmissions']);
        Route::post('/missions/submissions/{id}/approve', [MissionController::class, 'approveSubmission']);
        Route::post('/missions/submissions/{id}/reject', [MissionController::class, 'rejectSubmission']);

        // --- Gestão da Loja ---
        Route::get('/store/purchases', [StoreController::class, 'adminPurchases']);
        Route::get('/store/all', [StoreController::class, 'adminIndex']);
        Route::post('/store', [StoreController::class, 'store']);
        Route::put('/store/{id}', [StoreController::class, 'update']);
        Route::delete('/store/{id}', [StoreController::class, 'destroy']);
        Route::post('/store/toggle-status', [StoreController::class, 'toggleStoreStatus']);

        // --- Gestão de Usuários e Sistema ---
        Route::get('/users', [ProfileController::class, 'indexUsers']);
        Route::post('/users/{id}/change-password', [ProfileController::class, 'adminChangeUserPassword']);
        Route::put('/users/{id}/points', [ProfileController::class, 'adminUpdatePoints']);
        Route::post('/ranking/toggle-status', [DashboardController::class, 'toggleRankingStatus']);
    });
});
