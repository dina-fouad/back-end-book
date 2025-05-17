const { boolean } = require("joi");
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    title: String,
    description: String,
    author: {
      /// for make a collections between author and book in mongodb
      type: mongoose.Schema.Types.ObjectId, //id of authors
      required: true,
      ref: "author", // refrence from any file ?
    },
 
    cover: {
      type: String,
      default: "default-img.png",
    },
    price: Number,
  
  },
  {
    timestamps : true
  }
);

const book = mongoose.model("book", bookSchema);
module.exports = book;
