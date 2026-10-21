import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";

interface CsvPreviewProps {
    data: any[];
    errors: any[];
}

type CsvError = {
    row: number;
    errors: Record<string, string[]>;
};

function mapErrors(errors: CsvError[]) {
    const map: Record<number, Record<string, string>> = {};

    errors.forEach(err => {
        map[err.row] = {};

        Object.entries(err.errors).forEach(([field, messages]) => {
            map[err.row][field] = messages[0] ?? "Error";
        });
    });

    return map;
}

export function CsvPreview({ data, errors }: CsvPreviewProps) {
    const errorMap = mapErrors(errors);

    const total = data.length;
    const errorCount = errors.length;
    const validCount = total - errorCount;

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const start = (page - 1) * pageSize;
    const paginatedData = data.slice(start, start + pageSize);
    const totalPages = Math.ceil(data.length / pageSize);

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                    Preview de datos
                </CardTitle>

                <div className="flex gap-2">
                    <Badge variant="secondary">
                        Total: {total}
                    </Badge>

                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Válidos: {validCount}
                    </Badge>

                    <Badge variant="destructive">
                        Errores: {errorCount}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="rounded-md border overflow-auto max-h-64">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>DNI</TableHead>
                                <TableHead>Apellidos</TableHead>
                                <TableHead>Nombres</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedData.map((row, i) => {
                                const rowIndex = start + i + 1;
                                const rowError = errorMap[rowIndex];

                                return (
                                    <TableRow
                                        key={i}
                                        className={rowError ? "bg-red-50/50" : ""}
                                    >
                                        <TableCell
                                            className={rowError?.email ? "bg-red-100/70 text-red-600" : ""}
                                            title={rowError?.email}
                                        >
                                            {row.email || (
                                                <span className="text-red-600 italic">
                                                    Vacío
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell
                                            className={rowError?.dni ? "bg-red-100/70 text-red-600" : ""}
                                            title={rowError?.dni}
                                        >
                                            {row.dni || (
                                                <span className="text-red-600 italic">
                                                    Vacío
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell
                                            className={rowError?.apellidos ? "bg-red-100/70 text-red-600" : ""}
                                            title={rowError?.apellidos}
                                        >
                                            {row.apellidos || (
                                                <span className="text-red-600 italic">
                                                    Vacío
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell
                                            className={rowError?.nombres ? "bg-red-100/70 text-red-600" : ""}
                                            title={rowError?.nombres}
                                        >
                                            {row.nombres || (
                                                <span className="text-red-600 italic">
                                                    Vacío
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-muted-foreground">
                        Mostrando {start + 1} - {Math.min(start + pageSize, total)} de {total}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="text-xs px-2 py-1 border rounded disabled:opacity-50"
                        >
                            ←
                        </button>

                        <span className="text-xs">
                            {page} / {totalPages}
                        </span>

                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                            className="text-xs px-2 py-1 border rounded disabled:opacity-50"
                        >
                            →
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}