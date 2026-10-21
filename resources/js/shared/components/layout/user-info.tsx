import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useInitials } from '@/shared/hooks/use-initials';
import type { User } from '@/shared/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    // Helper function to prepend /storage/ to partial paths
    const getAvatarUrl = (path: string | undefined) => {
        if (!path) return undefined;
        if (path.startsWith('http') || path.startsWith('/storage/')) return path;
        return `/storage/${path}`;
    };

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.profile_name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {user.profile_name}
                </span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
