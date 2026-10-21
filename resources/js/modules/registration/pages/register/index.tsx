import { Head } from '@inertiajs/react';
import { useState } from 'react';
import type { Faculty } from '@/modules/academic';
import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { type BreadcrumbItem } from "@/shared/types";

// Layouts & UI Base

// Componentes Desacoplados de UI
import { SidebarInfo } from './components/SidebarInfo';
import { ToggleGroup } from './components/ToggleGroup';

// Flujos (Inyectados)
import { PersonFlow } from './person/PersonFlow';


interface PageProps {
    roles: any[];
    faculties: Faculty[];
}

export default function UserRegistration(props: PageProps) {
    const [entityType, setEntityType] = useState<'persona' | 'empresa'>('persona');
    const [mode, setMode] = useState<'individual' | 'masivo'>('individual');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: '#' },
        { title: 'Registro', href: '#' },
        { title: entityType === 'persona' ? 'Persona' : 'Empresa', href: '#' },
    ];

    if (mode) {
        breadcrumbs.push({ title: mode === 'individual' ? 'Individual' : 'Masivo', href: '#' });
    }

    const handleEntityChange = (type: 'persona' | 'empresa') => {
        setEntityType(type);
        setMode('individual'); // Reiniciamos el modo al cambiar de tipo
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro de Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-8 p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <Heading
                        variant="small"
                        title="Registro de Usuarios"
                        description="Gestione la incorporación de nuevas entidades al sistema."
                    />
                    <ToggleGroup
                        selectedCode={entityType}
                        onChange={handleEntityChange}
                        options={[
                            { code: 'persona', title: 'Persona' },
                            { code: 'empresa', title: 'Empresa' }
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div>

                            {entityType === 'persona' && (
                                <PersonFlow {...props} mode={mode} onBack={() => { }} />
                            )}

                            {entityType === 'empresa' && (
                                <div className="p-12 text-center text-muted-foreground italic">
                                    Flujo de Empresa en construcción...
                                </div>
                            )}
                        </div>
                    </div>

                    <SidebarInfo mode={mode || 'individual'} />
                </div>
            </div>
        </AppLayout>
    );
}
