import { createHash, createHmac } from 'crypto';

const hash = (value:string) => createHash('sha256').update(value).digest('hex');
const hmac = (key:Buffer|string, value:string) => createHmac('sha256',key).update(value).digest();
const encode = (value:string) => value.split('/').map(encodeURIComponent).join('/');

export function r2SignedUrl(method:'GET'|'PUT', key:string) {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secret = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!endpoint || !accessKeyId || !secret || !bucket) throw new Error('Cloudflare R2 não está configurado.');
  const url = new URL(endpoint);
  const now = new Date();
  const date = now.toISOString().replace(/[:-]|\.\d{3}/g,'').slice(0,15)+'Z';
  const day = date.slice(0,8), region='auto', service='s3', scope=`${day}/${region}/${service}/aws4_request`;
  const path = `/${encode(bucket)}/${encode(key)}`;
  const query = new URLSearchParams({
    'X-Amz-Algorithm':'AWS4-HMAC-SHA256',
    'X-Amz-Credential':`${accessKeyId}/${scope}`,
    'X-Amz-Date':date,
    'X-Amz-Expires':'600',
    'X-Amz-SignedHeaders':'host'
  });
  const canonicalQuery = [...query.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const canonicalRequest = `${method}\n${path}\n${canonicalQuery}\nhost:${url.host}\n\nhost\nUNSIGNED-PAYLOAD`;
  const stringToSign = `AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonicalRequest)}`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secret}`,day),region),service),'aws4_request');
  query.set('X-Amz-Signature',createHmac('sha256',signingKey).update(stringToSign).digest('hex'));
  return `${url.origin}${path}?${query.toString()}`;
}
