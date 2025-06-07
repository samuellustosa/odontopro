"use server"

import prisma from "@/lib/prisma"

interface GetUserdataProps{
    userId: string;
}

export async function getUserData({ userId }: GetUserdataProps) {
    try{

        if(!userId){
            return null;
        }

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            },
            include:{
                subscription:true
            }
        })


        if(!userId) {
            return null;
        }

        return user;

    }catch(err){
        console.log(err);
        return null;

    }
}