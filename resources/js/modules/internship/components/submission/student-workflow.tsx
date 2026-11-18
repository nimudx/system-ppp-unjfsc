import { Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    Callout,
    CompanyDataCard,
    CompanySubmission,
    LockedStepCard,
    RequestStatusPanel,
    workflow,
    type CompanyRequest,
} from '@/modules/company';
import internship from '@/routes/academic/internship';
import { Button } from '@/shared/components/ui/button';
import { WorkflowErrors } from '@/shared/components/workflow-ui';

import type { PlacementRecord } from '../../types';
import PracticeForm from './practice-form';

export default function StudentWorkflow({
    current,
    loading,
    error,
    reload,
    placement,
    type,
    origin,
}: {
    current: CompanyRequest | null;
    loading: boolean;
    error: string;
    reload: () => Promise<void>;
    placement: PlacementRecord | null;
    type: string;
    origin: string;
}) {
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<unknown>(null);
    const resend = async () => {
        if (!current) return;
        setSending(true);
        setSendError(null);
        try {
            await workflow.resend(current.id);
            toast.success('Correo encolado para envío.');
            await reload();
        } catch (cause) {
            setSendError(cause);
        } finally {
            setSending(false);
        }
    };
    if (loading)
        return (
            <p role="status" className="p-4 text-sm">
                Consultando tu solicitud…
            </p>
        );
    if (error)
        return (
            <div className="space-y-3">
                <WorkflowErrors error={error} />
                <Button onClick={() => void reload()}>
                    Volver a consultar
                </Button>
            </div>
        );
    return (
        <div className="space-y-7 p-1">
            {current && current.state !== 'accepted' && (
                <RequestStatusPanel
                    current={current}
                    onReload={reload}
                    onResend={resend}
                    sending={sending}
                    sendError={sendError}
                />
            )}
            {current?.state === 'accepted' && (
                <Callout tone="success" icon={CheckCircle2}>
                    <p className="font-semibold">
                        Estudiante aceptado por la empresa
                    </p>
                    <p className="mt-1">
                        {current.can_upload_documents
                            ? 'Tus datos de jefe inmediato y de prácticas están registrados.'
                            : 'Completa los datos de tu jefe inmediato y de las prácticas pre-profesionales. Sin estos datos no podrás pasar a Formalización, Revisión de prácticas ni Anexos del informe.'}
                    </p>
                    {current.can_upload_documents && (
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="mt-3"
                        >
                            <Link href={internship.formalization.url()}>
                                Ir a Formalización
                            </Link>
                        </Button>
                    )}
                </Callout>
            )}
            {!current || current.can_resubmit ? (
                <CompanySubmission
                    key={`${current?.id ?? 'new'}-${current?.state ?? ''}`}
                    current={current}
                    onSaved={reload}
                />
            ) : (
                <CompanyDataCard current={current} />
            )}
            {current?.can_register_practice ? (
                <PracticeForm
                    key={placement?.id ?? 'new'}
                    companyId={current.company_id}
                    placement={placement}
                    type={type}
                    origin={origin}
                    onSaved={reload}
                />
            ) : (
                <div className="space-y-5">
                    <LockedStepCard
                        title="2. Datos del Jefe Inmediato"
                        description="Nombre, cargo y datos de contacto de quien supervisará tus prácticas."
                    />
                    <LockedStepCard
                        title="3. Datos de las Prácticas Pre-Profesionales"
                        description="Área, cargo y fechas estimadas de tu práctica."
                    />
                    <p className="text-sm text-muted-foreground">
                        Estas secciones y la carga de archivos se habilitarán
                        cuando la empresa acepte al estudiante.
                    </p>
                </div>
            )}
        </div>
    );
}
