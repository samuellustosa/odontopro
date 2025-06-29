"use client"
import {useState} from 'react'
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { LogIn, Menu } from "lucide-react";
import { useSession } from 'next-auth/react'
import { handleRegister } from '../_actions/login';

export function Header(){
    const {data: session, status} = useSession();
    const [isOpen, setIsOpen] = useState(false);



    const navItens = [
        { href:"#profissionais", label:"Profissionais"},
    ]

    async function handleLogin() {
        await handleRegister('github')
    }

    const Navlinks = () => (
    <>
        {navItens.map((item) => (
        <Button
        onClick={ () => setIsOpen(false) }
        key={item.href}
        asChild
        className=" bg-transparent hover:bg-transparent text-black shadow-none"
        >
        <Link href={item.href} className='text-base'>
        {item.label}</Link>
        </Button>

        ))}

        {status === 'loading' ?(
            <></>
        ) : session ? (
            <Link
            href="/dashboard"
            className='flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-4 rounded-md'>
                Painel da clinica
            </Link>
        ) : (
            <Button onClick={handleLogin} className='bg-emerald-500 hover:bg-emerald-600 text-white transition-all'>
                <LogIn/>
                Fazer Login
            </Button>
        )}
    </>
    )


    return(
        <header 
        className="fixed top-0 right-0 left-0 z-[999] py-4 px-6 bg-white" 
        >
            <div className="container mx-auto flex items-center justify-between">
                <Link href="/"
                className="text-3xl font-bold text-zinc-900">
                Ondonto<span className="text-emerald-500">PRO</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-4">
                    <Navlinks/>
                </nav>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>

                    <SheetTrigger asChild className="md:hidden">
                        <Button 
                        className="text-black hover:bg-transparent"
                        variant="ghost"
                        size="icon"
                         >
                            <Menu className="w-6 h-6"/>
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-[220px] sm:w-[260px] z-[9999]">
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>Veja nossos links</SheetDescription>
                    </SheetHeader>

                    <nav className="flex flex-col space-y-4 items-center mt-6">
                    <Navlinks />
                    </nav>

                    </SheetContent>

                </Sheet>
            </div>


        </header>
    )
}