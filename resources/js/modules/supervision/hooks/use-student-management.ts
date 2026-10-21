import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import groups from '@/routes/academic/groups';

interface UseStudentManagementProps {
    group: any;
    allGroups: any[];
}

export function useStudentManagement({
    group,
    allGroups,
}: UseStudentManagementProps) {
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableStudents, setAvailableStudents] = useState<any[]>([]);
    const [groupStudents, setGroupStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [targetGroupId, setTargetGroupId] = useState<string>('');
    const [currentTab, setCurrentTab] = useState('add');

    // --- CARGA DE DATOS ---
    const fetchAvailableStudents = useCallback(async () => {
        if (!group?.section?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(
                groups.api.students.url(group.section.id),
            );
            setAvailableStudents(response.data.students || []);
        } catch (error) {
            toast.error('No se pudieron cargar los estudiantes disponibles');
        } finally {
            setLoading(false);
        }
    }, [group?.section?.id]);

    const fetchGroupStudents = useCallback(async () => {
        if (!group?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(
                groups.api.group_students.url(group.id),
            );
            setGroupStudents(response.data.students || []);
        } catch (error) {
            toast.error('No se pudieron cargar los estudiantes del grupo');
        } finally {
            setLoading(false);
        }
    }, [group?.id]);

    // --- ACCIONES ---
    const handleAdd = useCallback(() => {
        setIsSubmitting(true);
        router.post(
            groups.attach(group.id).url,
            {
                student_assignment_ids: selectedStudents,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStudents([]);
                    fetchAvailableStudents();
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    }, [group.id, selectedStudents, fetchAvailableStudents]);

    const handleDetach = useCallback(() => {
        setIsSubmitting(true);
        router.post(
            groups.detach(group.id).url,
            {
                student_assignment_ids: selectedStudents,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStudents([]);
                    fetchGroupStudents();
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    }, [group.id, selectedStudents, fetchGroupStudents]);

    const handleMove = useCallback(() => {
        if (!targetGroupId) return;
        setIsSubmitting(true);
        router.post(
            groups.move(group.id).url,
            {
                target_group_id: targetGroupId,
                student_assignment_ids: selectedStudents,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedStudents([]);
                    setTargetGroupId('');
                    fetchGroupStudents();
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    }, [group.id, targetGroupId, selectedStudents, fetchGroupStudents]);

    // Limpiar y Recargar al cambiar de tab o grupo
    useEffect(() => {
        setSelectedStudents([]);
        setTargetGroupId('');

        if (group?.id) {
            if (currentTab === 'add') {
                fetchAvailableStudents();
            } else {
                fetchGroupStudents();
            }
        }
    }, [group?.id, currentTab, fetchAvailableStudents, fetchGroupStudents]);

    // Otros grupos de la misma sección para mover
    const otherGroups = useMemo(
        () =>
            allGroups.filter(
                (g) => g.id !== group.id && g.section.id === group.section.id,
            ),
        [allGroups, group],
    );

    return {
        // Estado
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

        // Acciones
        actions: {
            handleAdd,
            handleDetach,
            handleMove,
            refresh:
                currentTab === 'add'
                    ? fetchAvailableStudents
                    : fetchGroupStudents,
        },
    };
}
