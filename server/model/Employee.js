const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  hostel: String,
  complaintType: String,
  roomNo: String,
  floor: String,
  name: String,
  description: String,
  image: String,
  resolved: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'employees' } // Ensure userId is correctly stored
});


const EmployeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: String,
  program: String,
  year: String,
  hostel: String,
  floor: String,
  room: String,
  complaints: [ComplaintSchema], 
  
});

const EmployeeModel = mongoose.model("employees", EmployeeSchema);

module.exports = EmployeeModel;
