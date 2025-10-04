import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

const decodeLabel = (label: string): string =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&hellip;/g, '…');

export function Pagination({ links }: PaginationProps) {
    if (!links || links.length <= 1) {
        return null;
    }

    return (
        <nav className="flex flex-wrap items-center gap-1" role="navigation" aria-label="Pagination">
            {links.map((link, index) => {
                const label = decodeLabel(link.label);
                const isEllipsis = label === '…';

                if (isEllipsis) {
                    return (
                        <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                            {label}
                        </span>
                    );
                }

                if (link.url === null) {
                    return (
                        <span key={`page-${index}`} className="pointer-events-none rounded-full px-3 py-1 text-sm text-muted-foreground select-none">
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={link.url + index.toString()}
                        href={link.url}
                        className={cn(
                            'rounded-full px-3 py-1 text-sm transition-colors',
                            link.active ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                        preserveScroll
                        preserveState
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
