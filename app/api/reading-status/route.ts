import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function POST(request:Request) {
  const user=await currentUser(); if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const {bookId,state}=await request.json(); if(!bookId||!['NOT_STARTED','READING','FINISHED'].includes(state))return NextResponse.json({error:'Status inválido.'},{status:400});
  await prisma.readingStatus.upsert({where:{userId_bookId:{userId:user.id,bookId}},update:{state},create:{userId:user.id,bookId,state}});
  return NextResponse.json({ok:true});
}
