import type { z } from 'zod';
import type { DocumentRequirement } from '@/modules/documents/types';
import type { AssignmentRecord } from '@/modules/identity/types';
import type { stepDetailsSchema } from './pages/submission/schemas/detail.schema';

export type PlacementFormValues = z.infer<typeof stepDetailsSchema>;
export type PlacementRecord = PlacementFormValues['placement'] & {
    id: number;
    company: PlacementFormValues['company'];
    internship_type: string;
    origin_type: string;
    approval_status: number;
    comment?: string | null;
    area?: { id: number; name: string };
};
export interface InternshipRecord {
    id: number;
    assignment_id: number;
    internship_type: string;
    internship_step: number;
    approval_status: number;
    grade?: number | null;
}
export interface InternshipStep {
    id: number;
    label: string;
    is_evaluation: boolean;
}
export interface InternshipDetailData {
    assignment: AssignmentRecord;
    placement: PlacementRecord | null;
    internship: InternshipRecord | null;
    phase: 'placement' | 'internship';
    currentStep: number;
    steps: InternshipStep[];
    requirements: DocumentRequirement[];
}
export type InternshipAssignment = AssignmentRecord & {
    placement?: PlacementRecord | null;
    internship?: InternshipRecord | null;
};
