import { Head } from '@inertiajs/react';
import { useState } from 'react';
import type { Faculty } from '@/modules/academic';
import type { RoleOption } from '@/modules/registration/types';
import Heading from '@/shared/components/heading';
import AppLayout from '@/shared/layouts/app-layout';
import { type BreadcrumbItem } from '@/shared/types';

// Componentes desacoplados de UI
import { PersonFlow } from '../../components/person/person-flow';
import { SidebarInfo } from '../../components/register/sidebar-info';

interface PageProps {
    roles: RoleOption[];
    faculties: Faculty[];
}

export default function UserRegistration(props: PageProps) {
    const [mode] = useState<'individual' | 'masivo'>('individual');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: '#' },
        { title: 'Registro', href: '#' },
        { title: 'Persona', href: '#' },
    ];

    if (mode) {
        breadcrumbs.push({
            title: mode === 'individual' ? 'Individual' : 'Masivo',
            href: '#',
        });
    }

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
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div>
                            <PersonFlow {...props} mode={mode} />
                        </div>
                    </div>

                    <SidebarInfo mode={mode || 'individual'} />
                </div>
            </div>
        </AppLayout>
    );
}
