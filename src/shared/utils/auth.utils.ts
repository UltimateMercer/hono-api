import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { HTTPException } from "hono/http-exception";

export class AuthUtil {
  static generateSalt(): string {
    return randomBytes(64).toString("base64");
  }

  static hashPassword(password: string, salt: string): string {
    return pbkdf2Sync(password, salt, 10000, 128, "sha512").toString("base64");
  }

  static validatePassword(valueFrom: string, valueTo: string): boolean {
    try {
      return timingSafeEqual(Buffer.from(valueFrom), Buffer.from(valueTo));
    } catch (error) {
      console.error("Password validation error:", error);
      throw new HTTPException(401, {
        message: "Invalid username or password.",
      });
    }
  }
}
