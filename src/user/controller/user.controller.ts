import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { ResponseWrapper } from 'src/common/wrapper/response.wrapper';
import { JwtForgotAuthGuard } from 'src/auth/jwt/guards/jwt-forgot.guard';
import { RoleGuard } from 'src/auth/jwt/guards/roles.guard';
import { Roles } from 'src/auth/jwt/decorators/roles.decorator';
import { JwtLoginAuthGuard } from 'src/auth/jwt/guards/jwt.guard';
import { Activity, Gender, Goal } from '../entity/user.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('register')
  async registerUser(
    @Body() request: RegisterUserDto,
  ): Promise<ResponseWrapper<any>> {
    console.log('Registering User:', request);
    try {
      const user = await this.userService.createUser(request);
      console.log('User:', user);
      if (user) {
        return new ResponseWrapper(HttpStatus.CREATED, 'Register Successful');
      }
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Post('password/reset')
  @UseGuards(JwtForgotAuthGuard, RoleGuard)
  @Roles('user')
  async resetPassword(
    @Req() req: any,
    @Body() body: { new_password: string },
  ): Promise<ResponseWrapper<any>> {
    try {
      await this.userService.resetPassword(req.user.id, body.new_password);
      return new ResponseWrapper(
        HttpStatus.CREATED,
        'Password Change Successful',
      );
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put('name')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserName(
    @Req() req: any,
    @Body() body: { name: string },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserName(id, body.name);
      return new ResponseWrapper(HttpStatus.OK, 'Name Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Put('height')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserHeight(
    @Req() req: any,
    @Body() body: { height: number },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserHeight(id, body.height);
      return new ResponseWrapper(HttpStatus.OK, 'Height Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Put('weight')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserWeight(
    @Req() req: any,
    @Body() body: { weight: number },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserWeight(id, body.weight);
      return new ResponseWrapper(HttpStatus.OK, 'Weight Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put('bmi')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserBMI(
    @Req() req: any,
    @Body() body: { bmi: number },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserBMI(id, body.bmi);
      return new ResponseWrapper(HttpStatus.OK, 'BMI Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Put('bmr')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserBMR(
    @Req() req: any,
    @Body() body: { bmr: number },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserBMR(id, body.bmr);
      return new ResponseWrapper(HttpStatus.OK, 'BMR Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Put('gender')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserGender(
    @Req() req: any,
    @Body() body: { gender: Gender },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserGender(id, body.gender);
      return new ResponseWrapper(HttpStatus.OK, 'Gender Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Put('activity')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserActivity(
    @Req() req: any,
    @Body() body: { activity: Activity },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserActivity(id, body.activity);
      return new ResponseWrapper(HttpStatus.OK, 'Activity Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Put('goal')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserGoal(
    @Req() req: any,
    @Body() body: { goal: Goal },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserGoal(id, body.goal);
      return new ResponseWrapper(HttpStatus.OK, 'Goal Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }

  @Put('birthday')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async updateUserBirthday(
    @Req() req: any,
    @Body() body: { birthday: Date },
    @Query('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const id = req.user.role === 'admin' && userId ? userId : req.user.id;
      await this.userService.updateUserBirthDay(id, body.birthday);
      return new ResponseWrapper(HttpStatus.OK, 'Birthday Updated Successful');
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Get('detail/:user_id')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async getOneUserById(
    @Req() req: any,
    @Param('user_id') userId: string,
  ): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.getOneUserById(userId);
      return new ResponseWrapper(HttpStatus.OK, 'User Found', user);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
  @Get('')
  @UseGuards(JwtLoginAuthGuard, RoleGuard)
  @Roles('user', 'admin')
  async getUsers(): Promise<ResponseWrapper<any>> {
    try {
      const user = await this.userService.getAllUser();
      return new ResponseWrapper(HttpStatus.OK, 'User Found', user);
    } catch (error) {
      throw new HttpException(
        new ResponseWrapper(error.status, error.message),
        error.status,
      );
    }
  }
}
