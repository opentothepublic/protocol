interface AttestData {
    fromFID: string,
    data: string
}

interface FrameCache {
    toFids: string,
    attestTxn: string,
    project: string,
    message: string
}

interface VerifyFrameCache {
    fromFname: string,
    origAtId: string,
    project: string,
    text: string,
    toFids: string,
    toFnames: string
  }

export  type {AttestData, FrameCache, VerifyFrameCache}
