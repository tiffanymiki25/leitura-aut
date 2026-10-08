import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { currentUser } from '../../../../lib/current-user';

export async function POST(request:Request) {
  const user=await currentUser();
  if(!user?.isAdmin)return NextResponse.json({error:'Apenas administradoras podem realizar o sorteio.'},{status:403});
  const {month}=await request.json();
  if(!month)return NextResponse.json({error:'Escolha o mês da leitura.'},{status:400});
  const date=new Date(`${month}-01T12:00:00.000Z`);
  if(Number.isNaN(date.getTime()))return NextResponse.json({error:'Mês inválido.'},{status:400});

  const books=await prisma.book.findMany({where:{isContested:false,monthlyReadings:{none:{}}},include:{votes:true},orderBy:{title:'asc'}});
  const finalists=books.filter(book=>book.votes.length>0).sort((a,b)=>b.votes.length-a.votes.length||a.title.localeCompare(b.title)).slice(0,3);
  if(!finalists.length)return NextResponse.json({error:'Ainda não há votos para realizar o sorteio.'},{status:400});
  const chosen=finalists[Math.floor(Math.random()*finalists.length)];
  const reading=await prisma.$transaction(async tx=>{
    const saved=await tx.monthlyReading.upsert({where:{month:date},update:{startDate:null,books:{deleteMany:{},create:{bookId:chosen.id}}},create:{month:date,books:{create:{bookId:chosen.id}}},include:{books:{include:{book:true}}}});
    await tx.club.upsert({where:{id:'main'},update:{pollOpen:false},create:{id:'main',inviteCode:process.env.CLUB_INVITE_CODE||'configure-o-convite',pollOpen:false}});
    return saved;
  });
  return NextResponse.json({reading,chosen:{id:chosen.id,title:chosen.title,author:chosen.author},finalists:finalists.map(book=>({id:book.id,title:book.title,votes:book.votes.length}))});
}
