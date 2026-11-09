// UI de carga y revisión de documentos que usan dossier, internship y supervision.
export { AlertHelp } from './components/alert-help';
export { DetailHeader } from './components/detail-header';
export { default as DocumentViewer } from './components/document-viewer';
export {
    default as FileHistory,
    type HistoryRecord,
} from './components/file-history';
export { default as FilePreview } from './components/file-preview';
export {
    default as RequirementsList,
    getIcon,
    type RequirementItem,
    type RequirementsListProps,
} from './components/requirements-list';
export {
    default as SubmissionForm,
    type CleanSubmissionFormProps,
} from './components/submission-form';
export { SubmissionPanel } from './components/submission-panel';
export { default as UploadZone } from './components/upload-zone';
export { ValidationForm } from './components/validation-form';
export {
    ValidationPanel,
    type ValidationPanelProps,
} from './components/validation-panel';
export {
    buildDossierHistory,
    DocumentHistoryPanel,
    DossierProgress,
    enter,
    formatDateTime,
    getStatusMeta,
    HISTORY_PREVIEW,
    MAX_FILE_SIZE,
    PendingActionsCard,
    resolveStatus,
    type DossierHistoryRecord,
} from './components/dossier-shared';
export {
    DOCUMENT_STATUS,
    DOCUMENT_STATUS_BADGE,
    DOCUMENT_STATUS_META,
    getDocumentStatusMeta,
    resolveDocumentStatus,
    type DocumentStatusMeta,
} from './status';
export type * from './types';
