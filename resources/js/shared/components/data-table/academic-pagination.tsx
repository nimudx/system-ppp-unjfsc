import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/shared/components/ui/pagination";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface LaravelPaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AcademicPaginationProps {
    isAdmin: boolean;
    isLoading?: boolean;

    // ── Modo API (Admin) ──────────────────────────────────────────────────────
    /** Links que devuelve Laravel en el objeto paginador */
    links?: LaravelPaginatorLink[];
    /** Total de registros en BD */
    total?: number;
    /** Cuántos se muestran en esta página */
    showing?: number;
    /** Callback al hacer clic en un link de página */
    onPageChange?: (url: string) => void;

    // ── Modo Local (Docente / Supervisor) ─────────────────────────────────────
    /** Página local actual */
    currentPage?: number;
    /** Total de páginas locales */
    totalPages?: number;
    /** Cuántos registros se muestran en la página local */
    localShowing?: number;
    /** Total de registros filtrados localmente */
    localTotal?: number;
    /** Callback al cambiar página local */
    onLocalPageChange?: (page: number) => void;
}

// ─── Helper: genera números de páginas con elipsis ────────────────────────────
function buildPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AcademicPagination({
    isAdmin,
    isLoading = false,
    // Admin props
    links,
    total,
    showing,
    onPageChange,
    // Local props
    currentPage = 1,
    totalPages = 1,
    localShowing,
    localTotal,
    onLocalPageChange,
}: AcademicPaginationProps) {

    // ── Modo API (Admin) ──────────────────────────────────────────────────────
    if (isAdmin) {
        if (!links || links.length <= 3) return null; // Solo "prev/1/next" → no paginamos

        return (
            <div className="px-4 py-2.5 bg-muted/5 flex flex-wrap gap-3 items-center justify-between border-t text-[11px] text-muted-foreground">
                <span className="font-medium ml-1 shrink-0">
                    Mostrando <strong>{showing ?? 0}</strong> de <strong>{total ?? 0}</strong> registros
                </span>
                <Pagination className="mx-0 w-auto">
                    <PaginationContent className="gap-0.5">
                        {links.map((link, idx) => {
                            const isPrev    = link.label.includes("Previous");
                            const isNext    = link.label.includes("Next");
                            const isEllipsis = link.label === "...";
                            const disabled  = !link.url || isLoading;

                            if (isPrev) return (
                                <PaginationItem key={idx}>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); if (link.url) onPageChange?.(link.url); }}
                                        className={disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            );
                            if (isNext) return (
                                <PaginationItem key={idx}>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); if (link.url) onPageChange?.(link.url); }}
                                        className={disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            );
                            if (isEllipsis) return (
                                <PaginationItem key={idx}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                            return (
                                <PaginationItem key={idx}>
                                    <PaginationLink
                                        href="#"
                                        isActive={link.active}
                                        onClick={(e) => { e.preventDefault(); if (link.url) onPageChange?.(link.url); }}
                                        className={`text-xs ${disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"}`}
                                    >
                                        {link.label}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                    </PaginationContent>
                </Pagination>
            </div>
        );
    }

    // ── Modo Local (Docente / Supervisor) ─────────────────────────────────────
    if (totalPages <= 1) return null;

    const pages = buildPageNumbers(currentPage, totalPages);

    return (
        <div className="px-4 py-2.5 bg-muted/5 flex flex-wrap gap-3 items-center justify-between border-t text-[11px] text-muted-foreground">
            <span className="font-medium ml-1 shrink-0">
                Mostrando <strong>{localShowing ?? 0}</strong> de <strong>{localTotal ?? 0}</strong>
            </span>
            <Pagination className="mx-0 w-auto">
                <PaginationContent className="gap-0.5">
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (currentPage > 1) onLocalPageChange?.(currentPage - 1); }}
                            className={currentPage <= 1 ? "opacity-40 pointer-events-none" : "cursor-pointer"}
                        />
                    </PaginationItem>

                    {pages.map((p, i) =>
                        p === "..." ? (
                            <PaginationItem key={`ellipsis-${i}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    href="#"
                                    isActive={currentPage === p}
                                    onClick={(e) => { e.preventDefault(); onLocalPageChange?.(p as number); }}
                                    className="cursor-pointer text-xs"
                                >
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    )}

                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) onLocalPageChange?.(currentPage + 1); }}
                            className={currentPage >= totalPages ? "opacity-40 pointer-events-none" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
