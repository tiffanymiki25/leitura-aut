import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { currentUser } from '../../../../../lib/current-user';
import { r2SignedUrl } from '../../../../../lib/r2';

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
  const user = await currentUser();
  if (!user) return NextResponse.json({error:'Não autorizado'},{status:401});
  const {id}=await params; const book=await prisma.book.findUnique({where:{id},select:{epubKey:true}});
  if (!book?.epubKey) return NextResponse.json({error:'Arquivo não encontrado.'},{status:404});
  return NextResponse.redirect(r2SignedUrl('GET',book.epubKey));
}

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  const user = await currentUser();
  if (!user?.isAdmin) return NextResponse.json({error:'Apenas administradoras podem enviar EPUBs.'},{status:403});
  const {id}=await params; const {action,name,key}=await request.json();
  const book=await prisma.book.findUnique({where:{id},select:{id:true}});
  if (!book) return NextResponse.json({error:'Livro não encontrado.'},{status:404});
  if (action==='prepare') { if (!name?.toLowerCase().endsWith('.epub')) return NextResponse.json({error:'Envie um arquivo EPUB.'},{status:400}); const clean=name.replace(/[^a-zA-Z0-9._-]/g,'_'); const epubKey=`epubs/${id}/${crypto.randomUUID()}-${clean}`; return NextResponse.json({url:r2SignedUrl('PUT',epubKey),key:epubKey}); }
  if (action==='confirm') { if (!key?.startsWith(`epubs/${id}/`) || !name?.toLowerCase().endsWith('.epub')) return NextResponse.json({error:'Arquivo inválido.'},{status:400}); const updated=await prisma.book.update({where:{id},data:{epubKey:key,epubName:name},select:{id:true,epubName:true}}); return NextResponse.json(updated); }
  return NextResponse.json({error:'Ação inválida.'},{status:400});
}
