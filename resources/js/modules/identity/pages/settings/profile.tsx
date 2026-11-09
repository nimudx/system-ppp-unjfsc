import { Head } from '@inertiajs/react';
import type { CompanyProfile } from '@/modules/company';
import ProfileHero from '@/modules/identity/components/profile-hero';
import UpdateCompanyProfileForm from '@/modules/identity/components/update-company-profile-form';
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

type Props = {
    mustVerifyEmail: boolean;
    status?: string;
    profileData: PersonProfile | CompanyProfile | null;
    profileType: 'person' | 'company';
};

export default function Profile({ profileData, profileType }: Props) {
    const isCompany = profileType === 'company';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Perfil" />

            <h1 className="sr-only">Configuración del perfil</h1>

            <SettingsLayout>
                {profileData && <ProfileHero profileData={profileData} />}
                <div className="space-y-6">
                    {profileData &&
                        (isCompany ? (
                            <UpdateCompanyProfileForm
                                data={profileData as CompanyProfile}
                            />
                        ) : (
                            <UpdatePersonProfileForm
                                data={profileData as PersonProfile}
                            />
                        ))}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
