interface AttestData {
    fromFID: string,
    data: string
}

interface FrameCache {
    toFids: string,
    attestTxn: string    
}

export  type {AttestData, FrameCache}
