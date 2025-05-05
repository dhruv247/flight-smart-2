const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, require: true }
})

module.exports = mongoose.model("City", citySchema);