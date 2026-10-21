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

    rows.forEach((row, index) => {
        const result = csvRowSchema.safeParse(row);

        if (result.success) {
            valid.push(result.data);
        } else {
            errors.push({
                row: index + 1,
                errors: result.error.flatten().fieldErrors,
            });
        }
    });

    return { valid, errors };
}
