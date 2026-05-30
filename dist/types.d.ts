export interface AutomataClientConfig {
    apiUrl: string;
    timeout?: number;
}
export interface ChatParams {
    message: string;
    sessionId: string;
    geminiApiKey: string;
    walletAddress?: string;
    stellarAddress?: string;
}
export interface UnsignedTx {
    to: string;
    data: string;
    value: string;
    chainId: string;
    description: string;
    txType?: string;
    xdr?: string;
    isPlaceholder?: boolean;
    bridgeMeta?: {
        sourceChain: string;
        destinationChain: string;
        sourceDomain: number;
        recipientAddress: string;
        amount: string;
    };
}
export interface ChatResponse {
    reply: string;
    sessionId: string;
    unsignedTxs: UnsignedTx[];
}
export interface AttestParams {
    burnTxHash: string;
    sourceChain: string;
    destinationChain: string;
    recipientAddress: string;
    amount: string;
}
export interface AttestResponse {
    status: string;
    unsignedTx: UnsignedTx;
}
export interface RelayParams {
    burnTxHash: string;
    recipientAddress: string;
    amount: string;
}
export interface RelayResponse {
    status: string;
    burnTxHash: string;
}
export interface SaveFlowParams {
    walletAddress: string;
    name: string;
    description?: string;
    actions: unknown;
}
export interface Flow {
    id: string;
    userId: string;
    name: string;
    description?: string;
    actions: unknown;
    createdAt: string;
}
export interface SaveTransactionParams {
    walletAddress: string;
    txHash?: string;
    chainId?: string;
    actionType: string;
    status: string;
    details?: unknown;
}
export interface Transaction {
    id: string;
    walletAddress: string;
    txHash?: string;
    chainId?: string;
    actionType: string;
    status: string;
    details?: unknown;
    createdAt: string;
}
export type WsMessage = {
    type: 'connected';
    message: string;
} | {
    type: 'pending';
    txHash: string;
} | {
    type: 'confirmed';
    txHash: string;
    blockNumber?: number;
} | {
    type: 'failed';
    txHash: string;
    error?: string;
} | {
    type: 'error';
    message: string;
};
