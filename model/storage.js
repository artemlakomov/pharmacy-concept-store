var mongoose = require('mongoose');
var config = require('./config');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', function(err){
    console.error(err);
});

db.once('open', function callback () {
    console.log('mongodb connection established');
});

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
    contactBySMS: { type: Boolean, required: true, default : true } ,
    activationCode: { type: String, required: false }
});

exports.Customer = mongoose.model('Customer', customerSchema);

/************** Transaction **********************/
var transactionSchema = mongoose.Schema({
   amount : { type : Number, required : true }
});