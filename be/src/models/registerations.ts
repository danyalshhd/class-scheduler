import mongoose from 'mongoose';

// An interface that describes the properties
// that are requried to create a new Registeration
interface RegisterationAttrs {
  registrationID: string,
  studentID: number,
  instructorID: number,
  classID: number,
  duration: number,
  dateTimeStartOfClass: Date,
}

// An interface that describes the properties
// that a Registeration Model has
interface RegisterationModel extends mongoose.Model<RegisterationDoc> {
  build(attrs: RegisterationAttrs): RegisterationDoc;
}

// An interface that describes the properties
// that a Registeration Document has
interface RegisterationDoc extends mongoose.Document {
  registrationID: string,
  studentID: number,
  instructorID: number,
  classID: number,
  duration: number,
  dateTimeStartOfClass: Date,
}

const registerationSchema = new mongoose.Schema(
  {
    registrationID: {
      type: String,
      required: true,
      nullable: false,
    },
    studentID: {
      type: Number,
    },
    instructorID: {
      type: Number,
    },
    classID: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    dateTimeStartOfClass: {
      type: mongoose.Schema.Types.Date
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.dateTimeStartOfClass = new Date(ret.dateTimeStartOfClass);//convert to dubai time zone
        ret.dateTimeStartOfClass.setHours(ret.dateTimeStartOfClass.getHours() + 4);

        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

registerationSchema.statics.build = (attrs: RegisterationAttrs) => {
  return new Registeration(attrs);
};

const Registeration = mongoose.model<RegisterationDoc, RegisterationModel>('Registeration', registerationSchema);

export { Registeration };
