import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Check } from 'lucide-react'
import { subscriptionPlans } from '@/utils/plans/index'

export function GridPlans() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {subscriptionPlans.map((plan, index) => (
        <Card
          key={plan.id}
          className={`relative flex flex-col p-6 rounded-2xl ${
            index === 1
              ? 'border-2 border-emerald-500 shadow-lg'
              : 'border border-gray-200'
          }`}
        >
          {index === 1 && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-semibold uppercase">
              Promoção Exclusiva
            </div>
          )}

          <CardHeader className="p-0 mb-4 text-center">
            <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
            <CardDescription className="text-base text-gray-500">
              {plan.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 p-0 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              {plan.oldPrice && (
                <p className="text-lg text-gray-400 line-through">
                  {plan.oldPrice}
                </p>
              )}
              <p className="text-4xl font-extrabold text-black">{plan.price}</p>
            </div>
            <ul className="space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-base text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="p-0">
            <Button className="w-full h-9 text-lg font-semibold bg-black text-white hover:bg-black/90 rounded-xl">
              Ativar Assinatura
            </Button>
          </CardFooter>
        </Card>
      ))}
    </section>
  )
}