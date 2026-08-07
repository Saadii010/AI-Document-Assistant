import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnotation extends Document {
  userId: mongoose.Types.ObjectId | string;
  documentId: mongoose.Types.ObjectId | string;
  page: number;
  textSelection?: string;
  highlightColor?: string;
  comment?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnotationSchema = new Schema<IAnnotation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    textSelection: {
      type: String,
      default: '',
    },
    highlightColor: {
      type: String,
      default: 'yellow',
    },
    comment: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AnnotationModel = mongoose.models.Annotation || mongoose.model<IAnnotation>('Annotation', AnnotationSchema);
export default AnnotationModel;
