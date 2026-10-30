import PracticeSubmissionsView, {
    type SupervisorSubmission,
} from '@/modules/internship/components/practice-submissions-view';

export default function PracticeReportsIndex({
    submissions,
}: {
    submissions: SupervisorSubmission[];
}) {
    return <PracticeSubmissionsView kind="report" submissions={submissions} />;
}
