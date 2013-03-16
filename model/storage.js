var mongoose = require('mongoose');
var config = require('./config');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('mongodb connection established');
});
mongoose.connect('mongodb://localhost/test');

/************** Customer **********************/

var customerSchema = mongoose.Schema({
    email: { type: String, unique: true, required : true },
    password: { type: String, required: true },
    firstName : { type: String, required: true },
    lastName : { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: Date,
    cardNumber : { type: String, unique: true, required : true },
    PIN : { type: String, required: true },
    secretQuestion: { type: String, required: true },
    secretAnswer: { type: String, required: true },
    activity : { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    contactByEmail: { type: Boolean, required: true, default : true },
    contactBySMS: { type: Boolean, required: true, default : true }
});

exports.Customer = mongoose.model('Customer', customerSchema);

/************** Transaction **********************/
var transactionSchema = mongoose.Schema({
   amount : { type : Number, required : true }
});