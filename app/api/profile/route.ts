import { NextResponse } from 'next/server';
import { currentUser } from '../../../lib/current-user';
import { prisma } from '../../../lib/prisma';

export async function PATCH(request:Request) {
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const body=await request.json();
  const {name,imageUrl}=body;
  const cleanName=typeof name==='string'?name.trim():'';
  const cleanImage=typeof imageUrl==='string'?imageUrl.trim():'';
  if(!cleanName)return NextResponse.json({error:'Informe seu nome.'},{status:400});
  const updated=await prisma.user.update({where:{id:user.id},data:{name:cleanName.slice(0,80),...(typeof imageUrl==='string'?{imageUrl:cleanImage?cleanImage.slice(0,1000):null}:{})},select:{id:true,name:true,email:true,imageUrl:true,isAdmin:true}});
  return NextResponse.json(updated);
}
