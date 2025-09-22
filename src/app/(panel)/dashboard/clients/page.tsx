import getSession from '@/lib/getSession';
import { redirect } from 'next/navigation';
import { ClientsContent } from './_components/clients-content';

export default async function ClientsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <ClientsContent userId={session.user.id} />;
}