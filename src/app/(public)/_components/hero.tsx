import { Button } from "@/components/ui/button";
import Image from 'next/image';
import genericImg from "../../../../public/heroimg.png"

export function Hero()
{
    return(
        <section>
            <div className="container mx-auto px-4 pt-28  pb-16 sm:px-6">
                <main className="flex items-center justify-center">
                    <article className=" flex-[2] space-y-8 max-w-3xl flex flex-col justify-center">
                        <h1 className="text-4xl lg:text-5xl font-bold max-w-2xl tracking-tight">
                            Organize e agende seus atendimentos com facilidade!
                        </h1>
                        <p className="text-base md:text-lg text-gray-600">
                            Nós somos a plataforma completa para profissionais que buscam agilidade
                            e praticidade na gestão de seus agendamentos.
                        </p>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 w-fit px-6 font-semibold">
                            Ver mais
                        </Button>
                    </article>
                    <div className="hidden lg:block">
                        <Image
                            src={genericImg}
                            alt="Logo da plataforma"
                            width={340}
                            height={400}
                            className="object-contain"
                            quality={100}
                            priority
                        />
                    </div>
                </main>
            </div>
        </section>
    )
}