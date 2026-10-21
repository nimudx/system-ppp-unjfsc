import {
    UserPlus,
    ArrowRightLeft,
    UserMinus,
    Loader2,
    Info,
} from 'lucide-react';
import type { InternshipGroup } from '@/modules/supervision/hooks/use-internship-group';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SectionCard } from '@/shared/components/ui/section-card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/shared/components/ui/tabs';
import { StudentSelectorTable } from '../../../../components/student-selector-table';
import { useStudentManagement } from '../../../../hooks/use-student-management';
interface StudentManagementTabsProps {
    group: InternshipGroup;
    allGroups: InternshipGroup[];
}

export default function StudentManagementTabs({
    group,
    allGroups,
}: StudentManagementTabsProps) {
    const {
        loading,
        isSubmitting,
        availableStudents,
        groupStudents,
        selectedStudents,
        setSelectedStudents,
        targetGroupId,
        setTargetGroupId,
        currentTab,
        setCurrentTab,
        otherGroups,
        actions,
    } = useStudentManagement({ group, allGroups });

    return (
        <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="flex h-full min-h-125 w-full flex-col"
        >
            <SectionCard className="flex-1">
                <SectionCard.Header>
                    <TabsList className="grid w-full shrink-0 grid-cols-3 p-0">
                        <TabsTrigger
                            value="add"
                            className="text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                        >
                            <UserPlus className="size-4" />
                            <span className="font-bold tracking-tighter uppercase">
                                Añadir
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="move"
                            className="text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                        >
                            <ArrowRightLeft className="size-4" />
                            <span className="font-bold tracking-tighter uppercase">
                                Mover
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="detach"
                            className="text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
                        >
                            <UserMinus className="size-4" />
                            <span className="font-bold tracking-tighter uppercase">
                                Quitar
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </SectionCard.Header>
                <SectionCard.Body>
                    <div className="scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent flex-1 overflow-auto p-1">
                        {/* AÑADIR ESTUDIANTES */}
                        <TabsContent
                            value="add"
                            className="mt-0 animate-in space-y-6 duration-300 outline-none fade-in"
                        >
                            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                                <Info className="mt-0.5 size-4 shrink-0 text-blue-500" />
                                <p className="text-[11px] leading-relaxed font-medium text-blue-700">
                                    Selecciona a los estudiantes registrados en{' '}
                                    <strong>{group.section.name}</strong> que
                                    aún no han sido asignados.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="px-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        Estudiantes Disponibles
                                    </h4>
                                    {selectedStudents.length > 0 && (
                                        <Badge className="bg-primary font-bold hover:bg-primary">
                                            {selectedStudents.length}{' '}
                                            Seleccionados
                                        </Badge>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="size-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <StudentSelectorTable
                                        students={availableStudents}
                                        selectedIds={selectedStudents}
                                        onSelectionChange={setSelectedStudents}
                                        colorScheme="primary"
                                        compact={true}
                                        emptyMessage="No hay estudiantes disponibles"
                                    />
                                )}
                            </div>
                            <div className="flex items-center justify-center">
                                <Button
                                    onClick={actions.handleAdd}
                                    className=""
                                    disabled={
                                        selectedStudents.length === 0 ||
                                        isSubmitting
                                    }
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-2 size-4" />
                                    )}
                                    Asignar Selección{' '}
                                    {selectedStudents.length > 0
                                        ? `(${selectedStudents.length})`
                                        : ''}
                                </Button>
                            </div>
                        </TabsContent>

                        {/* MOVER ESTUDIANTES */}
                        <TabsContent
                            value="move"
                            className="mt-0 animate-in space-y-6"
                        >
                            <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                                <ArrowRightLeft className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                <p className="text-[11px] leading-relaxed font-medium text-amber-700">
                                    Transfiere estudiantes del grupo actual
                                    hacia otro grupo activo en la misma sección.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="px-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        Grupo de Destino
                                    </h4>
                                    <Select
                                        value={targetGroupId}
                                        onValueChange={setTargetGroupId}
                                    >
                                        <SelectTrigger className="h-10 w-full rounded-lg">
                                            <SelectValue placeholder="Seleccionar grupo de destino..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {otherGroups.length > 0 ? (
                                                otherGroups.map((g) => (
                                                    <SelectItem
                                                        key={g.id}
                                                        value={g.id.toString()}
                                                        className="text-xs font-medium"
                                                    >
                                                        {g.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-[10px] tracking-widest text-muted-foreground uppercase italic">
                                                    No hay otros grupos
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="px-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                            Estudiantes en {group.name}
                                        </h4>
                                        {selectedStudents.length > 0 && (
                                            <Badge className="bg-amber-500 font-bold hover:bg-amber-500">
                                                {selectedStudents.length} Para
                                                Mover
                                            </Badge>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="size-6 animate-spin text-amber-500" />
                                        </div>
                                    ) : (
                                        <StudentSelectorTable
                                            students={groupStudents}
                                            selectedIds={selectedStudents}
                                            onSelectionChange={
                                                setSelectedStudents
                                            }
                                            colorScheme="amber"
                                            maxHeight="250px"
                                            compact={true}
                                            emptyMessage="Grupo sin estudiantes"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <Button
                                    onClick={actions.handleMove}
                                    className="bg-amber-500 hover:bg-amber-600"
                                    disabled={
                                        selectedStudents.length === 0 ||
                                        !targetGroupId ||
                                        isSubmitting
                                    }
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <ArrowRightLeft className="mr-2 size-4" />
                                    )}
                                    Mover Selección{' '}
                                    {selectedStudents.length > 0
                                        ? `(${selectedStudents.length})`
                                        : ''}
                                </Button>
                            </div>
                        </TabsContent>

                        {/* QUITAR ESTUDIANTES */}
                        <TabsContent
                            value="detach"
                            className="mt-0 animate-in space-y-6"
                        >
                            <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                                <UserMinus className="mt-0.5 size-4 shrink-0 text-red-500" />
                                <p className="text-[11px] leading-relaxed font-medium text-red-700">
                                    Retira a los estudiantes seleccionados del
                                    grupo actual. Quedarán sin grupo.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="px-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                        Listado de Estudiantes
                                    </h4>
                                    {selectedStudents.length > 0 && (
                                        <Badge className="bg-red-500 font-bold hover:bg-red-500">
                                            {selectedStudents.length}{' '}
                                            Seleccionados
                                        </Badge>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="size-6 animate-spin text-red-500" />
                                    </div>
                                ) : (
                                    <StudentSelectorTable
                                        students={groupStudents}
                                        selectedIds={selectedStudents}
                                        onSelectionChange={setSelectedStudents}
                                        colorScheme="red"
                                        compact={true}
                                        emptyMessage="No hay estudiantes"
                                    />
                                )}
                            </div>

                            <div className="flex items-center justify-center">
                                <Button
                                    onClick={actions.handleDetach}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={
                                        selectedStudents.length === 0 ||
                                        isSubmitting
                                    }
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                        <UserMinus className="mr-2 size-4" />
                                    )}
                                    Retirar Selección{' '}
                                    {selectedStudents.length > 0
                                        ? `(${selectedStudents.length})`
                                        : ''}
                                </Button>
                            </div>
                        </TabsContent>
                    </div>
                </SectionCard.Body>
            </SectionCard>
        </Tabs>
    );
}
