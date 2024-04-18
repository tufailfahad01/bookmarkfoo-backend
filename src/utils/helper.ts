import { BadRequestException } from "@nestjs/common";
import { Role, User } from "src/schemas/user.schema";

export function IsAdmin(user: User) {
  if (user.role !== Role.Admin) {
    throw new BadRequestException('Only Admin can perform this action');
  }
}