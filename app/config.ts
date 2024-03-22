import { base, baseSepolia } from 'viem/chains';

export const NEXT_PUBLIC_PORT = process.env.PORT || '4001'
//export const NEXT_PUBLIC_URL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : 'https://ottp-attest-client.vercel.app'
export const NEXT_PUBLIC_URL = 'https://ottp-6k6gsdlfoa-el.a.run.app'
//export const NEXT_PUBLIC_URL = 'https://2087-49-207-226-33.ngrok-free.app'
export const NEXT_PUBLIC_SCHEMAUID = process.env.NODE_ENV === 'development' ? process.env.TESTNET_SCHEMAUID! : process.env.MAINNET_SCHEMAUID!
export const NEXT_PUBLIC_CHAINID = process.env.NODE_ENV === 'development' ? baseSepolia.id : base.id
export const NEXT_PUBLIC_BASESCAN_URL = process.env.NODE_ENV === 'development' ? 'https://base-sepolia.easscan.org/attestation/view/' : 'https://base.easscan.org/attestation/view/'
export const NEXT_PUBLIC_BASESCAN_API_ENDPOINT = process.env.NODE_ENV === 'development' ? 'https://api-sepolia.basescan.org/api' : 	'https://api.basescan.org/api'
export const NEXT_PUBLIC_OTTP_URL = 'https://opentothepublic.org/'