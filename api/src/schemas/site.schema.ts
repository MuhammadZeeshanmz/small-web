import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Site {
  @Prop({ required: true, unique: true }) address: string; // "tidepool.zz"
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) html: string; // sanitized, shown in the frame
  @Prop({ required: true }) bodyText: string; // plain text, for search
  @Prop({ required: true }) author: string; // Person.name
}
export const SiteSchema = SchemaFactory.createForClass(Site);
SiteSchema.index({ title: 'text', bodyText: 'text' });