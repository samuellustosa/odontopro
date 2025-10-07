// src/app/(panel)/dashboard/chatbot/page.tsx
import getSession from '@/lib/getSession';
import { redirect } from 'next/navigation';
import { canPermission } from '@/utils/permissions/canPermission';
import { ChatbotContent } from './_components/chatbot-content';
import { LabelSubscription } from '@/components/ui/label-subscription';

export default async function Chatbot() {
  const session = await getSession();

  if (!session) {
    redirect('/');
  }

  const permission = await canPermission({ type: 'chatbot' });

  return (
    <main>
      {!permission.hasPermission && (
        <LabelSubscription expired={permission.expired} />
      )}
      {permission.hasPermission && (
        <ChatbotContent
          permission={permission}
          userId={session.user?.id!}
        />
      )}
    </main>
  );
}