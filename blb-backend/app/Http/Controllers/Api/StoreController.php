<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StoreItem;
use App\Models\Purchase;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Models\Notification;

class StoreController extends Controller
{
    // ==========================================
    // ROTAS PÚBLICAS (Desbravadores)
    // ==========================================

    public function index()
    {
        // Verifica se a loja global está aberta usando o Cache do Laravel
        $isStoreOpen = Cache::get('store_is_open', true);

        if (!$isStoreOpen) {
            return response()->json(['message' => 'A loja BLB está fechada no momento.', 'is_open' => false]);
        }

        $items = StoreItem::where('is_active', true)->where('stock', '>', 0)->get();

        return response()->json(['is_open' => true, 'items' => $items]);
    }

    public function buy(Request $request, $id)
    {
        $user = $request->user();
        $item = \App\Models\StoreItem::findOrFail($id);

        // 1. Verifica se tem no estoque
        if ($item->stock <= 0) {
            return response()->json(['message' => 'Poxa, este produto esgotou no estoque!'], 400);
        }

        // 2. Verifica o saldo do desbravador
        if ($user->betelcoins < $item->price_btlcs) {
            return response()->json([
                'message' => "Saldo insuficiente! Você tem {$user->betelcoins} Btlcs, mas o item custa {$item->price_btlcs} Btlcs."
            ], 400);
        }

        // 3. Efetua a compra (Desconta saldo e baixa estoque)
        $user->decrement('betelcoins', $item->price_btlcs);
        $item->decrement('stock', 1);

        // 4. Registra a compra
        Purchase::create([
            'user_id' => $user->id,
            'store_item_id' => $item->id,
            'price_paid' => $item->price_btlcs,
        ]);

        // 5. Notifica a Diretoria
        Notification::create([
            'type' => 'store',
            'message' => "O desbravador {$user->name} comprou o item '{$item->name}' por {$item->price_btlcs} Btlcs.",
        ]);

        return response()->json([
            'message' => 'Compra realizada com sucesso! Retire seu item com a Diretoria.',
            'new_balance' => $user->betelcoins
        ]);
    }

    // ==========================================
    // ROTAS DA DIRETORIA (Admin)
    // ==========================================

    public function adminIndex()
    {
        $items = StoreItem::all();
        $isStoreOpen = Cache::get('store_is_open', true);

        return response()->json([
            'is_open' => $isStoreOpen,
            'items' => $items
        ]);
    }

    public function adminPurchases()
    {
        $purchases = Purchase::with(['user:id,name', 'storeItem:id,name'])->orderBy('created_at', 'desc')->get();
        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price_btlcs' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:2048' // Max 2MB
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('store_items', 'public');
        }

        $item = StoreItem::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_btlcs' => $validated['price_btlcs'],
            'stock' => $validated['stock'],
            'image_path' => $imagePath,
        ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = StoreItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'price_btlcs' => 'sometimes|integer|min:0',
            'stock' => 'sometimes|integer|min:0',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            $item->image_path = $request->file('image')->store('store_items', 'public');
        }

        $item->update($request->except('image'));

        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = StoreItem::findOrFail($id);

        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }

        $item->delete();

        return response()->json(['message' => 'Produto deletado com sucesso.']);
    }

    public function toggleStoreStatus()
    {
        // Alterna o status da loja entre Aberta (true) e Fechada (false)
        $currentStatus = Cache::get('store_is_open', true);
        $newStatus = !$currentStatus;
        Cache::put('store_is_open', $newStatus);

        $statusName = $newStatus ? 'ABERTA' : 'FECHADA';

        if ($newStatus) {
            Notification::create([
                'type' => 'store',
                'message' => 'A Loja BLB está ABERTA! Corra para aproveitar as novidades.',
            ]);
        }

        return response()->json(['message' => "A loja BLB agora está {$statusName}."]);
    }
}
