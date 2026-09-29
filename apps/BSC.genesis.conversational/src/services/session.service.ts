const DEFAULT_CLIENT_ID = '323644';

let currentClientId = DEFAULT_CLIENT_ID;

class SessionService {
  getClientId(): string {
    return currentClientId;
  }

  setClientId(clientId: string): void {
    const normalized = clientId.trim().toUpperCase();
    currentClientId = normalized || DEFAULT_CLIENT_ID;
  }

  reset(): void {
    currentClientId = DEFAULT_CLIENT_ID;
  }
}

export default new SessionService();
