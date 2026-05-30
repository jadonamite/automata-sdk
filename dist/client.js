"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomataClient = void 0;
class AutomataClient {
    constructor(config) {
        if (!config.apiUrl)
            throw new Error('AutomataClient: apiUrl is required');
        this.base = config.apiUrl.replace(/\/$/, '');
        this.timeout = config.timeout ?? 30000;
    }
    async post(path, body) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        try {
            const res = await fetch(`${this.base}${path}`, {
                method: 'POST',
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error ?? `HTTP ${res.status}`);
            return json;
        }
        finally {
            clearTimeout(timer);
        }
    }
    async get(path) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        try {
            const res = await fetch(`${this.base}${path}`, {
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
            });
            const json = await res.json();
            if (!res.ok)
                throw new Error(json.error ?? `HTTP ${res.status}`);
            return json;
        }
        finally {
            clearTimeout(timer);
        }
    }
    health() {
        return this.get('/health');
    }
    chat(params) {
        return this.post('/api/chat', params);
    }
    attest(params) {
        return this.post('/api/bridge/attest', params);
    }
    relay(params) {
        return this.post('/api/bridge/relay', params);
    }
    saveFlow(params) {
        return this.post('/api/flows', params);
    }
    getFlows(walletAddress) {
        return this.get(`/api/flows/${walletAddress}`);
    }
    saveTransaction(params) {
        return this.post('/api/history', params);
    }
    getHistory(walletAddress) {
        return this.get(`/api/history/${walletAddress}`);
    }
    watchTx(txHash, chainId, onStatus) {
        const wsUrl = this.base.replace(/^http/, 'ws');
        let ws;
        try {
            ws = new WebSocket(wsUrl);
        }
        catch {
            throw new Error('WebSocket unavailable. In Node.js < 22, pass a WebSocket implementation via globalThis.WebSocket or use the ws package.');
        }
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'monitor', txHash, chainId }));
        };
        ws.onmessage = (event) => {
            try {
                onStatus(JSON.parse(event.data));
            }
            catch {
                // ignore malformed frames
            }
        };
        ws.onerror = () => {
            onStatus({ type: 'error', message: 'WebSocket connection error' });
        };
        return () => {
            if (ws.readyState === ws.OPEN)
                ws.close();
        };
    }
}
exports.AutomataClient = AutomataClient;
