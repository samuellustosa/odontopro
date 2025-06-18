"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { type } from 'os'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface UseProfileFormsProps{
    name: string | null;
    address: string | null;
    phone: string | null;
    status: boolean;
    timezone: string | null;
} 


const  profileSchema = z.object({
    name: z.string().min(1, { message: "O nome é obrigatório" }),
    address: z.string().optional(),
    phone: z.string().optional(),
    status: z.string(),
    timezone: z.string().min(1, { message: "O time zone é obrigatório" })
})

export type profileFormData = z.infer<typeof profileSchema>;

export function useProfileForm({ name, address, phone,status, timezone}: 
UseProfileFormsProps){
    return useForm<profileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: name || "",
            address: address || "",
            phone: phone || "",
            status: status  ? "active" : "inactive",
            timezone: timezone || ""
        }
    })
}