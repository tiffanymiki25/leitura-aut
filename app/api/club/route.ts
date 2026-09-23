import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function GET() {
  const user=await currentUser(); if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const club=await prisma.club.upsert({where:{id:'main'},update:{},create:{id:'main',inviteCode:process.env.CLUB_INVITE_CODE||'configure-o-convite'}});
  const now=new Date(), currentMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1)), nextMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1));
  const bookInclude={votes:true,contestedBy:{select:{name:true}},suggestedBy:{select:{id:true,name:true}},statuses:{where:{state:'FINISHED'},include:{user:{select:{name:true}}}}} as const;
  const [members,books,monthlyReadings,currentReading,ownStatuses,allStatuses,comments]=await Promise.all([
    prisma.user.findMany({orderBy:{name:'asc'}}),
    prisma.book.findMany({include:bookInclude,orderBy:{createdAt:'desc'}}),
    prisma.monthlyReading.findMany({include:{books:{include:{book:{include:bookInclude}}}},orderBy:{month:'desc'}}),
    prisma.monthlyReading.findFirst({where:{month:{gte:currentMonth,lt:nextMonth}},include:{books:{include:{book:{include:bookInclude}}}}}),
    prisma.readingStatus.findMany({where:{userId:user.id},select:{bookId:true,state:true}}),
    prisma.readingStatus.findMany({include:{user:{select:{id:true,name:true}},book:{select:{id:true,title:true}}}}),
    prisma.comment.findMany({include:{user:{select:{name:true}},book:{select:{id:true,title:true}}},orderBy:{createdAt:'desc'},take:100})
  ]);
  const statuses=await prisma.readingStatus.findMany({where:{bookId:currentReading?.books[0]?.bookId||'__none__'},include:{user:{select:{id:true,name:true}}}});
  const profileStats={finished:ownStatuses.filter(({state})=>state==='FINISHED').length,abandoned:ownStatuses.filter(({state})=>state==='ABANDONED').length};
  const readerRanking=members.map(member=>({id:member.id,name:member.name,count:allStatuses.filter(status=>status.userId===member.id&&status.state==='FINISHED').length})).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
  const bookRanking=books.map(book=>({id:book.id,title:book.title,count:allStatuses.filter(status=>status.bookId===book.id&&status.state==='FINISHED').length})).filter(book=>book.count>0).sort((a,b)=>b.count-a.count||a.title.localeCompare(b.title));
  const readingReport=user.isAdmin?{members:members.map(member=>({id:member.id,name:member.name,email:member.email,finished:allStatuses.filter(status=>status.userId===member.id&&status.state==='FINISHED').length,abandoned:allStatuses.filter(status=>status.userId===member.id&&status.state==='ABANDONED').length})),books:books.map(book=>({id:book.id,title:book.title,readers:allStatuses.filter(status=>status.bookId===book.id&&status.state==='FINISHED').map(status=>status.user.name)})).filter(book=>book.readers.length>0)}:null;
  return NextResponse.json({club:{...club,currentBook:currentReading?.books[0]?.book||null},members,books,statuses,monthlyReadings,user,profileStats,ownStatuses,readerRanking,bookRanking,readingReport,comments});
}

export async function PATCH(request:Request) {
  const user=await currentUser(); if(!user?.isAdmin)return NextResponse.json({error:'Apenas administradoras podem alterar o clube.'},{status:403});
  const {nextMeetingAt,meetingPlace,meetingNotes,pollOpen}=await request.json();
  const data={pollOpen:typeof pollOpen==='boolean'?pollOpen:undefined,nextMeetingAt:nextMeetingAt?new Date(nextMeetingAt):undefined,meetingPlace:meetingPlace?.trim(),meetingNotes:meetingNotes?.trim()};
  const club=await prisma.club.upsert({where:{id:'main'},update:data,create:{id:'main',inviteCode:process.env.CLUB_INVITE_CODE||'configure-o-convite',...data}});
  return NextResponse.json(club);
}
