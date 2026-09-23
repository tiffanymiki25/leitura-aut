import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function POST(request:Request) {
  const user=await currentUser(); if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const club=await prisma.club.findUnique({where:{id:'main'},select:{pollOpen:true}}); if(!club?.pollOpen)return NextResponse.json({error:'A enquete está fechada.'},{status:400});
  const {bookId}=await request.json(); const book=await prisma.book.findUnique({where:{id:bookId},include:{monthlyReadings:true}});
  if(!book||book.isContested||book.monthlyReadings.length)return NextResponse.json({error:'Este livro não está apto para votação.'},{status:400});
  await prisma.$transaction([prisma.vote.deleteMany({where:{userId:user.id}}),prisma.vote.create({data:{userId:user.id,bookId}})]);
  return NextResponse.json({ok:true});
}
