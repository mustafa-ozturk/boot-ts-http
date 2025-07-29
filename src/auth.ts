import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 1);
};

export const checkPasswordHash = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
