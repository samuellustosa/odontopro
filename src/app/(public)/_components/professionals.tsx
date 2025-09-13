import {
    Card,
    CardContent,
    CardTitle,
  } from "@/components/ui/card"
  import { CheckCircle, CalendarCheck2, MessageSquareText } from "lucide-react";
  
  
  export function Professionals() {
      const features = [
          {
              title: "Agendamento Online",
              description: "Permita que seus clientes agendem horários 24/7 de qualquer lugar, diretamente pela sua página.",
              icon: <CalendarCheck2 className="w-6 h-6 text-white"/>,
          },
          {
              title: "Notificações Automáticas",
              description: "Envie lembretes e confirmações via WhatsApp e e-mail, reduzindo faltas e otimizando o tempo.",
              icon: <MessageSquareText className="w-6 h-6 text-white"/>,
          },
          {
              title: "Gestão de Clientes",
              description: "Mantenha um histórico completo de seus clientes, serviços prestados e preferências.",
              icon: <CheckCircle className="w-6 h-6 text-white"/>,
          },
      ];
  
      return(
          <section className="bg-gray-50 py-16">
  
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3x1 text-center mb-12 font-bold">Recursos que facilitam sua vida</h2>
  
                  <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {features.map((feature, index) => (
                          <Card key={index} className="flex flex-col items-center text-center p-6 space-y-4">
                              <div className="bg-emerald-500 rounded-full p-4">
                                  {feature.icon}
                              </div>
                              <CardTitle className="text-xl font-semibold">
                                  {feature.title}
                              </CardTitle>
                              <CardContent>
                                  <p className="text-gray-500">{feature.description}</p>
                              </CardContent>
                          </Card>
                      ))}
                  </section>
  
              </div>
  
          </section>
      )
  }