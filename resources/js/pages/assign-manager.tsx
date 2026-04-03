import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Assign Manager',
        href: route('managers'),
    },
];

interface Room {
    id: number;
    tenant_id: number;
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
    created_at: string;
    image: string;
    rooms: Room[];
}

interface Manager {
    id: number;
    name: string;
    tenant_id: number;
    email: string;
    address: string;
    contact_number: string;
    is_active: boolean;
    status: string;
    image: string;
    tenant: Hotel;
}

export default function Managers() {
    const { managers, hotels } = usePage<{ managers: Manager[]; hotels: Hotel[] }>().props;
    const [loading, setLoading] = useState(false);

    const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

    const handleToggle = (managerId: number) => {
        setLoading(true);
        router.patch(
            route('managers.toggleActiveInactive', managerId),
            {},
            {
                onSuccess: () => setLoading(false),
                onError: () => setLoading(false),
                preserveScroll: true,
            },
        );
    };

    const handleAssign = (managerId: number, tenantId: number) => {
        setLoading(true);
        router.patch(
            route('managers.assign', managerId),
            { tenant_id: tenantId },
            {
                onSuccess: () => setLoading(false),
                onError: () => setLoading(false),
                preserveScroll: true,
            },
        );
    };

    const handleUnassign = (managerId: number) => {
        setLoading(true);
        router.patch(
            route('managers.unassign', managerId),
            {},
            {
                onSuccess: () => setLoading(false),
                onError: () => setLoading(false),
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="p-6">
                {/* header */}
                <div className="text-2xl font-bold">Assign Manager</div>
                {/* table */}
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Assign Hotel</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-end">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {managers && managers.length > 0 ? (
                                managers.map((manager) => (
                                    <TableRow key={manager.id}>
                                        <TableCell>{`#${manager.id}`}</TableCell>
                                        <TableCell>{manager.name}</TableCell>
                                        <TableCell>{manager.email}</TableCell>
                                        <TableCell>
                                            {manager?.tenant?.hotel_name ? (
                                                <span>
                                                    {manager.tenant.hotel_name}{' '}
                                                    <Button size="sm" variant="outline" className="ml-2" onClick={()=>handleUnassign(manager.id)}>
                                                        Unassign
                                                    </Button>
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Select onValueChange={(value) => setSelectedHotelId(value)}>
                                                        <SelectTrigger className="w-full max-w-48">
                                                            <SelectValue placeholder="Select a hotel" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>All Hotels</SelectLabel>
                                                                {hotels.map((hotel) => (
                                                                    <SelectItem value={`${hotel.id}`}>{hotel.hotel_name}</SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                    {/* <Button size="sm" variant="outline" onClick={() => handleAssign(manager.id)}>
                                                        Assign
                                                    </Button> */}

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        // যখন selectedHotelId থাকবে এবং লোডিং হবে না তখনই বাটন কাজ করবে
                                                        onClick={() => selectedHotelId && handleAssign(manager.id, Number(selectedHotelId))}
                                                        disabled={!selectedHotelId}
                                                    >
                                                        Assign
                                                    </Button>
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>{manager.is_active ? <span className='text-green-300'>Active</span> : <span className='text-red-300'>Inactive</span>}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleToggle(manager.id)}>
                                                    {manager.is_active ? (
                                                        <span className="text-red-300">Deactivate</span>
                                                    ) : (
                                                        <span className="text-green-300">Activate</span>
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-400">
                                        No managers found!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
