import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash("irwin.day@gmail.com", 10);
console.log(hashedPassword);
