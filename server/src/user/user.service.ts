import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [];

  createUser(): any {
    const user = {
      id: this.users.length,
      type: '',
    };

    this.users.push(user);

    return user;
  }
}
