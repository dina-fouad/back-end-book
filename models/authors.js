const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorsSchema = new Schema(
  {
    name: String,
    nationality: String,
    image: { type: String, default: "image.png" },
  },
  {
    timestamps: true,
  }
);

const author = mongoose.model("author", authorsSchema);

module.exports = author;
