"use client"

import { useProfileForm } from './profile-form'
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
    SelectValue,} from  '@/components/ui/select'
import { Label } from '@/components/ui/label'


const form = useProfileForm();



export function ProfileContent() {
    return(
        <div>
            <h1>teste</h1>
        </div>
    )
}