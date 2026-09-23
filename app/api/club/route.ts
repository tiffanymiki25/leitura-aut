import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function GET() {
  const user=await currentUser(); if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const club=await prisma.club.upsert({where:{id:'main'},update:{},create:{id:'main',inviteCode:process.env.CLUB_INVITE_CODE||'configure-o-convite'}});
  const now=new Date(), currentMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)), nextMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1));
  const bookInclude={votes:true,contestedBy:{select:{name:true}},suggestedBy:{select:{id:true,name:true}},statuses:{where:{state:'FINISHED'},include:{user:{select:{name:true}}}}} as const;
  const [members,books,monthlyReadings,currentReading,ownStatuses]=await Promise.all([
    prisma.user.findMany({orderBy:{name:'asc'}}),
    prisma.book.findMany({include:bookInclude,orderBy:{createdAt:'desc'}}),
    prisma.monthlyReading.findMany({include:{books:{include:{book:{include:bookInclude}}}},orderBy:{month:'desc'}}),
    prisma.monthlyReading.findFirst({where:{month:{gte:currentMonth,lt:nextMonth}},include:{books:{include:{book:{include:bookInclude}}}}}),
    prisma.readingStatus.findMany({where:{userId:user.id},select:{state:true}})
  ]);
  const statuses=await prisma.readingStatus.findMany({where:{bookId:currentReading?.books[0]?.bookId||'__none__'},include:{user:{select:{id:true,name:true}}}});
  const profileStats={finished:ownStatuses.filter(({state})=>state==='FINISHED').length,abandoned:ownStatuses.filter(({state})=>state==='ABANDONED').length};
  return NextResponse.json({club:{...club,currentBook:currentReading?.books[0]?.book||null},members,books,statuses,monthlyReadings,user,profileStats});
}

export async function PATCH(request:Request) {
  const user=await currentUser(); if(!user?.isAdmin)return NextResponse.json({error:'Apenas administradoras podem alterar o clube.'},{status:403});
  const {nextMeetingAt,meetingPlace,meetingNotes,pollOpen}=await request.json();
  const data={pollOpen:typeof pollOpen==='boolean'?pollOpen:undefined,nextMeetingAt:nextMeetingAt?new Date(nextMeetingAt):undefined,meetingPlace:meetingPlace?.trim(),meetingNotes:meetingNotes?.trim()};
  const club=await prisma.club.upsert({where:{id:'main'},update:data,create:{id:'main',inviteCode:process.env.CLUB_INVITE_CODE||'configure-o-convite',...data}});
  return NextResponse.json(club);
}
