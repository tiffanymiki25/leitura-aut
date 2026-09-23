import { auth } from './auth'; import { prisma } from './prisma';
const INITIAL_ADMIN_EMAIL = 'tiffanymiki25@gmail.com';
export async function currentUser() { const { data: session } = await auth.getSession(); const user = session?.user; if (!user) return null; const isInitialAdmin = user.email.toLowerCase() === INITIAL_ADMIN_EMAIL; return prisma.user.upsert({ where:{ id:user.id }, update:{ email:user.email, isAdmin:isInitialAdmin?true:undefined }, create:{ id:user.id, email:user.email, name:user.name || user.email.split('@')[0], isAdmin:isInitialAdmin } }); }
