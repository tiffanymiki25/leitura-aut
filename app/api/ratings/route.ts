import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function POST(request:Request) {
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const {bookId,score}=await request.json();
  if(typeof bookId!=='string'||!Number.isInteger(score)||score<1||score>5)return NextResponse.json({error:'Escolha uma nota de 1 a 5 estrelas.'},{status:400});
  const book=await prisma.book.findUnique({where:{id:bookId},select:{id:true}});
  if(!book)return NextResponse.json({error:'Livro não encontrado.'},{status:404});
  const rating=await prisma.rating.upsert({where:{userId_bookId:{userId:user.id,bookId}},update:{score},create:{userId:user.id,bookId,score}});
  return NextResponse.json(rating);
}
