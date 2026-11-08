import { RequirementsList, AlertHelp } from '@/modules/documents';
import type { DocumentRequirement } from '@/modules/documents';

interface RequirementListPanelProps {
    requirements: DocumentRequirement[];
    selectedType: number;
    onSelectType: (idx: number) => void;
    previewEnabled: boolean;
    onTogglePreview: () => void;
}

export function RequirementListPanel({
    requirements,
    selectedType,
    onSelectType,
    previewEnabled,
    onTogglePreview,
}: RequirementListPanelProps) {
    return (
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64 xl:w-72">
            <RequirementsList
                requirements={requirements}
                selectedType={selectedType}
                onSelectType={onSelectType}
                previewEnabled={previewEnabled}
                onTogglePreview={onTogglePreview}
            />
            <AlertHelp />
        </div>
    );
}
