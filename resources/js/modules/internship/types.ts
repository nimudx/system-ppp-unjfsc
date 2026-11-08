import type { z } from 'zod';
import type { DocumentRequirement } from '@/modules/documents';
import type { AssignmentRecord } from '@/modules/identity';
import type { stepDetailsSchema } from './schemas/detail.schema';

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

export type Document = {
    name: string;
    code: string;
};

export type RequirementDocs = {
    development: Document[];
    validation: Document[];
};

export type WorkflowStage = {
    id: string;
    step: number;
    name: string;
    is_evaluation: boolean;
    required_docs: RequirementDocs;
};
