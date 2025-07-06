import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; username: string }> {
    try {
      const user = await this.usersService.create(dto);
      const token = this.jwtService.sign({ userId: user.id });

      this.logger.log(`New user registered: ${user.username} (${user.email})`);
      return { accessToken: token, username: user.username };
    } catch (err) {
      if (err.code === '23505') {
        this.logger.warn(`Conflict: Email or username already exists`);
        throw new ConflictException('Email or username already exists');
      }
      this.logger.error(`Registration error: ${err.message}`);
      throw new InternalServerErrorException();
    }
  }

    async login(email: string, password: string): Promise<{ accessToken: string, user: { email: string, username: string } }> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        email: user.email,
        username: user.username,
      },
    };
  }
}
