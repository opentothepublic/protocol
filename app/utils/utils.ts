import axios from 'axios'
import { NEXT_PUBLIC_SCHEMAUID, NEXT_PUBLIC_URL } from '../config';
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import { setVData } from './redis';
import { join } from 'path';
import satori from 'satori';
import { ReactNode } from 'react';
import sharp from 'sharp';
import * as fs from "fs"


const getHtmlElement = async(fromFid: string, toFids: string, text: string) => {    
    try {
        const { html } = await import('satori-html')
        const htmlElement = html`<style>
        .confirmation-card {
              background: white;
              border-radius: 8px;
              /*box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);*/          
              margin-left: 10px; /* Maintain left margin */
              width: 600px; /* Specify width */
              height: 400px; /* Specify height */
              text-align: left;
              display: flex;
              flex-direction: column;
          }
          
          .protocol {
              color: #0000FF; /* Blue color for protocol, username, and mention */
              font-size: 24px; /* Matching protocol for consistency */
              font-weight: 500;
              margin-top: 10px; /*
              margin-bottom: 20px; /* Space after protocol text */
          }
          
          .username, .mention {
              color: #0000FF; /* Blue color for protocol, username, and mention */
              font-size: 16px; /* Matching protocol for consistency */
              margin-left: 4px;
              margin-top: 1px; /* Space after username
              margin-bottom: 2em; /* Space after protocol text */
          }
      
          .attestation {
              font-size: 16px;
              line-height: 1.5;
              display: flex;
              flex-direction: column;
          }
          
          .submitted-line {
              display: flex; /* Use flex to keep inline nature */
              flex-wrap: wrap; /* Allow contents to wrap like inline elements */
              margin-top: 20px; /* Space after username
              margin-bottom: 0.75em; /* Space after each attestation line */
              color: #000; /* Default text color */
          }
    
          .collab-line {
              display: flex; /* Use flex to keep inline nature */
              flex-wrap: wrap; /* Allow contents to wrap like inline elements */
              margin-top: 10px; /* Space after username
              margin-bottom: 0.75em; /* Space after each attestation line */
              color: #000; /* Default text color */
          }
          
          .attestation-text {
              display: flex; /* Use flex to keep inline nature */
              flex-wrap: wrap; /* Allow contents to wrap like inline elements */
              margin-top: 10px; /* Space after username
              margin-bottom: 0.75em; /* Space after each attestation line */
              color: #000; /* Default text color */
          }
    
          .confirmation-notice {
              color: #000;
              font-size: 14px;
              margin-top: 4em; /* Space before the confirmation notice */
          }
          
          @media screen and (max-width: 768px) {
              .confirmation-card {
                  width: 80%; /* Adjust card size for smaller screens */
                  margin-left: 20px; /* Adjust margin for smaller screens */
                  padding: 20px;
              }
            }
      </style>
        
        <div class="confirmation-card">
          <div class="protocol">ottp://</div>
          <div class="attestation">
              <div class="submitted-line">
                  Submitted by: <div class="username">${fromFid}</div>
              </div>
              <div class="collab-line">
                  Collaborator(s): <div class="mention">${toFids}</div>
              </div>
              <div class="attestation-text">Attestation: ${text}</div>
          </div>
          <div class="confirmation-notice">By attesting, you are confirming onchain.</div>
      </div>`
        
        return htmlElement
    } catch (e) {
        console.error(e)
    }  
}

const toPng = async (fromFid: string, toFids: string, text: string) => {
    const fontPath = join(process.cwd(), 'IBMPlexMono-Regular.ttf')
    let fontData = fs.readFileSync(fontPath)
    const svg = await satori(
        await getHtmlElement(fromFid, toFids, text) as ReactNode,
        {
            width: 600, height: 400,
            fonts: [{
                data: fontData,
                name: 'IBMPlexMono',
                style: 'normal',
                weight: 400
            }]
        })
    
    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg))
        .resize(600,400, {
            fit: sharp.fit.fill,
        })
        .toFormat('png')
        .toBuffer();    
    const imageData = 'data:image/png;base64,'+ pngBuffer.toString('base64')
    //console.log(imageData)
    return imageData
}


