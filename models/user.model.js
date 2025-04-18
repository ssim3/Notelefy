import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  telegramId : { 
    type : String, 
    required : [true, 'Telegram ID is required!'],
    unique: true,
  },
  
  userName : {
    type: String,
    required : true,
  }

}, { timestamps : true });

const User = mongoose.model('User', userSchema);

export default User;

// { name: 'John Doe', email : 'email@email.com', password : 'password' }