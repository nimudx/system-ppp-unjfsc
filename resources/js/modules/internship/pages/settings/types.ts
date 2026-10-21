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
