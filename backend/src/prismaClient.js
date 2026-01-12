// src/prismaClient.js
import { PrismaClient } from '@prisma/client';

// Dans Prisma 7, si l'import nommé échoue encore, 
// on s'assure de l'instancier simplement comme ceci :
const prisma = new PrismaClient();

export default prisma;