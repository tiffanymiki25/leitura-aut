import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { currentUser } from '../../../lib/current-user';

export async function POST(request:Request) {
  const admin = await currentUser();
  if (!admin?.isAdmin) return NextResponse.json({error:'Apenas administradoras podem alterar permissões.'},{status:403});
  const {email} = await request.json();
  if (!email?.trim()) return NextResponse.json({error:'Informe um e-mail.'},{status:400});
  const member = await prisma.user.findUnique({where:{email:email.trim().toLowerCase()}});
  if (!member) return NextResponse.json({error:'Essa pessoa precisa criar um perfil antes de se tornar administradora.'},{status:404});
  const updated = await prisma.user.update({where:{id:member.id},data:{isAdmin:true},select:{id:true,name:true,email:true,isAdmin:true}});
  return NextResponse.json(updated);
}
