import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Person {
  @Prop({ required: true, unique: true }) name: string;
}
export const PersonSchema = SchemaFactory.createForClass(Person);