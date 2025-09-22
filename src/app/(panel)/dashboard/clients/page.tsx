import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ClientsContent } from './_components/clients-content'

export default async function Clients() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ClientsContent userId={session.user?.id!} />
    </Suspense>
  )
}