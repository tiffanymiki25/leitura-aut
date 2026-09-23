import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function POST(request:Request) {
  const user = await currentUser();
  if (!user?.isAdmin) return NextResponse.json({error:'Apenas administradoras podem definir leituras mensais.'},{status:403});
  const {month,startDate,bookIds} = await request.json();
  if (!month || !Array.isArray(bookIds) || bookIds.length === 0) return NextResponse.json({error:'Escolha um mês e ao menos um livro.'},{status:400});
  const date = new Date(`${month}-01T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return NextResponse.json({error:'Mês inválido.'},{status:400});
  const books = await prisma.book.findMany({where:{id:{in:bookIds},isContested:false},select:{id:true}});
  if (books.length !== bookIds.length) return NextResponse.json({error:'Escolha apenas livros aptos.'},{status:400});
  const reading = await prisma.monthlyReading.upsert({where:{month:date},update:{startDate:startDate?new Date(`${startDate}T12:00:00.000Z`):null,books:{deleteMany:{},create:books.map(book=>({bookId:book.id}))}},create:{month:date,startDate:startDate?new Date(`${startDate}T12:00:00.000Z`):null,books:{create:books.map(book=>({bookId:book.id}))}},include:{books:{include:{book:true}}}});
  const newest = await prisma.monthlyReading.findFirst({orderBy:{month:'desc'},include:{books:{orderBy:{bookId:'asc'}}}});
  await prisma.club.upsert({where:{id:'main'},update:{currentBookId:newest?.books[0]?.bookId},create:{id:'main',inviteCode:process.env.CLUB_INVITE_CODE || 'configure-o-convite',currentBookId:newest?.books[0]?.bookId}});
  return NextResponse.json(reading);
}
