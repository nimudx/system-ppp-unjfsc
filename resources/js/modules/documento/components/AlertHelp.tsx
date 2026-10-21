import { Info, ExternalLink } from "lucide-react";

export function AlertHelp() {
    return (
        <div className="rounded-xl border p-4 transition-all">
            <div className="flex gap-3">
                <div className="shrink-0">
                    <Info className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold leading-none">
                        ¿Necesitas ayuda con tus archivos?
                    </span>

                    <p className="text-xs leading-relaxed">
                        Sube archivos <strong>PDF</strong> menores a <strong>10MB</strong>. Asegúrate de que el contenido sea legible.
                    </p>

                    <div className="mt-2">
                        <a
                            href="https://www.ilovepdf.com/es/comprimir_pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline transition-colors"
                        >
                            Comprimir mi PDF aquí
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}