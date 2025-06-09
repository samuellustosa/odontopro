import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { WhatsAppConnection } from './_components/whatsapp-connection'
import { getUserData } from './_data-acess/get-info-user'

export default async function Dashboard() {
    const session = await getSession()
  
    if (!session) {
      redirect('/')
    }
  
    const user = await getUserData({ userId: session.user?.id })
  
    if (!user || !user.subscription) {
      // redireciona ou mostra uma tela dizendo que precisa assinar
      redirect('/subscription-required')
    }
  
    // aqui a subscription nunca será null
    return <WhatsAppConnection user={user} />
  }
  
