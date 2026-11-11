import { Head, Link, router } from '@inertiajs/react';
import { BriefcaseBusiness, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import jobboard from '@/routes/company/jobboard';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import EmptyState from '@/shared/components/empty-state';
import Heading from '@/shared/components/heading';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import { useConfigTable } from '@/shared/hooks/use-config-table';
import AppLayout from '@/shared/layouts/app-layout';
import CloseVacancyDialog from '../../components/close-vacancy-dialog';
import CompanyVacancyCard from '../../components/company-vacancy-card';
import type {
    CompanyJobBoardIndexProps,
    VacancyCloseReason,
    VacancyDetail,
} from '../../types';

export default function CompanyJobBoardIndex({
    vacancies,
    company,
}: CompanyJobBoardIndexProps) {
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [vacancyToClose, setVacancyToClose] =
        useState<VacancyDetail | null>(null);
    const [highlightId] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;

        const value = Number(
            new URLSearchParams(window.location.search).get('v'),
        );

        return Number.isSafeInteger(value) && value > 0 ? value : null;
    });

    const {
        displayData,
        allLocalFiltered,
        search,
        setSearch,
        localPage,
        setLocalPage,
        localTotalPages,
    } = useConfigTable<VacancyDetail>({
        endpoint: '',
        initialData: vacancies,
        isAdmin: false,
        pageSize: 6,
        onLocalSearch: (vacancy, term) =>
            vacancy.title.toLowerCase().includes(term) ||
            (vacancy.area_name ?? '').toLowerCase().includes(term) ||
            (vacancy.location ?? '').toLowerCase().includes(term) ||
            vacancy.status_label.toLowerCase().includes(term),
    });

    useEffect(() => {
        if (!highlightId) return;

        const element = document.getElementById(`vacancy-${highlightId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [highlightId]);

    const submitVacancy = (vacancy: VacancyDetail) => {
        setProcessingId(vacancy.id);

        router.post(
            jobboard.submit(vacancy.id).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const closeVacancy = (reason: VacancyCloseReason) => {
        if (!vacancyToClose) return;

        setProcessingId(vacancyToClose.id);

        router.post(
            jobboard.close(vacancyToClose.id).url,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () => setVacancyToClose(null),
                onFinish: () => setProcessingId(null),
            },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Bolsa laboral', href: jobboard.index().url },
            ]}
        >
            <Head title="Bolsa laboral" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <Heading
                            variant="small"
                            title="Bolsa laboral"
                            description={`Vacantes publicadas por ${company.name}.`}
                        />
                        <p className="text-xs text-muted-foreground">
                            RUC: {company.ruc || 'No registrado'}
                        </p>
                    </div>

                    <Button asChild className="text-sm font-semibold shadow-sm">
                        <Link href={jobboard.create().url}>
                            <Plus className="mr-2 size-4" />
                            Nueva vacante
                        </Link>
                    </Button>
                </div>

                {vacancies.length === 0 ? (
                    <SectionCard>
                        <SectionCard.Body className="px-6 py-14">
                            <EmptyState
                                icon={BriefcaseBusiness}
                                title="Aún no has publicado vacantes"
                                description="Crea la primera vacante y envíala a revisión para que los docentes titulares puedan proponer candidatos."
                            >
                                <Button asChild className="mt-3">
                                    <Link href={jobboard.create().url}>
                                        <Plus className="mr-2 size-4" />
                                        Publicar mi primera vacante
                                    </Link>
                                </Button>
                            </EmptyState>
                        </SectionCard.Body>
                    </SectionCard>
                ) : (
                    <>
                        <AcademicSearch
                            isAdmin={false}
                            search={search}
                            setSearch={setSearch}
                            placeholder="Buscar por título, área, ubicación o estado..."
                        />

                        <div className="space-y-4">
                            {displayData.map((vacancy) => (
                                <CompanyVacancyCard
                                    key={vacancy.id}
                                    vacancy={vacancy}
                                    highlighted={highlightId === vacancy.id}
                                    processing={processingId === vacancy.id}
                                    onSubmit={submitVacancy}
                                    onClose={setVacancyToClose}
                                />
                            ))}

                            {displayData.length === 0 && (
                                <SectionCard>
                                    <SectionCard.Body className="py-10">
                                        <EmptyState
                                            icon={BriefcaseBusiness}
                                            title="No hay vacantes que coincidan con la búsqueda"
                                            description="Prueba con otro término."
                                        />
                                    </SectionCard.Body>
                                </SectionCard>
                            )}
                        </div>

                        <AcademicPagination
                            isAdmin={false}
                            currentPage={localPage}
                            totalPages={localTotalPages}
                            localShowing={displayData.length}
                            localTotal={allLocalFiltered.length}
                            onLocalPageChange={setLocalPage}
                        />
                    </>
                )}
            </div>

            <CloseVacancyDialog
                vacancy={vacancyToClose}
                open={vacancyToClose !== null}
                onOpenChange={(open) => {
                    if (!open) setVacancyToClose(null);
                }}
                onConfirm={closeVacancy}
                processing={
                    vacancyToClose !== null &&
                    processingId === vacancyToClose.id
                }
            />
        </AppLayout>
    );
}
