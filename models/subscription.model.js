import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Subscription is required!'],
    trim: true,
    minLength: 2,
    maxLength: 100,
  },

  price: {
    type: Number,
    required: [true, 'Subscription price is required!'],
    min: [0, 'Price must be greater than 0!'],
  },

  currency: {
    type: String,
    enum: ['USD', 'EUR', "GBP", 'SGD'],
    required: true,
    default: 'SGD'
  },

  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
  },

  renewaldate: {
    type: Date,
    required: true,
    validate: {
      validator: (value) => value > new Date(),
      message: 'Renewal date must be after today!'
    }
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  }

}, { timestamp: true })

// Create Model
const Subscription = new mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
