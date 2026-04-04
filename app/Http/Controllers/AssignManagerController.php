<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignManagerController extends Controller
{
    public function index()
    {
        $managers = User::with('tenant')->where('role', 'MANAGER')->latest()->get();

        $hotels = Tenant::latest()->get();

        return Inertia::render('assign-manager', [
            'managers' => $managers,
            'hotels' => $hotels,

        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users,email', // unique রুল যোগ করা হয়েছে
            'address'      => 'required|string|max:255',
            'phone_number' => 'required|string|max:255',
            'avatar'       => 'nullable|image|mimes:jpg,png,jpeg,webp|max:20480', // 20 mb
        ]);

        if ($request->hasFile('avatar')) {
            // 'avatars' ফোল্ডারে ইমেজটি সেভ হবে এবং পাথটি ডাটাবেসে যাবে
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = '/storage/' . $path;
        }

        User::create([
            'name'     => $data['name'],
            'email'     => $data['email'],
            'email_verified_at' => now(),
            'password'     => bcrypt('12345678'),
            'address'        => $data['address'],
            'phone_number' => $data['phone_number'],
            'avatar' => $data['avatar'],
        ]);

        return redirect()->route('managers')->with('success', 'Manager created successfully!');
    }

    public function update(Request $request, $id)
    {
        $manager = User::findOrFail($id);

        $data = $request->validate([
            'name'         => 'nullable|string|max:255',
            // ইমেইল ইউনিক চেক করার সময় বর্তমান ইউজারের ID বাদ দিতে হবে
            'email'        => 'required|string|email|max:255|unique:users,email,' . $id,
            'address'      => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
            'avatar'       => 'nullable|image|mimes:jpg,png,jpeg,webp|max:20480', // 20 mb
        ]);

        if ($request->hasFile('avatar')) {
            // ১. পুরাতন ইমেজটি সার্ভার থেকে ডিলিট করা
            if ($manager->avatar) {
                // ডাটাবেসে যদি পাথ '/storage/hotels/name.jpg' এভাবে থাকে, তবে '/storage/' অংশটি বাদ দিয়ে পাথ বের করতে হয়
                $oldPath = str_replace('/storage/', '', $manager->avatar);

                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // ২. নতুন ইমেজটি সেভ করা
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = '/storage/' . $path;
        }

        // ডাটা আপডেট করা
        $manager->name = $data['name'] ?? $manager->name;
        $manager->email = $data['email'] ?? $manager->email;
        $manager->address = $data['address'] ?? $manager->address;
        $manager->phone_number = $data['phone_number'] ?? $manager->phone_number;
        $manager->avatar = $data['avatar'] ?? $manager->avatar;

        $manager->save();

        return redirect()->route('managers')->with('success', 'Manager updated successfully!');
    }

    public function assign(Request $request, $managerId)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $manager = User::findOrFail($managerId);
        $manager->tenant_id = $request->tenant_id;
        $manager->save();

        return  redirect()->route('managers')->with('success', 'Hotel assigned successfully!');
    }

    public function unassign($managerId)
    {
        $manager = User::findOrFail($managerId);
        $manager->tenant_id = null;
        $manager->save();

        return  redirect()->route('managers')->with('success', 'Hotel unassigned successfully!');
    }

    public function toggleActiveInactive($managerId)
    {
        $manager = User::findOrFail($managerId);
        $manager->is_active = !$manager->is_active;
        $manager->save();

        return redirect()->route('managers')->with('success', 'User status updated!');
    }

    public function destroy($id)
    {
        $manager = User::findOrFail($id);

        if ($manager->avatar) {
            $filePath = str_replace('/storage/', '', $manager->avatar);
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
        }

        $manager->delete();

        return redirect()->route('managers')->with('success', 'Manager and its avatar deleted successfully!');
    }
}
