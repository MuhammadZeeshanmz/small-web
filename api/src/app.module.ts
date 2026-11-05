import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from './schemas/site.schema';
import { Person, PersonSchema } from './schemas/person.schema';
import { Visit, VisitSchema } from './schemas/visit.schema';
import { WebController } from './web/web.controller';
import { WebService } from './web/web.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ uri: c.get<string>('MONGO_URI') }),
    }),
    MongooseModule.forFeature([
      { name: Site.name, schema: SiteSchema },
      { name: Person.name, schema: PersonSchema },
      { name: Visit.name, schema: VisitSchema },
    ]),
  ],
  controllers: [WebController],
  providers: [WebService],
})
export class AppModule {}