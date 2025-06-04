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
import { Menu } from "lucide-react";


export function Header(){
    const [isOpen, setIsOpen] = useState(false);
    const navItens = [
        { href:"#profissioanais", label:"Profissionais"},
    ]
    const Navlinks = () => (
    <>
        {navItens.map((item) => (
        <Button
        onClick={ () => setIsOpen(false) }
        key={item.href}
        asChild
        className="w-full justify-start text-left bg-transparent hover:bg-transparent text-black border-none shadow-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        >
        <Link href={item.href}>{item.label}</Link>
        </Button>

        ))}
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
                        className="text-black hover:bg-transparent shadow-none"
                        variant="ghost"
                        size="icon"
                         >
                            <Menu className="w-6 h-6"/>
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-[240px] sm:w-[300px] z-[9999]">
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>Veja nossos links</SheetDescription>
                    </SheetHeader>

                    <nav className="flex flex-col space-y-4 items-start mt-6">
                    <Navlinks />
                    </nav>

                    </SheetContent>

                </Sheet>
            </div>


        </header>
    )
}