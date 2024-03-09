interface AttestData {
    fromFID: string,
    data: string
}

interface FrameCache {
    fromFid: {
        toFids: string,
        attestTxn: string
    }
}

export  type {AttestData, FrameCache}
