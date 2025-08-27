import { AuthUtil } from "../../shared/utils/auth.utils";
import { AuthRepository } from "./auth.repository";
import type { CreateAuth, RegisterInput } from "./auth.types";

export class AuthService {
  async register(data: RegisterInput) {
    const usernameExists = await AuthRepository.findByEmailOrUsername(
      data.username
    );

    if (usernameExists) {
      throw new Error("Username already exists");
    }

    const emailExists = await AuthRepository.findByEmailOrUsername(data.email);

    if (emailExists) {
      throw new Error("Email already exists");
    }

    const passwordSalt = AuthUtil.generateSalt();
    const passwordHash = await AuthUtil.hashPassword(
      data.password,
      passwordSalt
    );

    return await AuthRepository.create({
      email: data.email,
      username: data.username,
      password_hash: passwordHash,
      password_salt: passwordSalt,
    });
  }
}
