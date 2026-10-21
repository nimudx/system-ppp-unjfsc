import { Search, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export interface AcademicSearchProps {
    isAdmin: boolean;
    search: string;
    setSearch: (search: string) => void;
    onSearch?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export default function AcademicSearch({
    isAdmin,
    search,
    setSearch,
    onSearch,
    isLoading,
    disabled = false,
    placeholder,
}: AcademicSearchProps) {
    // Si se pasa onSearch, es un buscador explícito (backend).
    // Si NO se pasa onSearch, es un buscador reactivo (frontend/local).

    return (
        <div className="relative flex w-full max-w-md items-center gap-2">
            <div className="group relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-foreground" />
                <Input
                    placeholder={placeholder || 'Buscar...'}
                    className="h-9 border-input bg-background pl-9 transition-all focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (!isAdmin) return;
                        if (e.key === 'Enter' && onSearch) {
                            e.preventDefault();
                            onSearch();
                        }
                    }}
                    disabled={isLoading || disabled}
                />
            </div>

            {isAdmin && (
                <Button
                    variant="secondary" // El variant secondary es más limpio que el default negro
                    size="sm"
                    className="h-9 shrink-0 border border-transparent px-3 font-medium transition-all hover:border-input"
                    onClick={onSearch}
                    disabled={isLoading || search.length === 0}
                >
                    {isLoading ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                    ) : (
                        'Buscar'
                    )}
                </Button>
            )}

            {search.length > 0 && (
                <Button
                    variant="ghost" // Sin bordes ni sombras para el botón de limpiar
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setSearch('')}
                    disabled={isLoading || disabled}
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    );
}
