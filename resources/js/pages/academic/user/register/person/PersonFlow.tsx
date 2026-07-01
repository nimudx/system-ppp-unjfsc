import { useState } from 'react';
import { PersonFlowProps, PersonInitialState } from './person.types';
import { getRegistrationSteps } from '../components/steps.config';
import { useForm, usePage } from '@inertiajs/react';
import { personService } from './person.service';
import { toast } from 'sonner';
import { Stepper } from '../components/Stepper';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { RegistrationModeSelector } from '../components/RegistrationModeSelector';

import { MassivePersonInitValues } from './partials/person-massive/step-one/schema';
import { MassiveVStepOne } from './partials/person-massive/step-one/MassiveVStepOne';
import { MassiveSStepTwo } from './partials/person-massive/step-two/MassiveSStepTwo';
import { MassiveRStepThree } from './partials/person-massive/step-three/MassiveRStepThree';

import { PersonInitValues } from './partials/person/step-one/schema';
import { PersonVStepOne } from './partials/person/step-one/PersonVStepOne';
import { PersonSStepThree } from './partials/person/step-three/PersonSStepThree';
import { PersonFStepTwo } from './partials/person/step-two/PersonFStepTwo';

export function PersonFlow({
    roles,
    faculties,
    mode,
}: PersonFlowProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchDni, setSearchDni] = useState('');
    const [currentMode, setCurrentMode] = useState(mode);

    const steps = getRegistrationSteps('persona', currentMode);

    const defaultFacultyId = faculties?.length === 1 ? faculties[0].id.toString() : '';

    // Solo autollenar escuela si hay una única facultad y esa facultad tiene una única escuela
    const defaultSchoolId =
        faculties?.length === 1 && faculties[0].schools?.length === 1
            ? faculties[0].schools[0].id.toString()
            : '';

    // Solo autollenar sección si hay una única escuela disponible
    const defaultSectionId =
        faculties?.length === 1 &&
        faculties[0].schools?.length === 1 &&
        faculties[0].schools[0].sections?.length === 1
            ? faculties[0].schools[0].sections[0].id.toString()
            : '';

    const { data, setData, processing, reset } = useForm<PersonInitialState>({
        role_id: '',
        faculty_id: defaultFacultyId,
        school_id: defaultSchoolId,
        section_id: defaultSectionId,

        email: '',
        dni: '',
        names: '',
        surnames: '',
        gender: 'M',
        user_exists: false,
        user_id: null,
        person_exists: false,
        person_id: null,

        rows: [],
        report: null,
    });

    const handleStepOne = async (values: PersonInitValues) => {
        setIsLoading(true);

        try {
            setData((prev) => ({
                ...prev,
                ...values,
            }));

            const response = await personService.stepOne({
                email: values.email,
                role_id: values.role_id,
                section_id: values.section_id,
            });
            const result = response.data.data;

            toast.success(response.data.message);

            setData((prev) => ({
                ...prev,
                person_exists: result.user_exists,
                user_id: result.user_id ?? null,
                person_id: result.person?.id ?? null,
                names: result.person?.names ?? prev.names,
                surnames: result.person?.surnames ?? prev.surnames,
                dni: result.person?.dni ?? prev.dni,
            }));

            setStep(2);
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ?? 'Error en la solicitud',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleStepOneMassive = (values: MassivePersonInitValues) => {
        setData((prev) => ({
            ...prev,
            ...values,
        }));

        setStep(2);
    };

    const validateSearchDni = async () => {
        if (!searchDni) return toast.error('Ingrese un DNI.');
        setIsLoading(true);
        try {
            const response = await personService.stepTwo({ dni: searchDni });
            const result = response.data.data;
            toast.success(response.data.message);

            setData((prev) => ({
                ...prev,
                dni: searchDni,
                person_exists: result.person_exists,
                person_id: result.person?.id ?? null,
                names: result.person?.names ?? '',
                surnames: result.person?.surnames ?? '',
            }));
            setSearchDni('');
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ?? 'Error al consultar DNI',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleStepTwo = (values: any) => {
        setData((prev: PersonInitialState) => ({
            ...prev,
            ...values,
        }));
        setStep(3);
    };

    const handleSubmit = () => {
        const payload = {
            email: data.email,
            role_id: data.role_id,
            section_id: data.section_id,
            user_id: data.user_id,
            type_user_id: 2,
            person: {
                id: data.person_id,
                dni: data.dni,
                names: data.names,
                surnames: data.surnames,
            },
        };

        personService.store(payload, {
            onSuccess: (res) => {
                const msg = res?.data?.message ?? 'Usuario registrado exitosamente. Se ha enviado el correo de activación.';
                toast.success(msg, { duration: 6000 });
                reset();
                setStep(1);
            },
            onError: (error: any) => {
                toast.error(
                    error.response?.data?.message ?? 'Error en la solicitud',
                );
            },
        });
    };

    const handleSubmitMassive = async () => {
        if (!data.role_id || !data.section_id || data.rows.length === 0) {
            toast.error('Complete la configuración antes de finalizar.');
            return;
        }

        setIsLoading(true);

        // Mapeo flexible para asegurar que Laravel reciba lo que pide StorePersonMassiveRequest
        const sanitizedRows = data.rows.map((row) => ({
            email: row.email || row.Correo || row.correo || row.EMAIL || '',
            dni: row.dni || row.DNI || '',
            names: row.names || row.nombres || row.Nombres || row.NAMES || '',
            surnames:
                row.surnames ||
                row.apellidos ||
                row.Apellidos ||
                row.SURNAMES ||
                '',
        }));

        const payload = {
            role_id: data.role_id,
            section_id: data.section_id,
            rows: sanitizedRows,
        };

        try {
            const response = await personService.storeMassive(payload);
            const result = response.data.data;

            toast.success(response.data.message);

            setData((prev) => ({
                ...prev,
                report: result,
            }));

            setStep(3);
        } catch (error: any) {
            const serverMessage = error.response?.data?.message;
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                toast.error(
                    'Error de validación. Revise los datos del archivo.',
                );
                console.error('Detalle de errores:', validationErrors);
            } else {
                toast.error(serverMessage ?? 'Error al procesar el archivo');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcessComplete = () => {
        setStep(1);
        reset();
    };

    return (
        <div className="space-y-7">
            <div className="overflow-hidden rounded-xl border bg-card p-4 shadow-xs">
                <Stepper currentStep={step} steps={steps} />
            </div>
            <div className="animate-in overflow-hidden rounded-xl border bg-card p-4 shadow-xs duration-300 fade-in">
                {step === 1 && (
                    <div className="space-y-6">
                        {/**
                         * AQUI PONER EL RegistrationModeSelector heredado del padre que responde el cambio de modo
                         */}
                        <RegistrationModeSelector
                            mode={currentMode}
                            setMode={setCurrentMode}
                        />
                        {currentMode === 'individual' && (
                            <PersonVStepOne
                                roles={roles}
                                faculties={faculties}
                                initialValues={data}
                                onSubmit={handleStepOne}
                                isLoading={isLoading}
                            />
                        )}
                        {currentMode === 'masivo' && (
                            <MassiveVStepOne
                                roles={roles}
                                faculties={faculties}
                                initialValues={data}
                                onSubmit={handleStepOneMassive}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                )}
                {step === 2 && (
                    <div>
                        {currentMode === 'individual' && (
                            <PersonFStepTwo
                                initialValues={data}
                                personExists={data.person_exists}
                                searchDni={searchDni}
                                setSearchDni={setSearchDni}
                                onSearch={validateSearchDni}
                                onPrev={() => setStep(1)}
                                onSubmit={handleStepTwo}
                                isLoading={isLoading}
                            />
                        )}
                        {currentMode === 'masivo' && (
                            <div className="space-y-6">
                                <MassiveSStepTwo
                                    data={data}
                                    roles={roles}
                                    faculties={faculties}
                                />
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleSubmitMassive}
                                        disabled={isLoading}
                                    >
                                        {isLoading && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}{' '}
                                        Finalizar y Procesar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-6">
                        {currentMode === 'individual' && (
                            <div>
                                <PersonSStepThree
                                    data={data}
                                    roles={roles}
                                    faculties={faculties}
                                />
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setStep(
                                                currentMode === 'individual'
                                                    ? 2
                                                    : 1,
                                            )
                                        }
                                        className="flex-1"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleSubmit}
                                        disabled={processing}
                                    >
                                        {processing && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Finalizar Registro
                                    </Button>
                                </div>
                            </div>
                        )}
                        {currentMode === 'masivo' && (
                            <MassiveRStepThree
                                report={data.report}
                                onFinish={handleProcessComplete}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
