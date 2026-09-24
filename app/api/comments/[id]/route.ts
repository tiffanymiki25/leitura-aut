import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { currentUser } from '../../../../lib/current-user';

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const {id}=await params;
  const {content}=await request.json();
  if(typeof content!=='string'||!content.trim())return NextResponse.json({error:'Escreva um comentário.'},{status:400});
  if(content.trim().length>300)return NextResponse.json({error:'O comentário pode ter no máximo 300 caracteres.'},{status:400});
  const comment=await prisma.comment.findUnique({where:{id},select:{userId:true}});
  if(!comment)return NextResponse.json({error:'Comentário não encontrado.'},{status:404});
  if(comment.userId!==user.id)return NextResponse.json({error:'Você só pode editar seus próprios comentários.'},{status:403});
  return NextResponse.json(await prisma.comment.update({where:{id},data:{content:content.trim()},include:{user:{select:{id:true,name:true,imageUrl:true}},book:{select:{id:true,title:true}}}}));
}

export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}) {
  const user=await currentUser();
  if(!user)return NextResponse.json({error:'Não autorizado'},{status:401});
  const {id}=await params;
  const comment=await prisma.comment.findUnique({where:{id},select:{userId:true}});
  if(!comment)return NextResponse.json({error:'Comentário não encontrado.'},{status:404});
  if(comment.userId!==user.id)return NextResponse.json({error:'Você só pode excluir seus próprios comentários.'},{status:403});
  await prisma.comment.delete({where:{id}});
  return NextResponse.json({ok:true});
}
