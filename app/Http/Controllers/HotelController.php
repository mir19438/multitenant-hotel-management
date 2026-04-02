<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HotelController extends Controller
{
    public function index()
    {
        $hotels = Tenant::with('rooms')->latest()->get();
        return Inertia::render('hotels', [
            'hotels' => $hotels,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hotel_name'     => 'required|string|max:255',
            'address'        => 'required|string|max:255',
            'contact_number' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,webp|max:20480', // 20 mb
        ]);

        if ($request->hasFile('image')) {
            // 'hotels' ফোল্ডারে ইমেজটি সেভ হবে এবং পাথটি ডাটাবেসে যাবে
            $path = $request->file('image')->store('hotels', 'public');
            $data['image'] = '/storage/' . $path;
        }

        Tenant::create([
            'hotel_name'     => $data['hotel_name'],
            'address'        => $data['address'],
            'contact_number' => $data['contact_number'],
            'image' => $data['image'],
        ]);

        return redirect()->route('hotels.index')->with('success', 'Hotel created successfully!');
    }

    public function update1(Request $request, $id)
    {
        $hotel = Tenant::findOrFail($id);

        $data = $request->validate([
            'hotel_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,webp|max:20480', // 20 mb
        ]);

        if ($request->hasFile('image')) {
            // 'hotels' ফোল্ডারে ইমেজটি সেভ হবে এবং পাথটি ডাটাবেসে যাবে
            $path = $request->file('image')->store('hotels', 'public');
            $data['image'] = '/storage/' . $path;
        }


        $hotel->hotel_name = $data['hotel_name'] ?? $hotel->hotel_name;
        $hotel->address = $data['address'] ?? $hotel->address;
        $hotel->contact_number = $data['contact_number'] ?? $hotel->contact_number;
        $hotel->image = $data['image'] ?? $hotel->image;

        $hotel->save();


        return redirect()->route('hotels.index')->with('success', 'Hotel updated successfully!');
    }



    public function update(Request $request, $id)
    {
        $hotel = Tenant::findOrFail($id);

        $data = $request->validate([
            'hotel_name' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpg,png,jpeg,webp|max:20480', // 20 mb
        ]);

        if ($request->hasFile('image')) {
            // ১. পুরাতন ইমেজটি সার্ভার থেকে ডিলিট করা
            if ($hotel->image) {
                // ডাটাবেসে যদি পাথ '/storage/hotels/name.jpg' এভাবে থাকে, তবে '/storage/' অংশটি বাদ দিয়ে পাথ বের করতে হয়
                $oldPath = str_replace('/storage/', '', $hotel->image);

                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // ২. নতুন ইমেজটি সেভ করা
            $path = $request->file('image')->store('hotels', 'public');
            $data['image'] = '/storage/' . $path;
        }

        // ডাটা আপডেট করা
        $hotel->hotel_name = $data['hotel_name'] ?? $hotel->hotel_name;
        $hotel->address = $data['address'] ?? $hotel->address;
        $hotel->contact_number = $data['contact_number'] ?? $hotel->contact_number;
        $hotel->image = $data['image'] ?? $hotel->image;

        $hotel->save();

        return redirect()->route('hotels.index')->with('success', 'Hotel updated successfully!');
    }


    public function destroy($id)
    {
        $hotel = Tenant::findOrFail($id);

        if ($hotel->image) {
            $filePath = str_replace('/storage/', '', $hotel->image);
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
        }

        $hotel->delete();

        return redirect()->route('hotels.index')->with('success', 'Hotel and its image deleted successfully!');
    }
}
