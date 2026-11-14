import { useForm } from '@inertiajs/react';
import { Send, X } from 'lucide-react';
import type { FormEvent } from 'react';
import teacher from '@/routes/academic/jobboard/teacher';
import InputError from '@/shared/components/input-error';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { SectionCard } from '@/shared/components/ui/section-card';
import { Textarea } from '@/shared/components/ui/textarea';
import type { TeacherVacancyDetail } from '../types';
import EligibleStudentSelector from './eligible-student-selector';
import TeacherCandidateList from './teacher-candidate-list';
import VacancyDetailInfo from './vacancy-detail-info';

interface ProposalFormData {
    student_ids: number[];
    note: string;
}

export default function TeacherVacancyDetailPanel({
    vacancy,
    teacherAssignmentId,
    onClose,
    onReload,
}: {
    vacancy: TeacherVacancyDetail;
    teacherAssignmentId: number;
    onClose: () => void;
    onReload: () => void;
}) {
    const { data, setData, post, processing, errors, reset } =
        useForm<ProposalFormData>({
            student_ids: [],
            note: '',
        });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (data.student_ids.length === 0) return;

        post(teacher.propose(vacancy.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onReload();
            },
        });
    };

    const pendingStudents = vacancy.students.filter(
        (student) => !student.already_proposed,
    );

    return (
        <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-muted-foreground">
                    Detalle de la vacante
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Cerrar detalle"
                >
                    <X className="size-4" />
                </Button>
            </div>

            <VacancyDetailInfo vacancy={vacancy} />

            <SectionCard>
                <SectionCard.Header
                    title="Proponer candidatos"
                    description="Solo estudiantes de tu sección y semestre con expediente aprobado."
                />
                <SectionCard.Body className="px-4 py-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <EligibleStudentSelector
                            students={vacancy.students}
                            selectedIds={data.student_ids}
                            onChange={(ids) =>
                                setData('student_ids', ids)
                            }
                        />

                        <InputError message={errors.student_ids} />

                        {pendingStudents.length === 0 &&
                            vacancy.students.length > 0 && (
                                <p className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2 text-xs text-amber-700 dark:text-amber-300">
                                    Todos los estudiantes elegibles ya fueron
                                    propuestos para esta vacante.
                                </p>
                            )}

                        <div className="space-y-2">
                            <Label htmlFor="proposal-note">
                                Nota para el administrador (opcional)
                            </Label>
                            <Textarea
                                id="proposal-note"
                                value={data.note}
                                onChange={(event) =>
                                    setData('note', event.target.value)
                                }
                                rows={3}
                                placeholder="Ej. El estudiante tiene experiencia en atención al cliente y disponibilidad inmediata."
                                aria-invalid={!!errors.note}
                            />
                            <InputError message={errors.note} />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                                {data.student_ids.length === 0
                                    ? 'Selecciona al menos un estudiante.'
                                    : `${data.student_ids.length} estudiante${
                                          data.student_ids.length === 1
                                              ? ''
                                              : 's'
                                      } seleccionado${
                                          data.student_ids.length === 1
                                              ? ''
                                              : 's'
                                      }.`}
                            </p>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={
                                    processing ||
                                    data.student_ids.length === 0
                                }
                            >
                                <Send className="mr-1.5 size-4" />
                                {processing
                                    ? 'Proponiendo...'
                                    : 'Proponer candidatos'}
                            </Button>
                        </div>
                    </form>
                </SectionCard.Body>
            </SectionCard>

            <SectionCard>
                <SectionCard.Header
                    title={`Candidatos propuestos (${vacancy.candidates.length})`}
                    description="El administrador contacta a la empresa y actualiza el estado del seguimiento."
                />
                <SectionCard.Body className="px-4 py-4">
                    <TeacherCandidateList
                        vacancyId={vacancy.id}
                        candidates={vacancy.candidates}
                        teacherAssignmentId={teacherAssignmentId}
                        onReload={onReload}
                    />
                </SectionCard.Body>
            </SectionCard>
        </div>
    );
}