const getFnameFromFid = async (fid: number): Promise<string> => { 
    if (!fid) 
        throw new Error ('Fid cannot be empty')
    try {
        //const response = await axios.get(`https://fnames.farcaster.xyz/transfers?fid=${fid}`)
        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=316300`, {
            headers: {
                accept: 'application/json',
                api_key: process.env.NEYNAR_API_KEY,                
            }
        })
        //console.log(response.data)        
        //return response.data?.transfers[0].username
        return response.data?.users[0].username
    } catch (err) {
        throw(err)
    }
}

const getFidFromFname = async (fname: string): Promise<string> => { 
    if (!fname) 
        throw new Error ('Fname cannot be empty')
    try {
        //const response = await axios.get(`https://fnames.farcaster.xyz/transfers?name=${fname}`)
        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/search?q=${fname}&viewer_fid=316300`, {
            headers: {
                accept: 'application/json',
                api_key: process.env.NEYNAR_API_KEY,                
            }
        })
        //console.log(response.data)        
        //return response.data?.transfers[0].id
        return response.data?.result.users[0].fid
    } catch (err) {
        throw(err)
    }
}

const getTaggedData = (text: string): string[] => {
    const taggedDataPattern = /@\w+/g            
    const matches = text.match(taggedDataPattern)            
    if (!matches) {
        return [];
    }
    return matches.map(taggedData => taggedData.substring(1));
}

const getFids = async(text: string): Promise<string[]> => {
    if (!text)
        throw new Error ('Fnames cannot be empty')
    try {
        const fnames: string[] = getTaggedData(text)     
        let fidArray: string[] = []
        if (!fnames){
            return fidArray
        } else {
            for (let fname of fnames) {
                fidArray.push(await getFidFromFname(fname))
            }            
            return fidArray
        }
    } catch (err) {
        throw(err)
    }
}

const validateCollabUserInput = (text: string): boolean => {
    // Identify segments starting with '@' and possibly followed by any characters
    // except for spaces, punctuation, or special characters (excluding '@').
    const segments = text.match(/@\w+/g) || [];

    // Validate that the original text only contains the valid segments and separators.
    // Rebuild what the valid text should look like from the segments.
    const validText = segments.join(' '); // Using space as a generic separator for validation.

    // Further process the text to remove all valid segments, leaving only separators.
    // This step checks if there are any extra characters or segments that don't start with '@'.
    const remainingText = text.replace(/@\w+/g, '').trim();

    // Check if the remaining text contains only spaces, punctuation, or special characters (excluding '@').
    // This can be adjusted based on the specific separators you expect between words.
    const isValidSeparators = remainingText.length === 0 || /^[^@\w]+$/g.test(remainingText);

    // Ensure every identified segment starts with '@' and contains no additional '@'.
    const isValidSegments = segments.every(segment => segment.startsWith('@') && !segment.slice(1).includes('@'));

    // The text is valid if the separators are valid, and all segments start with '@' without additional '@'.
    return isValidSegments && isValidSeparators;
};

const publicClient = createPublicClient({
    chain: base,
    transport: http()
})

const getAttestandOttpId = async (txnId: string): Promise<{attestUid: string; ottpId: number|null} | any > => {
    try {        
        const hash = txnId as `0x${string}`
        const transactionReceipt = await publicClient.waitForTransactionReceipt({ hash })
        
        //console.log(transactionReceipt)
        let attestUid = transactionReceipt.logs[0]?.data
        console.log(attestUid)

        if (transactionReceipt.logs[1]) {
            let oidHex = transactionReceipt.logs[1].topics[1] 
            console.log('OTTP Hex: ', oidHex)    
            return {attestUid, ottpId: parseInt(oidHex as string, 16)}
        }
        else {
            return {attestUid, ottpId: null}
        }
    } catch (e) {
        console.error(e)
        //return e
        return new Error('Failed to retrieve attestUid or OttpId')
    }
}

const getFnames = async (toFids: string): Promise<string> => {
    const fidArray: string[] = toFids.split(',')    
    const fnamePromises: Promise<string>[] = fidArray.map(fid => getFnameFromFid(Number(fid)));
    const fnameArray: string[] = await Promise.all(fnamePromises);
    const prefixedFnames: string = fnameArray.map(name => '@' + name).join(' ')
    return prefixedFnames
}

const cast = async (fromFid: number, attestData: string) => {
    //console.log('From FID: ',fromFid)
    //console.log('Attest Data: ',attestData)
    const fromFname = await getFnameFromFid(fromFid)
    const toFnames = await getFnames(JSON.parse(attestData).toFids)
    //console.log('To Fnames: ', toFnames)
    const vid = `v${Date.now()}`
    setVData(fromFname, toFnames, vid, attestData)
    
    let text: string = `@${fromFname} ${toFnames} Your collaboration is onchain. Verify the attestation.\n\n (Skip if you submitted.)`
    
    //console.log(text)
    const options = {
        method: 'POST',
        url: 'https://api.neynar.com/v2/farcaster/cast',
        headers: {
          accept: 'application/json',
          api_key: process.env.NEYNAR_API_KEY,
          'content-type': 'application/json'
        },
        data: {
          signer_uuid: process.env.SIGNER_UUID,
          text: text,
          embeds: [{url: `${NEXT_PUBLIC_URL}/api?v=${vid}`}]
        }
    };
      
    axios
        .request(options)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.error(error);
        });
}

const getOttpIdHtmlElement = async(ottpId: number) => {    
    try {
        const { html } = await import('satori-html')
        const htmlElement = html`<style>
        .container {
            position: relative;
            margin: 0;            
            width: 600px;
            height: 400px;
            display: flex;
            flex-direction: column;
            padding: 38px 50px 50px 50px;
            box-sizing: border-box;
            position: relative;
            background-color: #fff;
            background-image: url(../public/ottp-frame-1a.png);
        }
        .text-content {
            position: absolute;
            top: 35%;
            left: 40%;
            transform: translateX(-20%);
            color: black; /* Text color, change as needed */
            text-align: center; /* Center the text horizontally */
            font-size: 72px; /* Set the size of the font */
        }
    </style>
    
    <div class="container">
        <div class="text-content">        
            <p>OTTP ${ottpId}</p>
        </div>
    </div>`
        
        return htmlElement
    } catch (e) {
        console.error(e)
    }  
}

const toOttpIdPng = async (ottpId: number) => {
    const fontPath = join(process.cwd(), 'IBMPlexMono-Regular.ttf')
    let fontData = fs.readFileSync(fontPath)
    const svg = await satori(
        await getOttpIdHtmlElement(ottpId) as ReactNode,
        {
            width: 600, height: 400,
            fonts: [{
                data: fontData,
                name: 'IBMPlexMono',
                style: 'normal',
                weight: 400
            }]
        })
    
    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg))
        .resize(600,400, {
            fit: sharp.fit.fill,
        })
        .toFormat('png')
        .toBuffer();    
    const imageData = 'data:image/png;base64,'+ pngBuffer.toString('base64')
    //console.log(imageData)
    return imageData
}

export {getFids, validateCollabUserInput, getTaggedData, getAttestandOttpId, cast, toPng, toOttpIdPng}
