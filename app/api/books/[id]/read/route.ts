import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { currentUser } from '../../../../../lib/current-user';

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) { const user=await currentUser(); if(!user)return NextResponse.json({error:'Não autorizado'},{status:401}); const {id}=await params; await prisma.$transaction([prisma.readingStatus.upsert({where:{userId_bookId:{userId:user.id,bookId:id}},update:{state:'FINISHED'},create:{userId:user.id,bookId:id,state:'FINISHED'}}),prisma.readingActivity.create({data:{userId:user.id,bookId:id,state:'FINISHED'}})]); return NextResponse.json({ok:true}); }
