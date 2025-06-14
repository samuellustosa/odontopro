import getSession from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { ServicesContent } from './_components/service-content'

export default async function Dashboard(){

    const session = await getSession()

    if(!session){
        redirect("/")
    }
    
    return(
        <ServicesContent userId= {session.user?.id!}/>
    )
}