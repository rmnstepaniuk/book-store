const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, 'Please enter an username'],
		unique: true,
	},
	name: {
		type: String,
		default: '',
	},
	password: {
		type: String,
		required: [true, 'Please enter a password'],
		minlength: [8, 'Password is too short (min: 8 characters)'],
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
});

userSchema.pre('save', async function (next) {
	const salt = await bcrypt.genSalt();
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.pre('findByIdAndUpdate', async function (next) {
	try {
		if (this._update.password) {
			const salt = await bcrypt.genSalt();
			const hashed = await bcrypt.hash(this._update.password, salt);
			this._update.password = hashed;
		}
		next();
	} catch (err) {
		return next(err);
	}
});

// static method to login user
userSchema.statics.login = async function (username, password) {
	const user = await this.findOne({ username });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('incorrect password');
	}
	throw Error('incorrect username');
};

userSchema.statics.hashPassword = async function (password) {
	const salt = await bcrypt.genSalt();
	password = await bcrypt.hash(password, salt);
	return password;
};

// userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('user', userSchema);

module.exports = User;
