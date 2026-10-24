export default function CompanyResourceContent() {
    return (
        <div className="space-y-4 p-6">
            <h1 className="text-2xl font-semibold">Recursos empresariales</h1>
            <p className="text-sm text-muted-foreground">
                Aquí se integrarán los documentos, plantillas y guías para la
                gestión de prácticas con la empresa.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/40 p-4">
                    <h2 className="font-medium">Guía para la formalización</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Revisa los requisitos, los documentos y la información
                        del jefe inmediato antes de registrar la práctica.
                    </p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-4">
                    <h2 className="font-medium">Cronograma del proceso</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Consulta los pasos de revisión, aceptación del estudiante y
                        seguimiento del plan de prácticas.
                    </p>
                </div>
            </div>
        </div>
    );
}
