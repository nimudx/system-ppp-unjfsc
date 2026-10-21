function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

export function PersonSStepThree({
    data,
    roles,
    faculties,
}: any) {
    const getLabel = (arr: any[], id: number) =>
        arr?.find((i) => i.id.toString() === id?.toString())?.name || '—';

    const selectedFaculty = faculties.find((f: any) => f.id.toString() === data.faculty_id?.toString());
    const schoolName = getLabel(selectedFaculty?.schools, data.school_id);

    const selectedSchool = selectedFaculty?.schools?.find((s: any) => s.id.toString() === data.school_id?.toString());
    const sectionName = getLabel(selectedSchool?.sections, data.section_id);

    return (
        <div className="grid animate-in grid-cols-1 gap-4 duration-300 zoom-in-95 sm:grid-cols-2">
            <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-2 text-[10px] font-bold text-muted-foreground uppercase">
                    Identidad
                </p>
                <div className="divide-y">
                    <SummaryRow label="DNI" value={data.dni} />
                    <SummaryRow
                        label="Nombre"
                        value={`${data.names} ${data.surnames}`}
                    />
                    <SummaryRow label="Email" value={data.email} />
                    <SummaryRow label="Género" value={data.gender} />
                </div>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
                <p className="mb-2 text-[10px] font-bold text-muted-foreground uppercase">
                    Asignación
                </p>
                <div className="divide-y">
                    <SummaryRow
                        label="Rol"
                        value={getLabel(roles, data.role_id)}
                    />
                    <SummaryRow
                        label="Facultad"
                        value={getLabel(faculties, data.faculty_id)}
                    />
                    <SummaryRow
                        label="Escuela"
                        value={schoolName}
                    />
                    <SummaryRow
                        label="Sección"
                        value={sectionName}
                    />
                </div>
            </div>
        </div>
    );
}
