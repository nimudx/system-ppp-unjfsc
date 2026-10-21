// API pública del módulo de supervisión y grupos de práctica.
export { GroupSelector, type GroupOption } from './components/group-selector';
export {
    ModuleSelector,
    type ModuleOption,
} from './components/module-selector';
export { StudentSelectorTable } from './components/student-selector-table';
export { default as SupervisionDetailPanel } from './components/supervision-detail-panel';
export { default as SupervisionTable } from './components/supervision-table';
export {
    useInternshipGroup,
    type InternshipGroup,
} from './hooks/use-internship-group';
export { useStudentManagement } from './hooks/use-student-management';
export { useSupervision } from './hooks/use-supervision';
export type * from './types';
