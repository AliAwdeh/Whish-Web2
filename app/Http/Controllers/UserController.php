<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $authUser = auth()->user();

        if ($authUser->role !== 'admin') {
            abort(403, 'Admin only');
        }

        return User::paginate(20);
    }

    public function store(Request $request)
    {
        $authUser = auth()->user();

        if ($authUser->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,user,agent',
            'phone' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        $authUser = auth()->user();

        if ($authUser->role !== 'admin' && $authUser->id !== $user->id) {
            abort(403, 'Forbidden');
        }

        return $user;
    }

    public function update(Request $request, User $user)
    {
        $authUser = auth()->user();

        if ($authUser->role !== 'admin' && $authUser->id !== $user->id) {
            abort(403, 'Forbidden');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|required|string|min:6',
            'role' => 'sometimes|required|in:admin,user,agent',
            'phone' => 'nullable|string|max:30',
            'country' => 'nullable|string|max:100',
        ]);

        if ($authUser->role !== 'admin') {
            unset($data['role']);
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $authUser = auth()->user();

        if ($authUser->role !== 'admin') {
            abort(403, 'Admin only');
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
