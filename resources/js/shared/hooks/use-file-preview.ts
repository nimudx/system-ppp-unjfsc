import { useEffect, useState } from 'react';

export function useFilePreview(file: File | null): string | null {
    const [preview, setPreview] = useState<{ file: File; url: string } | null>(
        null,
    );
    useEffect(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string')
                setPreview({ file, url: reader.result });
        };
        reader.readAsDataURL(file);
        return () => {
            reader.onload = null;
            if (reader.readyState === FileReader.LOADING) reader.abort();
        };
    }, [file]);
    return file && preview?.file === file ? preview.url : null;
}
