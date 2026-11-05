import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const VIA = ['typed', 'link', 'back', 'forward', 'history', 'search'] as const;
export const STATUS = ['shown', 'nowhere'] as const;

@Schema()
export class Visit {
  @Prop({ required: true }) person: string;
  @Prop({ required: true }) address: string;
  @Prop({ required: true }) at: Date;
  @Prop({ required: true, enum: VIA }) via: string;
  @Prop({ required: true, enum: STATUS }) status: string;
}
export const VisitSchema = SchemaFactory.createForClass(Visit);
VisitSchema.index({ person: 1, at: -1 });