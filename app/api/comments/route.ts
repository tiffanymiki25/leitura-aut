import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function POST(request:Request) {
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const {bookId,content}=await request.json();
  if(typeof bookId!=='string'||typeof content!=='string'||!content.trim())return NextResponse.json({error:'Escreva um comentário.'},{status:400});
  const comment=await prisma.comment.create({data:{bookId,userId:user.id,content:content.trim().slice(0,1200)},include:{user:{select:{name:true}},book:{select:{id:true,title:true}}}});
  return NextResponse.json(comment,{status:201});
}
