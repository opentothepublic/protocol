export const NEXT_PUBLIC_PORT = process.env.PORT || '4001'
//export const NEXT_PUBLIC_URL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : 'https://ottp-attest-client.vercel.app'
export const NEXT_PUBLIC_URL = 'https://3b30-49-207-213-37.ngrok-free.app'
export const NEXT_PUBLIC_SCHEMAUID = process.env.NODE_ENV === 'development' ? process.env.TESTNET_SCHEMAUID : process.env.MAINNET_SCHEMAUID