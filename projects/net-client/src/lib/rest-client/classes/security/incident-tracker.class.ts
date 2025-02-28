import { CommonRestAsset } from "../rest-assets/rest-common.asset";
import { AuthIncident } from "./incident.enum";


export class AuthIncidentTracker {

    private incidents: { method: string, endpoint: string, incident: AuthIncident; timestamp: number }[] = [];

    onMaxPrefaileRetries?: (incidents: object[]) => void
    onMaxRetries?: (incidents: object[]) => void

    constructor(
        private readonly maxRetries = 3,
        private readonly maxPrefaileRetries = 1
    ) {

    }

    lastIncident: AuthIncident | undefined = undefined

    private incidentsControl(incident: AuthIncident) {

        let filterd = this.incidents.filter(x => x.incident == incident)
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
        this.incidents.push({ method: method, endpoint: endpoint, incident, timestamp: Date.now() });

        this.incidentsControl(incident)
        this.lastIncident = incident
    }


    onHasReachedRetryLimit(callback?: (reached: boolean) => void): boolean {
        let result = false
        return result
    }

    resetRetries(resetIncident: AuthIncident): void {
        this.incidents = this.incidents.filter(x => x.incident != resetIncident)
    }


    getIncidents(): { incident: AuthIncident; timestamp: number }[] {
        return this.incidents;
    }
}