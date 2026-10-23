import Papa from 'papaparse';
import type { CsvRow, CsvValidationError } from '@/modules/registration/types';
import { csvRowSchema } from './csv.schema';

export function parseCSV(file: File): Promise<CsvRow[]> {
    return new Promise((resolve) => {
        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
        });
    });
}


export function validateRows(rows: CsvRow[]) {
    const valid: CsvRow[] = [];
    const errors: CsvValidationError[] = [];

    const seenDnis = new Map<string, number>();
    const seenEmails = new Map<string, number>();

    rows.forEach((row, index) => {
        const result = csvRowSchema.safeParse(row);

        const fieldErrors: Record<string, string[] | undefined> =
            result.success
                ? {}
                : { ...result.error.flatten().fieldErrors };

        const dni = (row.dni ?? '').trim();
        const email = (row.email ?? '').trim().toLowerCase();

        if (dni) {
            const firstRow = seenDnis.get(dni);

            if (firstRow !== undefined) {
                (fieldErrors.dni ??= []).push(
                    `DNI duplicado. Aparece en la fila ${firstRow}.`
                );
            } else {
                seenDnis.set(dni, index + 1);
            }
        }

        if (email) {
            const firstRow = seenEmails.get(email);

            if (firstRow !== undefined) {
                (fieldErrors.email ??= []).push(
                    `Correo duplicado. Aparece en la fila ${firstRow}.`
                );
            } else {
                seenEmails.set(email, index + 1);
            }
        }

        if (Object.keys(fieldErrors).length > 0) {
            errors.push({
                row: index + 1,
                errors: fieldErrors,
            });
        } else if (result.success) {
            valid.push(result.data);
        }
    });

    return { valid, errors };
}

