const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

// const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter an username'],
    unique: true
  },
  name: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [8, 'Password is too short (min: 8 characters)']
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// static method to login user
userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username })
  if (user) {
    const auth = await bcrypt.compare(password, user.password)
    if (auth) {
      return user
    }
    throw Error('incorrect password')
  }
  throw Error('incorrect username')
}

// userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('user', userSchema)

module.exports = User
