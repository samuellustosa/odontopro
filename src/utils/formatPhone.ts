// formatPhone.ts

export function formatPhone(value: string) {
    // 1. Remove todos os caracteres que não são dígitos
    const cleanedValue = value.replace(/\D/g, '');
  
    // 2. Limita a string a 11 dígitos (tamanho máximo para celular com DDD)
    const truncatedValue = cleanedValue.slice(0, 11);
    const { length } = truncatedValue;
  
    // 3. Aplica a máscara de acordo com a quantidade de dígitos
    
    // Se for um celular completo (11 dígitos) -> (XX) XXXXX-XXXX
    if (length === 11) {
      return truncatedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  
    // Se for um telefone fixo completo (10 dígitos) -> (XX) XXXX-XXXX
    if (length === 10) {
      return truncatedValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    // As condições abaixo formatam o número enquanto o usuário digita
  
    if (length > 6) {
      // Para números com 10 dígitos -> (XX) XXXX-XXXX
      return truncatedValue.replace(/(\d{2})(\d{4})/, '($1) $2-');
    }
    
    if (length > 2) {
      // Adiciona os parênteses no DDD -> (XX)
      return truncatedValue.replace(/(\d{2})/, '($1) ');
    }
  
    // Se tiver 2 dígitos ou menos, retorna apenas os números
    return truncatedValue;
  }


  export function extractPhoneNumber(phone: string) {
    
    const phoneValue = phone.replace(/[()\s-]/g, "");
    
    return phoneValue;
  }