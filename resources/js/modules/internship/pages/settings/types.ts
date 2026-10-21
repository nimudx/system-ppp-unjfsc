export interface Document {
    name: string;
    code: string;
}

export interface RequirementDocs {
    development: Document[];
    validation: Document[];
}

export interface WorkflowStage {
    id: string;
    step: number;
    name: string;
    is_evaluation: boolean;
    required_docs: RequirementDocs;
}
