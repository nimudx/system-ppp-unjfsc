import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type {
    InternshipGroup,
    Assignment,
} from '@/modules/supervision/hooks/use-internship-group';
import { useConfigTable } from '@/shared/hooks/use-config-table';

interface UseGroupSupervisionOptions {
    initialGroups: InternshipGroup[];
}

export function useGroupSupervision({
    initialGroups,
}: UseGroupSupervisionOptions) {
    // 1. Selector de grupo & deep link (?g=123)
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(
        () => {
            const params = new URLSearchParams(window.location.search);
            const g = params.get('g');
            return g ? parseInt(g, 10) : null;
        },
    );

    const [students, setStudents] = useState<Assignment[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
        null,
    );

    // 2. Motor para buscar/filtrar la lista de grupos del supervisor
    const tableManager = useConfigTable<InternshipGroup>({
        endpoint: '',
        initialData: initialGroups,
        isAdmin: false,
        pageSize: 10,
        onLocalSearch: (group, term) => {
            return (
                group.name.toLowerCase().includes(term) ||
                (group.section?.name ?? '').toLowerCase().includes(term) ||
                (group.section?.school?.name ?? '').toLowerCase().includes(term)
            );
        },
    });

    // 3. Sincronización activa con la URL (?g=)
    useEffect(() => {
        const url = new URL(window.location.href);
        if (selectedGroupId) {
            url.searchParams.set('g', selectedGroupId.toString());
        } else {
            url.searchParams.delete('g');
        }
        window.history.replaceState({}, '', url.toString());
    }, [selectedGroupId]);

    // 4. Cargar estudiantes del grupo seleccionado
    useEffect(() => {
        if (!selectedGroupId) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            try {
                setIsLoadingStudents(true);
                const response = await axios.get(
                    `/groups/api/supervision/${selectedGroupId}/students`,
                );
                setStudents(response.data.students || []);
            } catch (error) {
                toast.error('Error al cargar los estudiantes del grupo.');
                console.error(error);
            } finally {
                setIsLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedGroupId]);

    const handleSelectGroup = (id: number | null) => {
        setSelectedGroupId(id);
        setSelectedStudentId(null); // Limpiar selección de alumno al cambiar de grupo
    };

    const selectedGroup = initialGroups.find((g) => g.id === selectedGroupId);
    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    return {
        tableManager,
        selectedGroupId,
        selectedGroup,
        students,
        isLoadingStudents,
        selectedStudentId,
        selectedStudent,
        setSelectedStudentId,
        handleSelectGroup,
    };
}
