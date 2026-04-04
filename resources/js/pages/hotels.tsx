import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Bed, Eye, PenBox, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner'; // অথবা "@/components/ui/use-toast" যেটা আপনি ইনস্টল করেছেন

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Manage Hotels',
        href: route('hotels.index'),
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

const emptyForm = {
    hotel_name: '',
    address: '',
    contact_number: '',
    image: '',
};

export default function Hotels() {
    const { flash } = usePage().props as any; // Shared data থেকে flash মেসেজ নিন

    useEffect(() => {
        // Success Message
        if (flash?.success) {
            toast.success('Success', {
                description: flash.success,
                // action: {
                //     label: 'Undo',
                //     onClick: () => console.log('Undo logic here'),
                // },
            });
        }

        // Error Message
        if (flash?.error) {
            toast.error('Error', {
                description: flash.error,
                // action: {
                //     label: 'Close',
                //     onClick: () => console.log('Closed'),
                // },
            });
        }
    }, [flash]); // flash চেঞ্জ হলেই এই ইফেক্ট চলবে

    // const { hotels } = usePage().props as unknown as { hotels: Hotel[] };
    const { hotels } = usePage<{ hotels: Hotel[] }>().props;

    const [open, setOpen] = useState(false);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // add data
    const handleOpen = () => {
        reset(); // ১. ফর্মের সব ইনপুট এবং এরর ক্লিয়ার করে দিবে
        setIsEdit(false); // ২. এডিট মোড বন্ধ করবে
        setEditId(null); // ৩. পুরনো এডিট আইডি মুছে ফেলবে
        setOpen(true); // ৪. মডাল ওপেন করবে
    };

    // edit data
    const handleOpenEdit = (hotel: Hotel) => {
        setData({
            hotel_name: hotel.hotel_name,
            address: hotel.address,
            contact_number: hotel.contact_number,
            image: hotel.image,
        });
        setIsEdit(true);
        setEditId(hotel.id);
        setOpen(true);
    };

    // view details data
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const handleViewDetails = (hotel: Hotel) => {
        setSelectedHotel(hotel);
        setViewOpen(true);
    };

    // dialog close
    const handleClose = () => {
        setOpen(false);
        reset(); // এটি একাই setForm, setErrors এবং ডাটা রিসেট করে দিবে
        setIsEdit(false);
        setEditId(null);
    };

    // আপনাকে আলাদা করে handleChange ফাংশনটি লিখতে হবে না
    // সরাসরি ইনপুটের onChange-এ এভাবে লিখতে পারেন:
    // onChange={(e) => setData('hotel_name', e.target.value)}
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as any, value);
    };

    // form submit store and update
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && editId) {
            router.post(
                route('hotels.update', editId),
                {
                    ...data,
                    _method: 'put',
                },
                {
                    forceFormData: true,
                    onSuccess: () => handleClose(),
                    onError: (err) => console.log(err),
                },
            );
        } else {
            post(route('hotels.store'), {
                forceFormData: true,
                onSuccess: () => handleClose(),
                onError: (err) => console.log(err),
            });
        }
    };

    // delete data form database
    const { delete: destroy } = useForm(); // delete কিওয়ার্ডটি সংরক্ষিত, তাই 'destroy' হিসেবে রিনেম করুন
    const [openAlertModal, setAlertModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const openDeleteModal = (id: number) => {
        setSelectedId(id);
        setAlertModal(true);
    };
    const confirmDelete = () => {
        if (selectedId) {
            router.delete(`/hotels/${selectedId}`, {
                onSuccess: () => {
                    setAlertModal(false); // কাজ শেষ হলে অ্যালার্ট বন্ধ হবে
                    console.log('Deleted successfully!');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="p-6">
                {/* header */}
                <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">Hotels Management</div>
                    <Button className="gap-2" onClick={handleOpen}>
                        <Plus size={18} />
                        Add Hotel
                    </Button>
                </div>
                {/* table */}
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Id</TableHead>
                                <TableHead>Image</TableHead>
                                <TableHead>Hotel Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact Number</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead className="text-end">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hotels && hotels.length > 0 ? (
                                hotels.map((hotel) => (
                                    <TableRow key={hotel.id}>
                                        <TableCell>{`#${hotel.id}`}</TableCell>
                                        <TableCell>
                                            {hotel.image ? (
                                                <img src={hotel.image} alt={hotel.hotel_name} className="h-12 w-12 rounded-lg border object-cover" />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-[10px] text-gray-500">
                                                    No Image
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{hotel.hotel_name}</TableCell>
                                        <TableCell>{hotel.address}</TableCell>
                                        <TableCell>{hotel.contact_number}</TableCell>
                                        <TableCell>
                                            {hotel.created_at
                                                ? `${new Date(hotel.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}, ${new Date(hotel.created_at).getFullYear()}`
                                                : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(hotel)}>
                                                    <Eye size={18} />
                                                </Button>

                                                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(hotel)}>
                                                    <PenBox size={18} />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openDeleteModal(hotel.id)}>
                                                    <Trash size={18} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-400">
                                        No hotels found!
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* modal  */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="data-[state=open]:animate-out sm:max-w-sm">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{isEdit ? 'Update Hotel' : 'Add Hotel'}</DialogTitle>
                                <DialogDescription>Make changes to your hotel details here.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div>
                                    <Label htmlFor="hotel_name">Hotel Name</Label>
                                    <Input
                                        id="hotel_name"
                                        name="hotel_name"
                                        value={data.hotel_name}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                    {errors.hotel_name && <div className="mt-1 text-xs text-red-500">{errors.hotel_name}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" value={data.address} onChange={handleChange} required className="mt-2" />
                                    {errors.address && <div className="mt-1 text-xs text-red-500">{errors.address}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        name="contact_number"
                                        value={data.contact_number}
                                        onChange={handleChange}
                                        required
                                        className="mt-2"
                                    />
                                    {errors.contact_number && <div className="mt-1 text-xs text-red-500">{errors.contact_number}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="image">Hotel Image</Label>
                                    <input
                                        id="image"
                                        type="file"
                                        className="mt-2 block w-full cursor-pointer border p-2"
                                        onChange={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            if (target.files && target.files.length > 0) {
                                                const file = target.files[0];
                                                setData('image' as any, file);
                                            }
                                        }}
                                    />
                                    {errors.image && <div className="mt-1 text-xs text-red-500">{errors.image}</div>}
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Processing...' : isEdit ? 'Update' : 'Add Hotel'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* view details  */}
                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent className="data-[state=open]:animate-out sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Hotel Information</DialogTitle>
                            <DialogDescription>Full details of the selected hotel.</DialogDescription>
                        </DialogHeader>

                        {selectedHotel && (
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col gap-1 pb-4">
                                    <img
                                        src={selectedHotel.image}
                                        alt={selectedHotel.hotel_name}
                                        className="h-[200px] w-full rounded-lg border object-cover"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Hotel Name</span>
                                    <p className="text-base font-medium">{selectedHotel.hotel_name}</p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Address</span>
                                    <p className="text-base">{selectedHotel.address}</p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Contact Number</span>
                                    <p className="text-base">{selectedHotel.contact_number}</p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Created At</span>
                                    <p className="text-base">
                                        {selectedHotel.created_at
                                            ? `${new Date(selectedHotel.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}, ${new Date(selectedHotel.created_at).getFullYear()}`
                                            : 'N/A'}
                                    </p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Rooms</span>
                                    <p className="text-base">
                                        {selectedHotel?.rooms && selectedHotel.rooms.length > 0 ? (
                                            selectedHotel.rooms.map((room: Room) => (
                                                <div key={room.id} className="mb-1 flex items-center text-sm">
                                                    <Bed className="mr-1 text-green-500" size={16} />
                                                    Room {room.room_number} - {room.type} - {room.status} - ${room.price_per_night}
                                                </div>
                                            ))
                                        ) : (
                                            <li className="text-xs text-gray-400">No rooms</li>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="button" onClick={() => setViewOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* delete confirm modal  */}
                <AlertDialog open={openAlertModal} onOpenChange={setAlertModal}>
                    <AlertDialogContent className="data-[state=open]:animate-out">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete this hotel?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this hotel record from your database.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
                                Hotel Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
