const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment-timezone');

const DailyProfitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false }, 
  date: {
    type: Date,
    default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
  },
  totalDeposits: { type: Number, required: false },
  totalBalances: { type: Number, required: false },
  dailyProfit: { type: Number, required: false }
});

const DailyProfit = mongoose.model('DailyProfit', DailyProfitSchema, 'DailyProfit');

module.exports = DailyProfit;