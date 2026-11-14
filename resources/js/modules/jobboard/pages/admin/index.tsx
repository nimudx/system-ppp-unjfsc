import { Head } from '@inertiajs/react';
import { BriefcaseBusiness, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import admin from '@/routes/academic/jobboard/admin';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import { Badge } from '@/shared/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { useItemDetail } from '@/shared/hooks/use-item-detail';
import AppLayout from '@/shared/layouts/app-layout';
import MasterDetailLayout from '@/shared/layouts/master-detail-layout';
import AdminVacancyDetail from '../../components/admin-vacancy-detail';
import VacancyListTable from '../../components/vacancy-list-table';
import type {
    AdminJobBoardIndexProps,
    AdminVacancyDetail as AdminVacancyDetailData,
} from '../../types';

const PAGE_SIZE = 8;

export default function JobBoardAdminIndex({
    vacancies,
    statuses,
    candidate_statuses,
    schools,
}: AdminJobBoardIndexProps) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);

    const { selectedId, detailData, isLoading, actions } =
        useItemDetail<AdminVacancyDetailData>({
            fetchUrl: (id) => admin.detail(id).url,
            urlQueryKey: 'v',
        });

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return vacancies.filter((vacancy) => {
            const matchesStatus = !status || vacancy.status === status;
            const matchesSearch =
                !term ||
                [
                    vacancy.title,
                    vacancy.area_name,
                    vacancy.location,
                    vacancy.company?.name,
                    vacancy.status_label,
                ]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(term));

            return matchesStatus && matchesSearch;
        });
    }, [vacancies, search, status]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const vacancy =
        detailData && detailData.id === selectedId ? detailData : null;

    const pendingCount = vacancies.filter(
        (item) => item.status === 'pending_review',
    ).length;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Bolsa laboral', href: admin.index().url },
            ]}
        >
            <Head title="Bolsa laboral · Administración" />

            <MasterDetailLayout
                title="Bolsa laboral"
                description="Revisa las vacantes de las empresas y gestiona los candidatos propuestos por los docentes titulares."
                hasSelection={Boolean(selectedId)}
                masterWidthClassName="w-87.5 lg:w-100"
                headerAction={
                    pendingCount > 0 ? (
                        <Badge variant="secondary">
                            {pendingCount} por revisar
                        </Badge>
                    ) : undefined
                }
                toolbar={
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Select
                            value={status || 'all'}
                            onValueChange={(value) => {
                                setStatus(value === 'all' ? '' : value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="h-9 w-44">
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos los estados
                                </SelectItem>
                                {statuses.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <AcademicSearch
                            isAdmin={false}
                            search={search}
                            setSearch={(value) => {
                                setSearch(value);
                                setPage(1);
                            }}
                            placeholder="Buscar vacante o empresa..."
                        />
                    </div>
                }
                master={
                    <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2">
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <VacancyListTable
                                vacancies={pageItems}
                                selectedId={selectedId}
                                onSelect={actions.handleSelect}
                            />
                        </div>

                        <AcademicPagination
                            isAdmin={false}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            localShowing={pageItems.length}
                            localTotal={filtered.length}
                            onLocalPageChange={setPage}
                        />
                    </div>
                }
                detail={
                    selectedId ? (
                        vacancy ? (
                            <AdminVacancyDetail
                                vacancy={vacancy}
                                statuses={candidate_statuses}
                                schools={schools}
                                onClose={actions.handleClose}
                                onReload={() =>
                                    actions.reloadDetail(selectedId)
                                }
                            />
                        ) : (
                            <div className="flex flex-1 items-center justify-center">
                                <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="size-6 animate-spin text-primary" />
                                    {isLoading
                                        ? 'Cargando detalle...'
                                        : 'No se pudo cargar el detalle.'}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-muted-foreground">
                            <BriefcaseBusiness className="size-10 opacity-30" />
                            <p className="text-sm font-medium">
                                Selecciona una vacante para revisarla
                            </p>
                            <p className="max-w-xs text-center text-xs opacity-80">
                                El panel mostrará los datos de la empresa, la
                                revisión y los candidatos propuestos.
                            </p>
                        </div>
                    )
                }
            />
        </AppLayout>
    );
}
