import getSession from '@/lib/getSession';
import { redirect } from 'next/navigation';
import { getClientWithDetails } from './_data-access/get-client-with-details';
import { ClientContent } from './_components/client-content';

export default async function ClientPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }

    const { data: client, error } = await getClientWithDetails({ clientId: params.id });

    if (error || !client) {
        // Redirecionar para a página de clientes se o cliente não for encontrado
        redirect('/dashboard/clients');
    }

    return (
        <ClientContent client={client} userId={session.user?.id!} />
    );
}