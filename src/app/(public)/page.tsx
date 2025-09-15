import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import { Hero } from "./_components/hero"
import { Professionals } from "./_components/professionals";


export const revalidate = 120 //2 minutos

export default function(){
  return(
    <div className="flex flex-col min-h-screen">
      
      <Header/>

      <div>
        <Hero/>

        <Professionals/>

        <Footer/>
      </div>

    </div>
  )
}