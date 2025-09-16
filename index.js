// Student Registration for Cultural Events Backend
// Express server with MongoDB connection using Mongoose

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// MongoDB Connection String
const mongoURI = 'mongodb+srv://chandu:9347813563@cluster0.o51plar.mongodb.net/fest_db?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Student Schema Definition
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  event: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Student Model
const Student = mongoose.model('Student', studentSchema);

// API Routes

// GET /students - Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// POST /students - Add new student
app.post('/students', async (req, res) => {
  try {
    const { name, rollNumber, email, phone, event } = req.body;

    // Validate required fields
    if (!name || !rollNumber || !email || !phone || !event) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if roll number already exists
    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this roll number already exists'
      });
    }

    // Create new student
    const newStudent = new Student({
      name,
      rollNumber,
      email,
      phone,
      event
    });

    const savedStudent = await newStudent.save();
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully!',
      data: savedStudent
    });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering student',
      error: error.message
    });
  }
});

// DELETE /students/:id - Delete student by ID
app.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully!',
      data: deletedStudent
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// Serve the frontend - this should be the last route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Handle 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server on dynamic port for Render deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local access: http://localhost:${PORT}`);
});