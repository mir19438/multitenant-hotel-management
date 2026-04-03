import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // বর্তমান পেজের পাথ বের করার ফাংশন
    const isActive = (itemUrl: string) => {
        // যদি itemUrl ফুল URL হয় (যেমন route() দিয়ে আসা), তবে শুধু পাথটুকু নিবে
        // উদাহরণ: 'http://127.0.0.1:8000/dashboard' থেকে হবে '/dashboard'
        const path = itemUrl.startsWith('http') ? new URL(itemUrl).pathname : itemUrl;

        // current page url এবং item path মিললে true রিটার্ন করবে
        return page.url === path;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {/* <SidebarMenuButton asChild isActive={item.url === page.url}> */}
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
