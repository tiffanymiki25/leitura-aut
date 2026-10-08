import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

function date(value:unknown){if(typeof value!=='string'||!value)return null;const parsed=new Date(`${value}T12:00:00.000Z`);return Number.isNaN(parsed.getTime())?undefined:parsed}
function clean(body:Record<string,unknown>){const title=typeof body.title==='string'?body.title.trim():'';const numericRating=Number(body.rating);const hasRating=body.rating!==''&&body.rating!==null&&body.rating!==undefined;const startedAt=date(body.startedAt),finishedAt=date(body.finishedAt);return {title,author:typeof body.author==='string'?body.author.trim()||null:null,coverUrl:typeof body.coverUrl==='string'?body.coverUrl.trim()||null:null,rating:hasRating&&Number.isInteger(numericRating)&&numericRating>=1&&numericRating<=5?numericRating:null,startedAt,finishedAt}}

export async function POST(request:Request){const user=await currentUser();if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});const data=clean(await request.json());if(!data.title)return NextResponse.json({error:'Informe o nome do livro.'},{status:400});if(data.startedAt===undefined||data.finishedAt===undefined)return NextResponse.json({error:'Informe datas válidas.'},{status:400});const reading=await prisma.personalReading.create({data:{...data,userId:user.id}});return NextResponse.json(reading,{status:201})}
