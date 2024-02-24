import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs'
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterDto } from './dto/register.dto';
import { log } from 'console';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService

  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      //Primero desestructuramos la data para poder encriptar el password
      const { password, ...userData } = createUserDto;
      // 1. ENCRIPTAR PASSWORD

      const newUser = new this.userModel({
        //De esta manera se encripta el password. Se usa el bcrypt y se manda el password y el numero 10 que es el numero de saltos 
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      // 2. GUARDAR USUARIO
      await newUser.save()

      // Luego ademas se puede omitir el enviar en la respuesta el password de la siguiente manera:(Manera sencilla)
      const { password: _, ...user } = newUser.toJSON();

      return user; //Como dato es importante definir en el schema que justamente al no querer enviar el password tendriamos que colocarlo como propiedad opcional


    } catch (error) {
      //console.log(error.code); De esta manera podemos ir depurando y viendo si sale algun codigo de error y  poder manejar las excepciones
      if (error.code === 11000) { // Ese codigo de error es el que sale cuando se tiene una llave duplicada
        throw new BadRequestException(`${createUserDto.email} already exists!`)
      }
      throw new InternalServerErrorException('Something terrible happened')

    }

  }


  async register(registerDto:RegisterDto):Promise<LoginResponse>{

    const user = await this.create( registerDto);
    console.log(user);
    
    return {
      user:user,
      token: this.getJwtToken({id:user._id})
    }



  }

  async login(loginDto: LoginDto):Promise<LoginResponse> {
    // Es siempre una buena idea desestructurar las propiedades que ocuparmos para tener mayor orden y legibilitdad

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Not valid credentials - email');
    }
    
    if( !bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials - password');

    }
    const {password:_, ...userResponse} = user.toJSON();
    //En esta parte de la misma manera se puede agregar un token o propiedades. Se puede customizar la manera de enviar la respuesta
    return {
      user:userResponse,
      token: this.getJwtToken({id:user.id})
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  // De esta manera obtenemos el jwt 
  getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
