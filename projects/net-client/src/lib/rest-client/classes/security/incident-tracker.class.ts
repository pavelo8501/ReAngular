
import { AuthIncident } from "./incident.enum";


export class AuthIncidentTracker {

    private incidentRecords: { method: string, endpoint: string, incident: AuthIncident; timestamp: number }[] = [];

    onMaxPrefaileRetries?: (incidents: object[]) => void
    onMaxRetries?: (incidents: object[]) => void

    constructor(
        private readonly maxRetries = 3,
        private readonly maxPrefaileRetries = 1,
        private onNewIncident : (incident:{ method: string, endpoint: string, incident: AuthIncident; timestamp: number }) => void
    ) {

    }

    lastIncident: AuthIncident | undefined = undefined

    private newIncident(incidentRec : { method: string, endpoint: string, incident: AuthIncident; timestamp: number }){
        this.incidentRecords.push(incidentRec)
        this.lastIncident = incidentRec.incident
      //  this.onNewIncident(incidentRec)
    }

    private incidentsControl(incident: AuthIncident) {

        let filterd = this.incidentRecords.filter(x => x.incident == incident)
        switch (incident) {

            case AuthIncident.PRE_FAILED_CALL:
                if (filterd.length > this.maxPrefaileRetries) {
                    this.onMaxPrefaileRetries?.(filterd)
                }
                break
            case AuthIncident.SERVER_INVALIDATED:
                if (filterd.length > this.maxRetries) {
                    this.onMaxPrefaileRetries?.(filterd)
                }
                break
        }
    }

    registerIncident(method: string, endpoint: string, incident: AuthIncident): void {
        console.warn(`[Auth Incident] ${incident} at ${new Date().toISOString()}`);

        this.newIncident({ method: method, endpoint: endpoint, incident, timestamp: Date.now() })
        this.incidentsControl(incident)
    }

    onHasReachedRetryLimit(callback?: (reached: boolean) => void): boolean {
        let result = false
        return result
    }

    resetRetries(resetIncident: AuthIncident): void {
        this.incidentRecords = this.incidentRecords.filter(x => x.incident != resetIncident)
    }

    getIncidents(): { incident: AuthIncident; timestamp: number }[] {
        return this.incidentRecords;
    }
}