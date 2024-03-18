import { NextRequest, NextResponse } from "next/server";
import { getAttestationUid } from "../../utils/utils"

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
    const param = req.nextUrl.searchParams    
    const txId = param.get('tx')
    return new NextResponse(
        await getAttestationUid(txId!)
    )
}

export const GET = async(req: NextRequest): Promise<NextResponse> => {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';