import { start } from "repl";
import { number, string } from "zod";

export function isToday(date: Date) {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}


/**
 * Verificar se determinado slot já passou.
 */
export function isSlotInThePast(slotTime: string) {
  const [slotHour, slotMinute] = slotTime.split(":").map(Number)

  const now = new Date()
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (slotHour < currentHour) {
    return true; // true quer dize que a hora já passou
  } else if (slotHour === currentHour && slotMinute <= currentMinute) {
    return true;
  }

  return false;

}

export function isSlotssequenceAvailable(
    stratSlot: string,//primeiro horario disponivel
  requiredSlots: number,//quantidade de slots necessarios
  allSlots: string[], //todo gorarios da empresa
  blockedSlots: string[]//horarios bloqueados
){

const startIndex = allSlots.indexOf(stratSlot)
if(startIndex === -1 || startIndex + requiredSlots > allSlots.length){
  return false;
}

  for(let i = startIndex; i <startIndex + requiredSlots; i++){
    const slotTime = allSlots[i]

    if(blockedSlots.includes(slotTime)){
      return false;
    }
  }


  return true;
}
