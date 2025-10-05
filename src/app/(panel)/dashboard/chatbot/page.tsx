import getSession from '@/lib/getSession';
import { redirect } from 'next/navigation';
import { canPermission } from '@/utils/permissions/canPermission';
import { ChatbotContent } from './_components/chatbot-content';
import { getChatbotConfig } from './_data-access/get-config';
import { LabelSubscription } from '@/components/ui/label-subscription';

export default async function Chatbot() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const permission = await canPermission({ type: 'chatbot' });
  const config = await getChatbotConfig({ userId: session?.user?.id! });

  return (
    <main>
      {!permission.hasPermission && (
        <LabelSubscription expired={permission.expired} />
      )}
      {permission.hasPermission && (
        <ChatbotContent
          config={config}
          permission={permission}
          userId={session.user?.id!}
        />
      )}
    </main>
  );
}