import { PrismaClient } from "../generated/prisma/client"

let prisma: PrismaClient;

if(process.env.NODE_ENV === 'production'){
    prisma = new PrismaClient();
}else{
    let globalWidthPrisma = global as typeof globalThis & {
        prisma: PrismaClient;
    }

    if(!globalWidthPrisma.prisma){
        globalWidthPrisma.prisma  = new PrismaClient();
    }
    prisma = globalWidthPrisma.prisma;
}

export default prisma;