const mongoose = require('mongoose')
const Schema = mongoose.Schema

require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    type: String,
    required: true
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Book', bookSchema)
