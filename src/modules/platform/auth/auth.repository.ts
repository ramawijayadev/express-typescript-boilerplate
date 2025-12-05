import { db } from "@/core/database/connection";
import { RegisterBody } from "./auth.types";

export class AuthRepository {
  async create(data: Omit<RegisterBody, "password"> & { passwordHash: string }) {
    return db().user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
      },
    });
  }

  async findByEmail(email: string) {
    return db().user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return db().user.findUnique({
      where: { id },
    });
  }
}
