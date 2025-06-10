import getSession from '@/lib/getSession'
import { WhatsAppConnection } from './_components/whatsapp-connection'; // Caminho relativo para o componente
import { redirect } from 'next/navigation';
import { getUserData} from './_data-access/get-infi-user'

export default async function WhatsappPage() {
  // Se você usa getSession() como no seu dashboard:
  // import getSession from '@/lib/getSession';
  // const session = await getSession();

  // Se você usa getServerSession diretamente:
  const  session = await getSession()

  if (!session || !session.user) {
    redirect("/"); // Ou para onde for sua página de login
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Gerenciar WhatsApp</h1>
      {session.user?.id && (
        <WhatsAppConnection userId={session.user.id} />
      )}
      {/* Outros elementos da página WhatsApp */}
    </div>
  );
}