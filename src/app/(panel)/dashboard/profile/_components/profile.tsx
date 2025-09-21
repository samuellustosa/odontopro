"use client"



import { useState } from 'react'
import { profileFormData, useProfileForm } from './profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
    Form,
    FormControl, 
    FormDescription, 
    FormField, 
    FormItem, 
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,} from '@/components/ui/dialog'

import imgTeste from '../../../../../../public/foto1.png'
import { Button } from '@/components/ui/button'
import { Arrow } from '@radix-ui/react-select'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {Prisma } from '@/generated/prisma'
import { updateProfile } from '../_actions/update-profile'
import { toast } from 'sonner'
import { formatPhone } from '@/utils/formatPhone'
import { signOut, useSession} from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Router } from 'next/router'
import { AvatarProfile } from './profile-avatar'


type UserWithSubscription = Prisma.UserGetPayload<{
    include: {
        subscription: true
    }
}>



interface ProfileContentProps{
    user: UserWithSubscription;
}

export function ProfileContent({ user}: ProfileContentProps) {

    const router = useRouter();

    const [selectedHours, setSelectedHours] = useState<string[]>(user.times ?? [])
    const [dialogIsOpen, setDialogisOpen] = useState(false);
    const { update } = useSession();

    const form = useProfileForm({
        name: user.name,
        address: user.address,
        phone: user.phone,
        status: user.status,
        timezone: user.timezone
    }); 

    


    //FUNÇAÕ PRA GERAR HORAS DINAMICAMENTE
    function generateTimeSlots(): string[]  {
        const hours: string[] = [];

        for (let i = 7; i < 24; i++){
            for (let j = 0; j < 2; j++){
                const hour = i.toString().padStart(2, "0")
                const minute = (j * 30).toString().padStart(2, "0")

                hours.push(`${hour}:${minute}`)
            }
        }

        return hours;
    }

    const hours = generateTimeSlots();

    const timeZones = Intl.supportedValuesOf('timeZone').filter((zone) => 
        zone.startsWith("America/Sao_Paulo") ||
        zone.startsWith("America/Fortaleza") ||
        zone.startsWith("America/Recife") ||
        zone.startsWith("America/Bahia") ||
        zone.startsWith("America/Belem") ||
        zone.startsWith("America/Manaus") ||
        zone.startsWith("America/Cuiaba") ||
        zone.startsWith("America/Boa_vista")
    );

    async function onSubmit(values: profileFormData){
        const response = await updateProfile({
            name: values.name,
            address: values.address,
            phone: values.phone,
            status: values.status === 'active' ? true : false,
            timezone: values.timezone,
            times:  selectedHours || []
        })

        if(response.error){
            toast.error(response.error, {
                style: {
                    background: '#f87171',
                    color: '#fff'
                }
            })
            return;
        }

        //deu certo
        toast.success(response.data, {
            style: {
                background: '#4ade80',
                color: '#fff'
            }
        })
        
    }


    async function handleLogout(){
        await signOut();
        await update();
        router.replace("/");

    }


    function toggleHour(hour: string){
        setSelectedHours((prev) => prev.includes(hour) ? prev.filter(h => h !== hour): [...prev, hour].sort())
    }

    return (
        <div className='mx-auto'>
            <Form {...form}> 
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Meu Perfil</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='flex justify-center'>
                                <AvatarProfile
                                    avatarUrl={user.image}
                                    userId={user.id}
                                />
                            </div>

                            <div className='space-y-4'>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>Nome completo</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder='Digite o nome da clinica..'/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>
                                                Endereço completo
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder='Digite o seu endereço da clinica..'/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>
                                                Telefone
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder='(86) 99876-5432'
                                                onChange={(e) => {
                                                    const formattedValue = formatPhone(e.target.value)
                                                    field.onChange(formattedValue)
                                                }}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>
                                                Status da empresa
                                            </FormLabel>
                                            <FormControl>
                                                <Select 
                                                onValueChange={ field.onChange} 
                                                defaultValue={field.value ? "active" :  "inactive"}
                                                >
                                                    
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o status da clinica"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="active">ATIVO (empresa aberta)</SelectItem>
                                                        <SelectItem value="inactive">INATIVO (empresa fechada)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                
                                />

                                <div className='space-y-2'>
                                    <Label className='font-semibold'>
                                        Configurar horário de funcionamento
                                    </Label>

                                    <Dialog open={dialogIsOpen} onOpenChange={setDialogisOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className='w-full justify-between text-muted-foreground'>
                                                Clique aqui para selecionar horários
                                                <ArrowRight className='w-5 h-5'/>
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Horários da clinica</DialogTitle>
                                                <DialogDescription>
                                                    Selecione abaixo os horários de funcionamento da clinica:
                                                </DialogDescription>
                                            </DialogHeader>

                                            <section className='py-4'>
                                                <p className='text-sm text-muted-foreground mb-2'>
                                                    Clique nos horários abaixo para marcar ou desmarcar
                                                </p>

                                                <div className='grid grid-cols-5 gap-2'>
                                                    {hours.map((hour) => (
                                                        <Button
                                                         key={hour}
                                                         variant="outline"
                                                         className={cn(
                                                            'h-10',
                                                            selectedHours.includes(hour) 
                                                              ? 'border-2 border-emerald-500 text-primary bg-emerald-100' 
                                                              : ''
                                                          )}
                                                         onClick={ () => toggleHour(hour)}
                                                         >
                                                            {hour}
                                                        </Button>
                                                    ))}
                                                </div>

                                            </section>

                                            <Button 
                                                className='w-full bg-emerald-500 hover:bg-emerald-600' 
                                                onClick={() => setDialogisOpen(false)}
                                                >
                                                FECHAR
                                            </Button>

                                        </DialogContent>
                                    </Dialog>

                                </div>



                                <FormField
                                    control={form.control}
                                    name="timezone"
                                    render={ ({ field }) => (
                                        <FormItem>
                                            <FormLabel className='font-semibold'>
                                                Selecione o fuso horário
                                            </FormLabel>
                                            <FormControl>
                                                <Select 
                                                onValueChange={ field.onChange} 
                                                defaultValue={field.value}
                                                >
                                                    
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o seu fuso horário"/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {timeZones.map( (zone) => (
                                                            <SelectItem
                                                            key={zone}
                                                            value={zone}
                                                            >
                                                                {zone}

                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                
                                />


                                <Button
                                    type='submit'
                                    className='w-full bg-emerald-500 hover:bg-emerald-600 font-semibold'
                                >
                                    Salvar alterações
                                </Button>



                                

                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>

            <section className='mt-4'>
                <Button
                    variant="destructive"
                    onClick={handleLogout}>
                    Sair da conta
                </Button>
            </section>
        </div>
    )
}
