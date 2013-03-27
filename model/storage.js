var mongoose = require('mongoose');
var config = require('./config').init();
mongoose.connect(config.mongo);

var db = mongoose.connection;

db.on('error', function (err) {
    console.error(err);
});

db.once('open', function callback() {
    console.log('mongodb connection established');
});

/************** Customer **********************/

var customerSchema = mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: Date,
    cardNumber: { type: String, unique: true, required: true },
    PIN: { type: String, required: true },
    secretQuestion: { type: String, required: true },
    secretAnswer: { type: String, required: true },
    activity: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    contactByEmail: { type: Boolean, required: true, default: true },
    contactBySMS: { type: Boolean, required: true, default: true },
    activationCode: { type: String, required: false }
});

exports.Customer = mongoose.model('Customer', customerSchema);

/************** Transaction **********************/
var transactionSchema = mongoose.Schema({
    cardNumber: { type: String, unique: false, required: true },
    description: { type: String, required: true },
    receiptNumber: { type: String, required: false },
    salesPoint: { type: String, required: false },
    amount: { type: Number, required: true },
    points: { type: Number, required: true },
    date: { type: Date, required: true }
});

exports.Transaction = mongoose.model('Transaction', transactionSchema);

exports.addCustomerTransaction = function (cardNumber, receiptNumber, description, amount, points, date, next) {
    var t = new exports.Transaction();
    t.cardNumber = cardNumber;
    t.description = description;
    t.receiptNumber = receiptNumber;
    t.amount = amount;
    t.points = points;
    t.date = date;

    t.save(function (err) {
        if (next)next(err);
    });
}

exports.calculatePointsBalance = function (cardNumber, next) {
    exports.Transaction.aggregate(
        { $match : { cardNumber : cardNumber } },
        { $group: {
            _id: null,
            balance: { $sum: '$points' }
        }
        }
        , function (err, result) {
            if(err) next(err, 0);
            else next(null, result.length > 0 ? result[0].balance : 0);
        });
}