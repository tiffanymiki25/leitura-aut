import { redirect } from 'next/navigation';
export default async function Invite({searchParams}:{searchParams:Promise<{code?:string}>}) { const {code}=await searchParams; if (!code || code !== process.env.CLUB_INVITE_CODE) redirect('/?invite=invalid'); redirect('/?invite=accepted'); }
