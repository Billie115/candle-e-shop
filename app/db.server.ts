/** kanei import to .env file gia na parei ta credentials
gia na kanei to connection sto db */
import "dotenv/config";
/** to PrismaMariaDb einai o adaptor o opoios kanei to prisma na milaei
me to MySQL k MariaDB db, to prisma 7.0 den exei built in aftous tous adaptor */
import { PrismaMariaDb } from "@prisma/adapter-mariadb"; 
import { PrismaClient } from "../generated/prisma/client"; 
/** adapter einai me liga logia to log in, bazeis ta credentials
apo to .env, den ta bazoume apef8ias edw gia security logous se periptosh pou kapoios
diabasei to source code */
const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,/** bazei limit se posa atoma mporoun na kanoun connect sto db taftoxrona oste to db na mhn crasharei */
});
/** kanei to actual connection sto db */
const db = new PrismaClient({ adapter });
/** kanoume export to connection gia melontikh xrhsh */
export default db;