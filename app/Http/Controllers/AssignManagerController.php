<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
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

    public function assign(Request $request, $managerId)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
        ]);

        $manager = User::findOrFail($managerId);
        $manager->tenant_id = $request->tenant_id;
        $manager->save();

        return  redirect()->route('managers');
    }

    public function unassign($managerId)
    {
        $manager = User::findOrFail($managerId);
        $manager->tenant_id = null;
        $manager->save();

        return  redirect()->route('managers');
    }

    public function toggleActiveInactive($managerId)
    {
        $manager = User::findOrFail($managerId);
        $manager->is_active = !$manager->is_active;
        $manager->save();

        return redirect()->route('managers')->with('success', 'User status updated!');
    }
}
