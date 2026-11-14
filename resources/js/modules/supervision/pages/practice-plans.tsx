import PracticeSubmissionsView, {
    type SupervisorSubmission,
} from '@/modules/supervision/components/practice-submissions-view';

export default function PracticePlansIndex({
    submissions,
}: {
    submissions: SupervisorSubmission[];
}) {
    return <PracticeSubmissionsView kind="plan" submissions={submissions} />;
}
