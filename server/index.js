
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const EmployeeModel = require("./model/Employee");

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/employee", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Now you can use ObjectId
    const { ObjectId } = mongoose.Types;

    // Define your routes here

    app.post("/login", (req, res) => {
      const { email, password } = req.body;
      EmployeeModel.findOne({ email: email }).then((user) => {
        if (user) {
          if (user.password === password) {
            res.json({ success: true, userId: user._id });
          } else {
            res.json({ success: false, message: "The password is incorrect" });
          }
        } else {
          res.json({ success: false, message: "No record existed" });
        }
      });
    });

    app.post("/register", (req, res) => {
      EmployeeModel.create(req.body)
        .then((employees) => res.json(employees))
        .catch((err) => res.json(err));
    });

    app.post("/logout", (req, res) => {
      const { userId } = req.body;
      EmployeeModel.findByIdAndDelete(userId)
        .then(() => res.json("User data deleted successfully"))
        .catch(err => res.json(err));
    });

    app.post("/addComplaint", upload.single('image'), (req, res) => {
      console.log('Request body:', req.body);
      console.log('Uploaded file:', req.file);
    
      const { userId, hostel, complaintType, roomNo, floor, name, description } = req.body;
      const image = req.file ? req.file.path : '';
    
      EmployeeModel.findById(userId)
        .then(user => {
          if (user) {
            const complaint = {
              hostel,
              complaintType,
              roomNo,
              floor,
              name,
              description,
              image,
              resolved: false
            };
            user.complaints.push(complaint);
            user.save()
              .then(() => res.json({ success: true }))
              .catch(err => res.json({ success: false, message: "Error saving complaint" }));
          } else {
            res.json({ success: false, message: "User not found" });
          }
        })
        .catch(err => res.json({ success: false, message: "Error finding user" }));
    });
    
    

    app.get("/getAllComplaints", (req, res) => {
      EmployeeModel.find({})
        .then(users => {
          const allComplaints = users.flatMap(user => 
            user.complaints.map(complaint => ({
              ...complaint.toObject(),
              userId: user._id
            }))
          );
          res.json({ success: true, complaints: allComplaints });
        })
        .catch(err => res.json({ success: false, message: "Error fetching complaints" }));
    });
    


    app.delete("/deleteComplaint/:userId/:complaintId", (req, res) => {
      const { userId, complaintId } = req.params;
    
      EmployeeModel.findById(userId)
        .then(user => {
          if (user) {
            // Find the index of the complaint to be deleted
            const complaintIndex = user.complaints.findIndex(c => c._id.toString() === complaintId);
            if (complaintIndex !== -1) {
              // Remove the complaint from the array
              user.complaints.splice(complaintIndex, 1);
              user.save()
                .then(() => res.json({ success: true }))
                .catch(err => res.json({ success: false, message: "Error saving user" }));
            } else {
              res.json({ success: false, message: "Complaint not found" });
            }
          } else {
            res.json({ success: false, message: "User not found" });
          }
        })
        .catch(err => res.json({ success: false, message: "Error finding user" }));
    });
    

   

    // Start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
