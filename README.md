# @jadonamite/automata-sdk

Official API client SDK for the **Automata** cross-chain AI agent platform.

Point it at your deployed Automata backend and get a fully-typed client for chat, bridging, flow management, transaction history, and real-time tx monitoring — with zero chain dependencies.

## Installation

```bash
npm install @jadonamite/automata-sdk
```

## Quick Start

```ts
import { AutomataClient } from '@jadonamite/automata-sdk'

const client = new AutomataClient({
  apiUrl: 'https://your-automata-backend.up.railway.app',
})

// Chat with the AI agent
const { reply, unsignedTxs } = await client.chat({
  message: 'Swap 10 USDC to XLM on Stellar',
  sessionId: 'session-abc123',
  geminiApiKey: 'AIza...',
  walletAddress: '0x...',
  stellarAddress: 'G...',
})

console.log(reply)
// "Swapping 10 USDC → ~94.2 XLM on the Stellar DEX. Confirm in your wallet."

// Sign unsignedTxs with your wallet (Privy, wagmi, etc.)
```

## Configuration

```ts
const client = new AutomataClient({
  apiUrl: 'https://your-backend.up.railway.app', // required
  timeout: 30_000,                                // optional, ms (default: 30s)
})
```

## API Reference

### `client.chat(params)`

Sends a message to the Automata AI agent. Returns the agent's reply and any unsigned transactions ready for wallet signing.

```ts
const { reply, sessionId, unsignedTxs } = await client.chat({
  message:       'Move 50 USDC from Base to Celo',
  sessionId:     'abc123',          // any string — used to maintain conversation context
  geminiApiKey:  'AIza...',         // user's own Gemini API key
  walletAddress: '0x...',           // optional EVM address
  stellarAddress: 'G...',           // optional Stellar address
})
```

### `client.attest(params)`

Polls Circle Iris V2 until attestation is complete after a USDC burn tx, then returns the unsigned mint (claim) transaction for the destination chain. Call this after the user signs the burn tx.

```ts
const { status, unsignedTx } = await client.attest({
  burnTxHash:       '0x...',
  sourceChain:      'base',
  destinationChain: 'celo',
  recipientAddress: '0x...',
  amount:           '50',
})
// status: 'attested' | error
// unsignedTx: the receiveMessage tx to sign on the destination chain
```

### `client.relay(params)`

Starts the background Base → Stellar bridge relay after a burn tx confirms. Returns immediately; the relay runs server-side.

```ts
const { status, burnTxHash } = await client.relay({
  burnTxHash:       '0x...',
  recipientAddress: 'G...',
  amount:           '10',
})
```

### `client.saveFlow(params)` / `client.getFlows(walletAddress)`

Save and retrieve named multi-step automation flows per wallet.

```ts
const flow = await client.saveFlow({
  walletAddress: '0x...',
  name:          'Weekly yield deposit',
  description:   'Bridge USDC to Base then deposit into Aave',
  actions:       [{ type: 'bridge', ... }, { type: 'stake', ... }],
})

const flows = await client.getFlows('0x...')
```

### `client.saveTransaction(params)` / `client.getHistory(walletAddress)`

Persist and retrieve a wallet's transaction history.

```ts
await client.saveTransaction({
  walletAddress: '0x...',
  txHash:        '0x...',
  chainId:       'base',
  actionType:    'bridge',
  status:        'confirmed',
  details:       { amount: '50', fromChain: 'base', toChain: 'celo' },
})

const history = await client.getHistory('0x...')
```

### `client.watchTx(txHash, chainId, onStatus)`

Opens a WebSocket connection to monitor a transaction in real time. Returns an unsubscribe function.

```ts
const unsubscribe = client.watchTx('0x...', 'base', (msg) => {
  if (msg.type === 'confirmed') {
    console.log('Confirmed in block', msg.blockNumber)
    unsubscribe()
  }
  if (msg.type === 'failed') {
    console.error('Failed:', msg.error)
    unsubscribe()
  }
})
```

### `client.health()`

```ts
const { status, timestamp } = await client.health()
```

## Unsigned Transactions

Every tx-building operation returns one or more `UnsignedTx` objects. Sign them with your wallet library of choice:

```ts
// wagmi / viem example
await sendTransaction({
  to:    unsignedTx.to,
  data:  unsignedTx.data,
  value: BigInt(unsignedTx.value),
})

// Stellar XDR example (Privy / Freighter)
if (unsignedTx.xdr) {
  await signTransaction(unsignedTx.xdr)
}
```

## Supported Chains

| Chain | EVM | Native token | USDC |
|---|---|---|---|
| Base | ✓ | ETH | ✓ |
| Celo | ✓ | CELO | ✓ |
| Ethereum | ✓ | ETH | ✓ |
| Stellar | — | XLM | ✓ |

## WebSocket — Node.js < 22

Node.js 18–21 does not have native WebSocket. Polyfill it before calling `watchTx`:

```ts
import { WebSocket } from 'ws'
globalThis.WebSocket = WebSocket as any
```

## Related

- [`@jadonamite/automata-core`](https://www.npmjs.com/package/@jadonamite/automata-core) — standalone embedded SDK, no backend required
- [Automata Platform](https://github.com/jadonamite/automata-sdk)

## License

MIT
