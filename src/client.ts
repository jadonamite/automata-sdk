import type {
  AutomataClientConfig,
  ChatParams,
  ChatResponse,
  AttestParams,
  AttestResponse,
  RelayParams,
  RelayResponse,
  SaveFlowParams,
  Flow,
  SaveTransactionParams,
  Transaction,
  WsMessage,
} from './types'

export class AutomataClient {
  private readonly base: string
  private readonly timeout: number

  constructor(config: AutomataClientConfig) {
    if (!config.apiUrl) throw new Error('AutomataClient: apiUrl is required')
    this.base = config.apiUrl.replace(/\/$/, '')
    this.timeout = config.timeout ?? 30_000
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)
    try {
      const res = await fetch(`${this.base}${path}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      return json as T
    } finally {
      clearTimeout(timer)
    }
  }

  private async get<T>(path: string): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)
    try {
      const res = await fetch(`${this.base}${path}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      return json as T
    } finally {
      clearTimeout(timer)
    }
  }

  health(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }

  chat(params: ChatParams): Promise<ChatResponse> {
    return this.post('/api/chat', params)
  }

  attest(params: AttestParams): Promise<AttestResponse> {
    return this.post('/api/bridge/attest', params)
  }

  relay(params: RelayParams): Promise<RelayResponse> {
    return this.post('/api/bridge/relay', params)
  }

  saveFlow(params: SaveFlowParams): Promise<Flow> {
    return this.post('/api/flows', params)
  }

  getFlows(walletAddress: string): Promise<Flow[]> {
    return this.get(`/api/flows/${walletAddress}`)
  }

  saveTransaction(params: SaveTransactionParams): Promise<Transaction> {
    return this.post('/api/history', params)
  }

  getHistory(walletAddress: string): Promise<Transaction[]> {
    return this.get(`/api/history/${walletAddress}`)
  }

  watchTx(
    txHash: string,
    chainId: string,
    onStatus: (msg: WsMessage) => void
  ): () => void {
    const wsUrl = this.base.replace(/^http/, 'ws')
    let ws: WebSocket

    try {
      ws = new WebSocket(wsUrl)
    } catch {
      throw new Error(
        'WebSocket unavailable. In Node.js < 22, pass a WebSocket implementation via globalThis.WebSocket or use the ws package.'
      )
    }

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'monitor', txHash, chainId }))
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        onStatus(JSON.parse(event.data as string) as WsMessage)
      } catch {
        // ignore malformed frames
      }
    }

    ws.onerror = () => {
      onStatus({ type: 'error', message: 'WebSocket connection error' })
    }

    return () => {
      if (ws.readyState === ws.OPEN) ws.close()
    }
  }
}
