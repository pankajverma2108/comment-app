// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(data: Partial<User>) {
    if (!data.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log(`[UsersService] Hashed password for ${data.email}:`, hashedPassword);

    const user = this.repo.create({
      ...data,
      password: hashedPassword,
    });

    return this.repo.save(user);
  }

  async findByEmail(email: string) {
    console.log(`[UsersService] Looking up user by email: ${email}`);
    return this.repo.findOne({ where: { email } });
  }

  async findById(id: string) {
    console.log(`[UsersService] Looking up user by id: ${id}`);
    return this.repo.findOne({ where: { id } });
  }

  async findByUsername(username: string) {
    console.log(`[UsersService] Looking up user by username: ${username}`);
    return this.repo.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'createdAt'],
    });
  }
}
