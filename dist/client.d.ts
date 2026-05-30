import type { AutomataClientConfig, ChatParams, ChatResponse, AttestParams, AttestResponse, RelayParams, RelayResponse, SaveFlowParams, Flow, SaveTransactionParams, Transaction, WsMessage } from './types';
export declare class AutomataClient {
    private readonly base;
    private readonly timeout;
    constructor(config: AutomataClientConfig);
    private post;
    private get;
    health(): Promise<{
        status: string;
        timestamp: string;
    }>;
    chat(params: ChatParams): Promise<ChatResponse>;
    attest(params: AttestParams): Promise<AttestResponse>;
    relay(params: RelayParams): Promise<RelayResponse>;
    saveFlow(params: SaveFlowParams): Promise<Flow>;
    getFlows(walletAddress: string): Promise<Flow[]>;
    saveTransaction(params: SaveTransactionParams): Promise<Transaction>;
    getHistory(walletAddress: string): Promise<Transaction[]>;
    watchTx(txHash: string, chainId: string, onStatus: (msg: WsMessage) => void): () => void;
}
