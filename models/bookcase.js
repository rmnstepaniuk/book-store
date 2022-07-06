const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookcaseSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	books: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'book',
		},
	],
});

const Bookcase = mongoose.model('bookcase', bookcaseSchema);

module.exports = Bookcase;
