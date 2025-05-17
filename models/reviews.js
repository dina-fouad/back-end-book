const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const reviewsSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },

    user: {
      
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: "user", 
    },

    book: {
  
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "book", 
    },
  },
  {
    timestamps: true,
  }
);

const review = mongoose.model("review", reviewsSchema);
module.exports = review;
