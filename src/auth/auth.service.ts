import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private userModel:Model<User>
  ){}

  async create(createUserDto: CreateUserDto) {

    try {
      const newUser = new this.userModel( createUserDto);
      
      //TODO: 1. ENCRIPTAR PASSWORD
      //TODO: 2. GUARDAR USUARIO
      //TODO: 3. GENRERAR JWT

      return await newUser.save()

    } catch (error) {
      //console.log(error.code); De esta manera podemos ir depurando y viendo si sale algun codigo de error y  poder manejar las excepciones
      if (error.code === 11000) { // Ese codigo de error es el que sale cuando se tiene una llave duplicada
        throw new BadRequestException(`${ createUserDto.email} already exists!`)
      }
      throw new InternalServerErrorException('Something terrible happened')
      
    }
    console.log(createUserDto);
    
    return 'This action adds a new auth';
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
}
