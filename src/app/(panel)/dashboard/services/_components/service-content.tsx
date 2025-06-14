import { getAllServices } from "../_data-accesss/get-all-services"
import { SevicesList } from "../_components/services-list"



interface ServiceContentProps{
    userId: string
    
}

export async function ServicesContent( { userId }: ServiceContentProps){

    const services = await getAllServices({ userId: userId })

    console.log(services)

return(
    <SevicesList/>
)

}

