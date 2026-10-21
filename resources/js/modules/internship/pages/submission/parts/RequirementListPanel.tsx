import { AlertCircle } from "lucide-react";
import { RequirementsList, AlertHelp } from '@/modules/documents';

interface RequirementListPanelProps {
    requirements: any[];
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
    onTogglePreview
}: RequirementListPanelProps) {
    return (
        <div className="w-full lg:w-64 xl:w-72 flex flex-col gap-4 shrink-0">
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
