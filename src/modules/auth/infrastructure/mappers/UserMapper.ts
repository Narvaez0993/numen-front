import { Email, User } from '../../domain';

export type UserDTO = {
  id: string;
  email: string;
  displayName: string;
};

export const UserMapper = {
  toDomain(dto: UserDTO): User {
    return new User({
      id: dto.id,
      email: Email.create(dto.email),
      displayName: dto.displayName,
    });
  },
  toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email.value,
      displayName: user.displayName,
    };
  },
};
