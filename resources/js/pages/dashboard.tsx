import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Room {
    id: number;
    room_number: number;
    type: string;
    price_per_night: number;
    status: string;
}

interface Hotel {
    id: number;
    hotel_name: string;
    address: string;
    contact_number: string;
    rooms: Room[];
}

export default function Dashboard() {
    const { isAdmin, hotels, hotel, guestsCount, roomsCount, bookingsCount, totalHotels, totalRooms, TotalManagers, totalGuests, auth } = usePage()
        .props as unknown as any;

    const user = auth?.user;

    if (user?.role === 'MANAGER' && !user?.tenant_id) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-screen items-center justify-center">
                    <h1 className="text-xl font-bold text-gray-600">You are not a manager of any hotel yet.</h1>
                </div>
            </AppLayout>
        );
    }

    const [open, setOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    const handleHotelClick = (hotel: Hotel) => {
        setSelectedHotel(hotel);
        setOpen(true);
    };

    if (isAdmin) {
        const safeHotels: Hotel[] = Array.isArray(hotels) ? hotels : [];

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Dashboard" />
                <div className="p-6">
                    <h1 className="mb-6 text-2xl font-bold">All Hotels Overview</h1>
                    {/* card */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-950">
                            <Building2 className="mx-auto mb-2 text-blue-500" size={32} />
                            <div className="mb-2 text-lg font-semibold">total Hotels</div>
                            <div className="text-3xl font-bold">{totalHotels ?? 0}</div>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-950">
                            <Building2 className="mx-auto mb-2 text-green-500" size={32} />
                            <div className="mb-2 text-lg font-semibold">total Rooms</div>
                            <div className="text-3xl font-bold">{totalRooms ?? 0}</div>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-950">
                            <Building2 className="mx-auto mb-2 text-purple-500" size={32} />
                            <div className="mb-2 text-lg font-semibold">total Managers</div>
                            <div className="text-3xl font-bold">{TotalManagers ?? 0}</div>
                        </Card>

                        <Card className="border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-950">
                            <Building2 className="mx-auto mb-2 text-yellow-500" size={32} />
                            <div className="mb-2 text-lg font-semibold">total Guests</div>
                            <div className="text-3xl font-bold">{totalGuests ?? 0}</div>
                        </Card>
                    </div>
                    {/* hotels table */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {safeHotels.map((hotel: Hotel) => (
                            <button
                                key={hotel.id} // tenant_id এর বদলে id ব্যবহার করা নিরাপদ
                                className="w-full text-left focus:outline-none"
                                onClick={() => handleHotelClick(hotel)}
                                type="button"
                            >
                                <Card className="cursor-pointer p-6 transition-shadow hover:shadow-lg">
                                    <div className="mb-2 flex items-center">
                                        <Building2 className="mr-2 text-blue-500" />
                                        <span className="text-lg font-semibold">{hotel.hotel_name}</span>
                                    </div>
                                    {/* এখানে হোটেলের ঠিকানা বা অন্য তথ্য যোগ করতে পারেন */}
                                    <p className="text-sm text-gray-500">{hotel.address}</p>
                                </Card>
                            </button>
                        ))}
                    </div>

                    {/* Hotel Details Modal */}
                </div>
            </AppLayout>
        );
    }
}
