import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      "label": "Next",
      "action": "post",                
    },
  ],        
  image: {
    src: `${NEXT_PUBLIC_URL}/ottp-frame-1a.png`,
    //aspectRatio: '1:1',
  },
  input: {text: 'Tag collaborators e.g. @df @v'},          
  postUrl: `${NEXT_PUBLIC_URL}/api/next`,      
})

export const metadata: Metadata = {
  title: 'OTTP: Open To The Public',
  description: 'Collaboration Graph',
  openGraph: {
    title: 'OTTP: Open To The Public',
    description: 'Collaboration Graph',
    images: [`${NEXT_PUBLIC_URL}/ottp-frame-1a.png`],
  },
  other: {
    ...frameMetadata,
  },
}

export default function Page() {
  return (
    <>
      <h1>OTTP</h1>
    </>
  );
}
