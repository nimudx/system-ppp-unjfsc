/** Nombre de una persona tal como lo envía el backend. */
export interface PersonName {
    names: string;
    surnames: string;
}

/** Usuario mínimo que acompaña a una asignación. */
export interface UserSummary {
    email: string;
    person: PersonName;
}
