import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { currentUser } from '../../../../lib/current-user';
import { prisma } from '../../../../lib/prisma';
import { r2SignedUrl } from '../../../../lib/r2';

const allowedTypes=new Set(['image/jpeg','image/png','image/webp']);
const extensions:{[key:string]:string}={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};

export async function POST(request:Request) {
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const body=await request.json();
  const {action,type}=body;
  if(action==='prepare') {
    if(!allowedTypes.has(type))return NextResponse.json({error:'Envie uma imagem JPG, PNG ou WEBP.'},{status:400});
    const key=`profiles/${user.id}/${randomUUID()}.${extensions[type]}`;
    return NextResponse.json({key,url:r2SignedUrl('PUT',key)});
  }
  if(action==='confirm') {
    const {key}=body;
    if(typeof key!=='string'||!key.startsWith(`profiles/${user.id}/`))return NextResponse.json({error:'Arquivo inválido.'},{status:400});
    await prisma.user.update({where:{id:user.id},data:{imageUrl:`r2:${key}`}});
    return NextResponse.json({ok:true,src:'/api/profile/photo'});
  }
  return NextResponse.json({error:'Ação inválida.'},{status:400});
}

export async function GET() {
  const user=await currentUser();
  if(!user?.imageUrl?.startsWith('r2:'))return NextResponse.json({error:'Foto não encontrada.'},{status:404});
  return NextResponse.redirect(r2SignedUrl('GET',user.imageUrl.slice(3)));
}
