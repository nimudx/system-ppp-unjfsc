import { Head } from '@inertiajs/react';
import ProfileHero from '@/modules/identity/components/profile-hero';
import UpdatePersonProfileForm from '@/modules/identity/components/update-person-profile-form';
import type { PersonProfile } from '@/modules/identity/types';
import { edit } from '@/routes/profile';
import AppLayout from '@/shared/layouts/app-layout';
import SettingsLayout from '@/shared/layouts/settings/layout';
import type { BreadcrumbItem } from '@/shared/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Perfil',
        href: edit().url,
    },
];

export default function Profile({
    profileData,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    profileData: PersonProfile;
    profileType: string;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <h1 className="sr-only">Configuración del perfil</h1>

            <SettingsLayout>
                <ProfileHero profileData={profileData} />
                <div className="space-y-6">
                    <UpdatePersonProfileForm data={profileData} />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
