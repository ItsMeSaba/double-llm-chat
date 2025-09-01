import bcrypt from "bcryptjs";

export async function getHashedPassword(password: string) {
  const saltRounds = 10;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (e) {
    return null;
  }
}
