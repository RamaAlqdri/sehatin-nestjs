import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entity/admin.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async seed() {
    const email = process.env.ADMIN_EMAIL;
    const existingAdmin = await this.adminRepository.findOne({
      where: { email },
    });
    // console.log("existingAdmin", existingAdmin);
    // console.log("process.env.ADMIN_PASSWORD", process.env.ADMIN_PASSWORD);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const superadmin = this.adminRepository.create({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
      });

      await this.adminRepository.save(superadmin);
      console.log('Admin berhasil ditambahkan.');
    } else {
      console.log('Admin sudah ada.');
    }
  }
}
