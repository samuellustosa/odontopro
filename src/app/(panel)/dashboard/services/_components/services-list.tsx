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
import { Plus } from "lucide-react"
import { DialogService } from "./dialog-service"


export function SevicesList() {


    const [isDialogOpen, setIsDialogOpen] = useState(false)


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

                        <DialogContent>
                            <DialogService/>
                        </DialogContent>



                    </CardHeader>

                </Card>

            </section>
            
        </Dialog>
    )
}