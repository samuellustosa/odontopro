

/**
 * Converte um valor monetário em reais (BRL) para centavos
 * @param {string} amount - o valor monetário em reias a ser convertido
 * @returns {number} o valor convertido em centavos
 */
export function convertRealToCents(amount: string){
    const numericPrice = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
    const priceInCents = Math.round(numericPrice * 100)

    return priceInCents;
}