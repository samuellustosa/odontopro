import getSession from '@/lib/getSession';
import { redirect } from 'next/navigation';
import { getClientWithDetails } from './_data-access/get-client-with-details';
import { ClientContent } from './_components/client-content';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }
    
    // Use 'await' aqui para garantir que o 'id' seja resolvido antes de ser usado
    const { id } = await params;

    const { data: client, error } = await getClientWithDetails({ clientId: id });

    if (error || !client) {
        redirect('/dashboard/clients');
    }

    return (
        <ClientContent client={client} userId={session.user?.id!} />
    );
}