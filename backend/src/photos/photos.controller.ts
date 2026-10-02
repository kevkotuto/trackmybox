import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';

@ApiTags('Photos')
@Controller('api/v1/photos')
export class PhotosController {
  constructor(private readonly service: PhotosService) {}

  @Get()
  @ApiOperation({ summary: 'List all photos' })
  @ApiQuery({ name: 'containerId', required: false })
  findAll(@Query('containerId') containerId?: string) {
    return this.service.findAll(containerId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a photo (multipart) or create with URL (JSON)' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (file) {
      const baseUrl = process.env.BASE_URL || 'https://trackmybox.generale-ci.com';
      const url = `${baseUrl}/uploads/photos/${file.filename}`;
      const dto: CreatePhotoDto = {
        url,
        containerId: body.containerId,
        caption: body.caption,
      };
      return this.service.create(dto);
    }

    // JSON body with URL
    return this.service.create(body as CreatePhotoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a photo' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
