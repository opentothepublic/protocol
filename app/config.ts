export const NEXT_PUBLIC_PORT = process.env.PORT || '4001'
export const NEXT_PUBLIC_URL = process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}` : 'https://ottp-attest-client.vercel.app'
//export const NEXT_PUBLIC_URL = 'https://bc0a-49-207-213-37.ngrok-free.app'