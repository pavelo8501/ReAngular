import { AuthIncident } from "./incident.enum";


export class AuthIncidentTracker {

  private incidents: { incident: AuthIncident; timestamp: number }[] = [];
  private retryCount = 0;
 
  constructor(
        private readonly maxRetries = 1
    ){

    }

  registerIncident(incident: AuthIncident): void {
    console.warn(`[Auth Incident] ${incident} at ${new Date().toISOString()}`);
    this.incidents.push({ incident, timestamp: Date.now() });

    if (incident === AuthIncident.SERVER_INVALIDATED) {
      this.retryCount++;
    }
  }

  hasReachedRetryLimit(): boolean {
    return this.retryCount >= this.maxRetries;
  }

  resetRetries(): void {
    this.retryCount = 0;
  }

 
  getIncidents(): { incident: AuthIncident; timestamp: number }[] {
    return this.incidents;
  }
}