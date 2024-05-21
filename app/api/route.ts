import { getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../config'
import { toPng } from '../utils/utils';
import { getVData } from '../utils/redis';

const getResponse = async(req: NextRequest): Promise<NextResponse> => {
    const vid = req.nextUrl.searchParams.get('v')
    const data = JSON.parse(await getVData(vid!))
    console.log(data);
    const imageUrl = await toPng(`@${data.fromFname}`, `${data.toFnames}`, `${data.text}`)
    
    return new NextResponse(
        getFrameHtmlResponse({
            buttons: [
                {
                    label: 'View',
                    action: 'link',
                    target: `https://base.easscan.org/attestation/view/${data.origAtId}`
                },
                {
                    label: 'Attest',
                    action: 'tx',      
                    target: `${NEXT_PUBLIC_URL}/api/vattest?v=${vid}`,
                    postUrl: `${NEXT_PUBLIC_URL}/api/vfinal`,
                },
            ],
            image: imageUrl,                    
            ogTitle: 'Open to the Public',
            ogDescription: 'The open collaboration protocol'   
        }),
    );
}

export async function GET(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
