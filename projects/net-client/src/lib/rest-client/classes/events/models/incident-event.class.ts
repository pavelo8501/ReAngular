import { IncidentCode } from "../enums/incident-code.enum";

export class IncidentEvent{

    constructor(public incidentCode: IncidentCode, public payload?: any){

    }
}