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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Eye, PenBox, Plus, ShieldCheck, ShieldMinus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    phone_number: string;
    is_active: boolean;
    status: string;
    avatar: string;
    tenant: Hotel;
}

const emptyForm = {
    name: '',
    email: '',
    address: '',
    phone_number: '',
    avatar: '',
    _method: '',
};

export default function Managers() {
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

    const { managers, hotels } = usePage<{ managers: Manager[]; hotels: Hotel[] }>().props;
    const [loading, setLoading] = useState(false);

    const [open, setOpen] = useState(false);
    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

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

    // add data
    const handleOpen = () => {
        reset(); // ১. ফর্মের সব ইনপুট এবং এরর ক্লিয়ার করে দিবে
        setIsEdit(false); // ২. এডিট মোড বন্ধ করবে
        setEditId(null); // ৩. পুরনো এডিট আইডি মুছে ফেলবে
        setOpen(true); // ৪. মডাল ওপেন করবে
    };

    // edit data
    const handleOpenEdit = (manager: Manager) => {
        setData({
            name: manager.name,
            email: manager.email,
            address: manager.address,
            phone_number: manager.phone_number,
            avatar: '',
            _method: 'patch',
        });
        setIsEdit(true);
        setEditId(manager.id);
        setOpen(true);
    };

    // view details data
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
    const handleViewDetails = (manager: Manager) => {
        setSelectedManager(manager);
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
            post(route('managers.update', editId), {
                forceFormData: true,
                onSuccess: () => handleClose(),
                onError: (err) => console.log(err),
            });
        } else {
            post(route('managers.store'), {
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
            router.delete(route('managers.destroy', selectedId), {
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
                    <div className="text-2xl font-bold">Assign Manager</div>
                    <Button className="gap-2" onClick={handleOpen}>
                        <Plus size={18} />
                        Add Manager
                    </Button>
                </div>
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
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    {manager.avatar ? (
                                                        <img
                                                            src={manager.avatar}
                                                            alt="avatar"
                                                            className="h-12 w-12 rounded-full border object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">
                                                            No Avatar
                                                        </div>
                                                    )}
                                                </div>
                                                <div>{manager.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{manager.email}</TableCell>
                                        <TableCell>
                                            {manager?.tenant?.hotel_name ? (
                                                <span>
                                                    {manager.tenant.hotel_name}{' '}
                                                    <Button size="sm" variant="outline" className="ml-2" onClick={() => handleUnassign(manager.id)}>
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
                                        <TableCell>
                                            {manager.is_active ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-600">Active</span>{' '}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                        onClick={() => handleToggle(manager.id)}
                                                    >
                                                        {manager.is_active ? (
                                                            <span title="Manager Deactive" className="text-red-300">
                                                                <ShieldMinus />
                                                            </span>
                                                        ) : (
                                                            <span title="Manager Activate" className="text-green-300">
                                                                <ShieldCheck />
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-300">Inactive</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                        onClick={() => handleToggle(manager.id)}
                                                    >
                                                        {manager.is_active ? (
                                                            <span title="Manager Deactive" className="text-red-300">
                                                                <ShieldMinus />
                                                            </span>
                                                        ) : (
                                                            <span title="Manager Activate" className="text-green-300">
                                                                <ShieldCheck />
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(manager)}>
                                                    <Eye size={18} />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(manager)}>
                                                    <PenBox size={18} />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openDeleteModal(manager.id)}>
                                                    <Trash size={18} />
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
                {/* modal  */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="data-[state=open]:animate-out sm:max-w-sm">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>{isEdit ? 'Update Manager' : 'Add Manager'}</DialogTitle>
                                <DialogDescription>Make changes to your nanager details here.</DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div>
                                    <Label htmlFor="name">Manager Name</Label>
                                    <Input id="name" name="name" value={data.name} onChange={handleChange} className="mt-2" />
                                    {errors.name && <div className="mt-1 text-xs text-red-500">{errors.name}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" value={data.email} onChange={handleChange} className="mt-2" />
                                    {errors.email && <div className="mt-1 text-xs text-red-500">{errors.email}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input id="address" name="address" value={data.address} onChange={handleChange} className="mt-2" />
                                    {errors.address && <div className="mt-1 text-xs text-red-500">{errors.address}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="phone_number">Phone Number</Label>
                                    <Input id="phone_number" name="phone_number" value={data.phone_number} onChange={handleChange} className="mt-2" />
                                    {errors.phone_number && <div className="mt-1 text-xs text-red-500">{errors.phone_number}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="avatar">Avatar</Label>
                                    <input
                                        id="avatar"
                                        type="file"
                                        className="mt-2 block w-full cursor-pointer border p-2"
                                        onChange={(e) => {
                                            const target = e.target as HTMLInputElement;
                                            if (target.files && target.files.length > 0) {
                                                const file = target.files[0];
                                                setData('avatar' as any, file);
                                            }
                                        }}
                                    />
                                    {errors.avatar && <div className="mt-1 text-xs text-red-500">{errors.avatar}</div>}
                                </div>
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Processing...' : isEdit ? 'Update' : 'Add Manager'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* view details  */}
                <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent className="data-[state=open]:animate-out sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Manager Information</DialogTitle>
                            <DialogDescription>Full details of the selected manager.</DialogDescription>
                        </DialogHeader>

                        {selectedManager && (
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center gap-2">
                                    {selectedManager.avatar ? (
                                        <img src={selectedManager.avatar} alt="avatar" className="h-12 w-12 rounded-full border object-cover" />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">
                                            No Avatar
                                        </div>
                                    )}

                                    <div>
                                        <span className="text-sm font-semibold text-gray-500">Manager Name</span>
                                        <p className="text-base font-medium">{selectedManager.name}</p>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Email</span>
                                    <p className="text-base">{selectedManager.email}</p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Address</span>
                                    <p className="text-base">{selectedManager.address}</p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Contact Number</span>
                                    <p className="text-base">{selectedManager.phone_number}</p>
                                </div>
                                <hr />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-semibold text-gray-500">Assing Hotel</span>
                                    <p className="text-base">
                                        {selectedManager?.tenant?.hotel_name ? selectedManager?.tenant?.hotel_name : 'Not assigned!'}
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
                            <AlertDialogTitle>Are you sure you want to delete this manager?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this manager record from your database.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
                                Manager Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
