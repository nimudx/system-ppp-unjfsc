import Papa from "papaparse";
import { csvRowSchema } from "./csv.schema";

export function parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
        });
    });
}

export function validateRows(rows: any[]) {
    const valid: any[] = [];
    const errors: any[] = [];

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