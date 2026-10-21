import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DocumentType } from '../hooks/use-document';

interface DocumentTypeTableProps {
    documents: DocumentType[];
    onEdit: (doc: DocumentType) => void;
    onDelete: (doc: DocumentType) => void;
}

export function DocumentTypeTable({ documents, onEdit, onDelete }: DocumentTypeTableProps) {
    if (!documents || documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50 border border-slate-100 rounded-lg">
                <p>No hay tipos de documentos registrados.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Roles Compatibles</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((doc) => (
                        <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.name}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="font-mono">{doc.code}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={doc.description}>
                                {doc.description || '-'}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {doc.roles && doc.roles.length > 0 ? (
                                        doc.roles.map(role => (
                                            <Badge key={role.id} variant="outline">{role.name}</Badge>
                                        ))
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Ninguno</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEdit(doc)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => onDelete(doc)}
                                            className="text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
