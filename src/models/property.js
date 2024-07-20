import mongoose from "mongoose";
const { Schema } = mongoose;

const propertySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    location: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    type:{
      type: String,
      required: true
    },
    bedroom: {
      type: Number,
    },
    bathroom: {
      type: Number,
    },
    image: {
      url: {
        type: String,
      },
      imagePublicId: {
        type: String,
      }
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", propertySchema)