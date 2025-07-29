import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash("Pandi@123#", 10);
console.log(hashedPassword);
