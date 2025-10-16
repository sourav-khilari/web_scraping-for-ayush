// import mongoose, { Schema } from 'mongoose';

// const ItemSchema = new Schema({
//   title: { type: String, required: true, index: true },
//   url:   { type: String, required: true, unique: true, index: true }, // dedupe by URL (NO HASH)
//   source: { type: String, required: true, index: true },
//   publishedAt: { type: Date, index: true },

//   company: { type: String },
//   sector:  { type: String, enum: ['ayurveda','yoga_naturopathy','unani','siddha','homeopathy'], required: true, index: true },
//   investmentType: { type: String, enum: ['funding_round','grant','tender','accelerator','event','listing','other'], index: true },

//   investor: { type: [String], default: [] },
//   amount: { type: Number },          // raw numeric amount where possible
//   currency: { type: String },        // 'INR', 'USD', etc

//   summary: { type: String },
//   raw: { type: Schema.Types.Mixed },

//   score: { type: Number, index: true }
// }, { timestamps: true });

// export const Item = mongoose.model('Item', ItemSchema);
import mongoose, { Schema } from 'mongoose';

const ItemSchema = new Schema({
  title: { type: String, required: true, index: true },
  url:   { type: String, required: true, unique: true, index: true },
  source: { type: String, required: true, index: true },
  publishedAt: { type: Date, index: true },

  company: { type: String },

  // ⬇️ Add 'unknown' and a default so non-AYUSH items can be saved temporarily
  sector: {
    type: String,
    enum: ['ayurveda','yoga_naturopathy','unani','siddha','homeopathy','unknown'],
    required: true,
    default: 'unknown',
    index: true
  },

  investmentType: { type: String, enum: ['funding_round','grant','tender','accelerator','event','listing','other'], index: true },

  investor: { type: [String], default: [] },
  amount: { type: Number },
  currency: { type: String },

  summary: { type: String },
  raw: { type: Schema.Types.Mixed },

  score: { type: Number, index: true }
}, { timestamps: true });

export const Item = mongoose.model('Item', ItemSchema);
