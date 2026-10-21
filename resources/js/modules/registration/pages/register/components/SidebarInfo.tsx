export function SidebarInfo({ mode }: { mode: string }) {
    return (
        <div className="space-y-6">
            {/* Tarjeta de Guía */}
            <div className="rounded-xl border bg-card p-4 shadow-xs">
                <p className="mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Guía de Registro
                </p>
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            1
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Defina el rol y la ubicación académica
                            (Facultad/Escuela) de los usuarios.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            2
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            {mode === 'individual'
                                ? 'Valide la identidad mediante DNI o RUC para cargar datos automáticamente.'
                                : 'Prepare su archivo CSV siguiendo el formato establecido por el sistema.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tarjeta de Recursos disponibles */}
            <div className="rounded-xl border bg-card p-4 shadow-xs">
                <p className="mb-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Recursos disponibles
                </p>
                <div className="space-y-3">
                    {mode === 'masivo' ? (
                        <div className="flex items-start gap-3">
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            <div>
                                <p className="text-xs font-semibold">
                                    Carga Masiva · Ing. Sistemas
                                </p>
                                <p className="text-[10px] text-nowrap text-muted-foreground">
                                    Hace 2 horas · 45 personas
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                            <div>
                                <p className="text-xs font-semibold">
                                    Sin recursos
                                </p>
                                <p className="text-[10px] text-nowrap text-muted-foreground">
                                    No hay recursos disponibles
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
