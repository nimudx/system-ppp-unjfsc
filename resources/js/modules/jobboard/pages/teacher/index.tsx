import { Head } from '@inertiajs/react';
import { BriefcaseBusiness, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import teacherRoutes from '@/routes/academic/jobboard/teacher';
import AcademicPagination from '@/shared/components/data-table/academic-pagination';
import AcademicSearch from '@/shared/components/data-table/academic-search';
import { useItemDetail } from '@/shared/hooks/use-item-detail';
import AppLayout from '@/shared/layouts/app-layout';
import MasterDetailLayout from '@/shared/layouts/master-detail-layout';
import TeacherVacancyDetailPanel from '../../components/teacher-vacancy-detail';
import VacancyListTable from '../../components/vacancy-list-table';
import type {
    TeacherJobBoardIndexProps,
    TeacherVacancyDetail,
} from '../../types';

const PAGE_SIZE = 8;

export default function JobBoardTeacherIndex({
    vacancies,
    teacher,
}: TeacherJobBoardIndexProps) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { selectedId, detailData, isLoading, actions } =
        useItemDetail<TeacherVacancyDetail>({
            fetchUrl: (id) => teacherRoutes.detail(id).url,
            urlQueryKey: 'v',
        });

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return vacancies.filter((vacancy) => {
            if (!term) return true;

            return [
                vacancy.title,
                vacancy.area_name,
                vacancy.location,
                vacancy.company?.name,
            ]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term));
        });
    }, [vacancies, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const vacancy =
        detailData && detailData.id === selectedId ? detailData : null;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Bolsa laboral', href: teacherRoutes.index().url },
            ]}
        >
            <Head title="Bolsa laboral · Docente titular" />

            <MasterDetailLayout
                title="Bolsa laboral"
                description={`Vacantes publicadas para ${
                    teacher.school ?? 'tu escuela'
                } · ${teacher.section ?? 'sin sección'} · ${
                    teacher.semester ?? 'semestre activo'
                }.`}
                hasSelection={Boolean(selectedId)}
                masterWidthClassName="w-87.5 lg:w-95"
                toolbar={
                    <div className="flex flex-wrap items-center justify-end gap-2">
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
                            <TeacherVacancyDetailPanel
                                vacancy={vacancy}
                                teacherAssignmentId={teacher.assignment_id}
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
                                Selecciona una vacante publicada
                            </p>
                            <p className="max-w-xs text-center text-xs opacity-80">
                                Revisa el detalle y propone estudiantes de tu
                                sección al administrador.
                            </p>
                        </div>
                    )
                }
            />
        </AppLayout>
    );
}
