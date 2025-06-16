"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ghost, Pencil, Plus, X } from "lucide-react"
import { DialogService } from "./dialog-service"
import { Service } from "@/generated/prisma"
import { formatCurrency } from "@/utils/formatCurrency"
import { deleteServices } from "../_actions/detete-service"
import { toast } from "sonner"


interface ServiceListProps{
    services: Service[]
}


export function SevicesList({ services }: ServiceListProps) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingService, setEditingService] = useState<null | Service>(null)

    async function handleDeleteService(serviceId: string){
        const response = await deleteServices({ serviceId: serviceId})

        if(response.error){
            toast(response.error)
            return;
        }

        toast.success(response.data)
    }


    function handleEditService(service: Service){
        setEditingService(service);
        setIsDialogOpen(true);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <section className="mx-auto">

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl md:text-2x1 font-bold">Serviços</CardTitle>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="w-4 h4"/>
                            </Button>
                        </DialogTrigger>

                        <DialogContent 
                            onInteractOutside={(e) => {
                                e.preventDefault();
                                setIsDialogOpen(false);
                                setEditingService(null)
                            }}
                            >
                            <DialogService
                            closeModal={() =>{
                                setIsDialogOpen(false);
                                setEditingService(null);
                            }}
                            serviceId={editingService ? editingService.id : undefined}
                            initialValues= {editingService ? {
                                name: editingService.name,
                                price: ( editingService.price / 100).toFixed(2).replace(".", ","),
                                hours: Math.floor(editingService.duration / 60).toString(),
                                minutes: (editingService.duration % 60). toString()
                            }: undefined}
                            />
                        </DialogContent>

                    </CardHeader>

                    <CardContent>
                        <section className="space-y-4 mt-5">
                            {services.map((service) => (
                            <article
                                key={service.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition"
                            >
                                <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-800">{service.name}</span>
                                <span className="text-gray-400">-</span>
                                <span className="text-gray-600 font-medium">{formatCurrency(service.price / 100)}</span>
                                </div>

                                <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100"
                                    onClick={() => handleEditService(service)}
                                >
                                    <Pencil className="w-4 h-4 text-gray-600" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-red-100"
                                    onClick={() => handleDeleteService(service.id)}
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </Button>
                                </div>
                            </article>
                            ))}
                        </section>
                    </CardContent>


                </Card>

            </section>
            
        </Dialog>
    )
}