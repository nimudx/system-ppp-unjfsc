import { Head, Link } from '@inertiajs/react';
import { Button } from '@/shared/components/ui/button';
import AppLayout from '@/shared/layouts/app-layout';

// Compatibility for an already-open tab. The server redirects this former route.
export default function StudentRegistration() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Pasantía', href: '/internship' }]}>
            <Head title="Pasantía" />
            <div className="space-y-4 p-6">
                <p>
                    El registro de empresa y el seguimiento de tu solicitud se
                    realizan en Pasantía.
                </p>
                <Button asChild>
                    <Link href="/internship">Ir a Pasantía</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
