const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require('bcrypt');
require('dotenv').config();
const authRoutes = require('./routes/auth.routes');
const { User, Pickup, Issue, Poster, Community, Notification, Statistics } = require('./model');

const app = express();
const upload = multer();

// Serve static files from public folder
app.use(express.static('public'));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: MONGODB_URI is not defined in production environment.');
    process.exit(1);
}

// Fallback for development only
const dbUri = MONGODB_URI || "mongodb+srv://max:RFO2mB6n6G9dbtdt@cluster0.tijon.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(dbUri)
    .then(() => {
        console.log('connected to database');
    })
    .catch((error) => {
        console.log('connection failed:', error.message);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });


// Middleware
const allowedOrigins = [
  'http://localhost:4200',
  process.env.FRONTEND_URL,
  'https://*.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches wildcard
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/auth', authRoutes);

// authentication middleware
const secretKey = process.env.JWT_SECRET;

if (!secretKey && process.env.NODE_ENV === 'production') {
    console.error('FATAL ERROR: JWT_SECRET is not defined in production environment.');
    process.exit(1);
}

// Use fallback only in development
const jwtSecret = secretKey || 's3cUr3K3y!@#12345$%^&*()_+QwErTy';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

async function checkExistingAdmin(communityName) {
  const existingAdmin = await User.findOne({ 
    communityName: communityName,
    role: 'admin'
  });
  return existingAdmin;
}

// Routes
app.post("/api/user/register", async (req, res) => {
  try {
    const { fullName, contactNumber, email, password, communityName, residentialAddress, role } = req.body;
    
    // If registering as admin, check if community already has an admin
    if (role === 'admin') {
      const existingAdmin = await checkExistingAdmin(communityName);
      if (existingAdmin) {
        return res.status(400).json({ err: "This community already has an admin" });
      }
    }

    if (!email || !password) {
      return res.status(400).json({ err: "Email and password are required" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ err: "User already exists" });
    }
    
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const newUser = new User({ 
      fullName, 
      contactNumber, 
      email, 
      password: hashedPassword,  
      communityName, 
      residentialAddress,
      role,
      isVerified: false,
      verificationToken,
      profilePic: "/image/profile-pic-default.webp"
    });
    
    // Send verification email
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.warn('Email credentials not configured. Skipping email verification.');
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ err: "Email service not configured. Please contact administrator." });
      }
      // In development, allow user creation without email
      await newUser.save();
      return res.status(200).json({ msg: "Registration successful (email verification skipped in development)" });
    }
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: 'Verification Needed from WasteWise Website',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Welcome to WasteWise!</h2>
          <p>Thank you for registering with WasteWise. To complete your registration, please verify your account by clicking the link below:</p>
          <a href="${backendUrl}/api/user/verify/${verificationToken}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Your Account</a>
          <p>If you did not register for this account, please ignore this email.</p>
          <p>Best regards,<br>The WasteWise Team</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ err: "Error sending email" });
      } else {
        await newUser.save();
        // After saving the user, create or update the community
        const community = await Community.findOneAndUpdate(
            { name: communityName },
            { 
                name: communityName,
                address: residentialAddress,
                pickupSchedule: "Not set", // Default value
                $addToSet: { users: newUser._id } // Add user to community
            },
            { upsert: true, new: true }
        );
        res.status(200).json({ msg: "Registration successful, please check your email to verify your account" });
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ err: "Server error" });
  }
});

app.get("/api/user/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ err: "Invalid token" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    res.redirect(`${frontendUrl}/user-login?verified=true`);
  } catch (error) {
    res.status(500).json({ err: "Server error" });
  }
});

app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ err: "Email and password are required" });
    }
    
    // Find user by email only
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ err: "Invalid email or password" });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ err: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ err: "Email not verified. Please check your email to verify your account." });
    }

    // Create a clean user object without sensitive data (password)
    const userData = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'user',  
        communityName: user.communityName,
        contactNumber: user.contactNumber,
        residentialAddress: user.residentialAddress,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        createdAt: user.createdAt
    };

    // Generate token
    const token = jwt.sign({ id: user._id, role: userData.role }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ 
        token, 
        data: userData  // Send clean user data without password
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ err: "Server error" });
  }
});


// Update user profile
app.put("/api/user/profile/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Get the user's current data before update
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ err: "User not found" });
    }

    // If admin is changing community name, check if target community already has an admin
    if (currentUser.role === 'admin' && updateData.communityName && updateData.communityName !== currentUser.communityName) {
      const existingAdmin = await User.findOne({ 
        communityName: updateData.communityName,
        role: 'admin'
      });
      
      if (existingAdmin) {
        return res.status(400).json({ err: `This community (${updateData.communityName}) is already managed by another admin` });
      }

      // Update all related models with the new community name
      try {
        // Start a session for transaction
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          // Update Community model
          await Community.findOneAndUpdate(
            { name: currentUser.communityName },
            { name: updateData.communityName }
          );

          // Update all users for that community
          await User.updateMany(
            { communityName: currentUser.communityName },
            { communityName: updateData.communityName }
          );

          // Update Pickups for that community
          await Pickup.updateMany(
            { communityName: currentUser.communityName },
            { communityName: updateData.communityName }
          );

          // Update Issues for that community
          await Issue.updateMany(
            { communityName: currentUser.communityName },
            { communityName: updateData.communityName }
          );

          // Update Posters for that community
          await Poster.updateMany(
            { communityName: currentUser.communityName },
            { communityName: updateData.communityName }
          );

          // Update Notifications for that community
          await Notification.updateMany(
            { communityName: currentUser.communityName },
            { communityName: updateData.communityName }
          );
        });
        session.endSession();
      } catch (error) {
        console.error('Error updating related models:', error);
        return res.status(500).json({ err: "Failed to update community references" });
      }
    }

    // If regular user is changing community, update their pickups and issues
    if (!currentUser.role === 'admin' && updateData.communityName && updateData.communityName !== currentUser.communityName) {
      try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          // Update user's pickups
          await Pickup.updateMany(
            { userId: userId },
            { communityName: updateData.communityName }
          );

          // Update user's issues
          await Issue.updateMany(
            { userId: userId },
            { communityName: updateData.communityName }
          );

          // Update notifications targeting this user
          await Notification.updateMany(
            { targetUsers: userId },
            { communityName: updateData.communityName }
          );
        });
        session.endSession();
      } catch (error) {
        console.error('Error updating user related models:', error);
        return res.status(500).json({ err: "Failed to update user references" });
      }
    }

    // Update the user profile
    const user = await User.findByIdAndUpdate(
      userId, 
      updateData,
      { new: true }
    ).select('-password -verificationToken');

    res.status(200).json({ msg: "Profile updated successfully", data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ err: "Server error" });
  }
});



// Fetch user profile
app.get("/api/user/profile/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password -verificationToken');
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ err: "Server error" });
  }
});




app.post('/api/user/change-password', authenticateToken, async (req, res) => {
  try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
          return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      
      res.json({ message: 'Password changed successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error changing password' });
  }
});



app.post("/api/user/schedulePickup", async (req, res) => {
  try {
    const { userId, date, wasteType, note } = req.body;

    // Validate incoming data
    if (!userId || !date || !wasteType ) {
      return res.status(400).json({ err: "Missing required fields" });
    }

    const newPickup = new Pickup({
      userId,
      date: new Date(date),
      wasteType,
      note,
      status: 'Pending'
    });

    await newPickup.save();

    res.status(200).json({ msg: "Schedule successful" });
  } catch (error) {
    console.error('Error scheduling pickup:', error);
    res.status(500).json({ err: "Server error" });
  }
});

app.get("/api/user/viewHistory/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // Get the user to find their community name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    // Find pickups filtered by userId
    const pickups = await Pickup.find({ 
      userId
    }).sort({ date: -1 });
    
    res.status(200).json({ msg: "View history successful", data: pickups });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ err: "Server error" });
  }
});

app.post("/api/user/reportIssue", async (req, res) => {
    try {
        const { userName, communityName, issueType, description, location, photo } = req.body;

        const newIssue = new Issue({
            userName,
            communityName,
            issueType,
            location,
            description,
            photo,
            resolved: false
        });

        await newIssue.save();

        res.status(200).json({ msg: "Report issue successful" });
    } catch (error) {
        res.status(500).json({ err: "Server error" });
    }
});

app.get("/api/user/statistics/:community/:category", async (req, res) => {
  try {
      const community = req.params.community;
      const category = req.params.category;
      let data;
      if (category === "all") {
          data = await Statistics.findOne({community: community});
      } else {
          data = await Statistics.findOne({community: community}).select(category);
      }
      res.status(200).json({ msg: "Statistics fetched successfully", data });
  } catch (error) {
      res.status(500).json({ err: "Server error" });
  }
});



app.get("/api/admin/issues/:community", async (req, res) => {
  try {
    const community = req.params.community;

    const issues = await Issue.find({ communityName: community }).sort({ createdAt: -1 });
      res.status(200).json({ issues });
  } catch (error) {
      res.status(500).json({ err: "Server error" });
  }
});


app.put("/api/admin/resolveIssue/:id", async (req, res) => {
  try {
    const issueId = req.params.id;
    await Issue.findByIdAndUpdate(issueId, { resolved: true });
    res.status(200).json({ msg: "Issue resolved successfully" });
  } catch (error) {
    res.status(500).json({ err: "Server error" });
  }
});


  
  
  // Community Management
  app.get("/api/admin/communityDetails", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ err: "User not found" });
        }

        // Get all users with the same community name
        const totalMembers = await User.countDocuments({ 
            communityName: user.communityName,
            role: { $ne: 'admin' } // Exclude admins from count
        });

        const community = await Community.findOne({ name: user.communityName });
        if (!community) {
            return res.status(404).json({ err: "Community not found" });
        }

        res.status(200).json({
            name: community.name,
            address: community.address,
            pickupSchedule: community.pickupSchedule,
            totalMembers: totalMembers
        });
    } catch (error) {
        console.error("Error fetching community details:", error);
        res.status(500).json({ err: "Server error" });
    }
  });

  app.put("/api/admin/communityDetails", authenticateToken, async (req, res) => {
    try {
      const { address, pickupSchedule, name } = req.body;
      
      // Find the community by name
      const community = await Community.findOne({ name });
      if (!community) {
        return res.status(404).json({ err: "Community not found" });
      }

      // Update the community details
      const updatedCommunity = await Community.findOneAndUpdate(
        { name },
        { 
          address,
          pickupSchedule
        },
        { new: true }
      );

      res.status(200).json({
        message: "Community details updated successfully",
        data: updatedCommunity
      });
    } catch (error) {
      console.error("Error updating community details:", error);
      res.status(500).json({ err: "Server error" });
    }
  });
  
  

  
  app.get("/api/admin/communityStats", authenticateToken, async (req, res) => {
    try {
      // TODO: Fetch real community statistics from database
      const communityStats = {
        totalMembers: 152,
        activeRequests: 7,
        totalWasteCollected: 1250,
        recyclingRate: 35
      };
      res.status(200).json(communityStats);
    } catch (error) {
      res.status(500).json({ err: "Server error" });
    }
  });
  
  // User Management Page
  app.get("/api/admin/users", authenticateToken, async (req, res) => {
    try {
      const admin = await User.findById(req.user.id).select('communityName');
      if (!admin) {
        return res.status(404).json({ err: "Admin not found" });
      }

      // Include all necessary fields in the select
      const users = await User.find({ 
        communityName: admin.communityName,
        role: { $ne: 'admin' } // Exclude other admins from the list
      }).select('fullName email communityName _id');
      
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ err: "Server error" });
    }
  });
  
  app.delete("/api/admin/users/:id", authenticateToken, async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ err: "Server error" });
    }
  });



// Announcements
app.post("/api/admin/announcement", authenticateToken, async (req, res) => {
  try {
      // Log the user data for debugging
      console.log('User data:', req.user);
      
      if (!req.user || req.user.role !== 'admin') {
          console.log('Access denied - User role:', req.user?.role);
          return res.status(403).json({ err: "Only admins can send announcements" });
      }

      const { announcement, audience } = req.body;
      
      if (!announcement || !audience) {
          return res.status(400).json({ err: "Announcement and audience are required" });
      }

      const communityUsers = await User.find({ 
          communityName: audience,
          role: 'user'  // Only target users, exclude admins
      }).select('_id');

      if (communityUsers.length === 0) {
          return res.status(404).json({ err: "No users found in this community" });
      }

      const targetUsers = communityUsers.map(user => user._id);

      const newNotification = new Notification({
          type: 'announcement',
          message: announcement,
          communityName: audience,
          targetUsers: targetUsers,
          deletedBy: []
      });

      await newNotification.save();

      res.status(200).json({ 
          msg: "Announcement sent successfully to all your community members",
          targetCount: targetUsers.length 
      });
  } catch (error) {
      console.error('Error sending announcement:', error);
      res.status(500).json({ err: "Server error" });
  }
});


// Upload poster endpoint
app.post('/api/admin/uploadPoster', authenticateToken, upload.single('poster'), async (req, res) => {
  try {
    const { communityName } = req.body;
    
    // Convert image to base64 string
    const base64Image = req.file.buffer.toString('base64');
    // Create a data URL that can be used directly in <img> tags
    const posterUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    const newPoster = new Poster({
      name: req.file.originalname,
      url: posterUrl,  // Store the complete data URL
      communityName
    });
    
    await newPoster.save();
    console.log('Poster saved:', newPoster);
    res.status(200).json({ message: 'Poster uploaded successfully' });
  } catch (error) {
    console.error('Error uploading poster:', error);
    res.status(500).json({ error: 'Failed to upload poster' });
  }
});

// Get community posters endpoint
app.get('/api/posters/:communityName', authenticateToken, async (req, res) => {
  try {
    const { communityName } = req.params;
    const requestingUser = await User.findById(req.user.id);
    
    console.log('Request from user:', {
      userId: req.user.id,
      userCommunity: requestingUser?.communityName,
      requestedCommunity: communityName,
      userRole: requestingUser?.role,
      userDetails: requestingUser
    });
    
    // Check if user belongs to the requested community
    if (!requestingUser || requestingUser.communityName !== communityName) {
      console.log('User not authorized:', {
        userId: req.user.id,
        userCommunity: requestingUser?.communityName,
        requestedCommunity: communityName,
        reason: !requestingUser ? 'User not found' : 'Community mismatch'
      });
      return res.status(200).json([]); // Return empty array instead of error
    }
    
    // Find posters for specific community
    const posters = await Poster.find({ communityName })
      .sort({ uploadedAt: -1 }) // Newest first
      .limit(10);              // Only get last 10 posters
    
    console.log('Found posters:', {
      count: posters.length,
      community: communityName,
      posters: posters.map(p => ({
        id: p._id,
        name: p.name,
        community: p.communityName,
        url: p.url.substring(0, 50) + '...'  
      }))
    });
    
    res.status(200).json(posters);
  } catch (error) {
    console.error('Error fetching posters:', error);
    res.status(500).json({ error: 'Failed to fetch posters' });
  }
});



// Send messages type of notification to specific users
app.post('/api/admin/send-message', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId, communityName, message } = req.body;

    // Validate required fields
    if (!userId || !message) {
      return res.status(400).json({ message: 'User ID and message are required' });
    }

    // Create a new notification
    const notification = new Notification({
      type: 'admin_message',
      message: message,
      communityName: communityName,
      targetUsers: [userId],
      deletedBy: [],
      createdAt: new Date(),
    });

    await notification.save();
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get notifications for a community
app.get('/api/notifications/:communityName', authenticateToken, async (req, res) => {
  try {
    const { communityName } = req.params;
    const userId = req.user.id;

    const query = {
      targetUsers: new mongoose.Types.ObjectId(userId),
      deletedBy: { $ne: new mongoose.Types.ObjectId(userId) },
      $or: [
        { communityName: communityName },
        { communityName: 'all' }
      ]
    };
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error in notifications endpoint:', error);
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: error.message
    });
  }
});

//User delete notification
app.put('/api/notifications/:notificationId/delete', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Find the notification and add the user to deletedBy array
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// For handle clearing all notifications for the current user
app.put('/api/notifications/clearAll', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update all notifications to add the user to the deletedBy array
    await Notification.updateMany(
      { targetUsers: userId },
      { $addToSet: { deletedBy: userId } }
    );

    res.json({ message: 'All notifications cleared for the user' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Error clearing notifications' });
  }
});




// Get pickup requests for admin's community
app.get('/api/admin/pickup-requests/:communityName', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Fetching requests for community:', req.params.communityName);

    // Find all users in the community
    const communityUsers = await User.find({ 
      communityName: req.params.communityName 
    }).select('_id');

    const userIds = communityUsers.map(user => user._id);

    // Find pickups for all users in the community
    const requests = await Pickup.find({ 
      userId: { $in: userIds }  // Find pickups where userId is in the list of community users
    }).populate({
      path: 'userId',
      select: 'fullName contactNumber residentialAddress'
    });

    console.log('Found requests:', requests);

    const formattedRequests = requests.map(request => ({
      _id: request._id,
      userName: request.userId.fullName,
      userContact: request.userId.contactNumber,
      residentialAddress: request.userId.residentialAddress,
      date: request.date,
      wasteType: request.wasteType,
      note: request.note,
      status: request.status || 'Pending',
      communityName: req.params.communityName
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching pickup requests:', error);
    res.status(500).json({ message: 'Error fetching pickup requests' });
  }
});

// Update pickup request status
app.put('/api/admin/pickup-requests/:requestId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // First find the request and populate user data
    const request = await Pickup.findByIdAndUpdate(
      req.params.requestId,
      { status: req.body.status },
      { new: true }
    ).populate('userId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Get the admin's community name
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    try {
      const formattedDate = request.date ? new Date(request.date).toLocaleDateString() : 'unknown date';

      // Create notification for the user
      const notification = new Notification({
        type: 'pickup_status',
        message: `Your pickup request for ${formattedDate} has been ${req.body.status.toLowerCase()}`,
        communityName: admin.communityName,
        targetUsers: [request.userId._id],
        deletedBy: [],
        createdAt: new Date()
      });

      await notification.save();

      // Send back the updated request data
      const response = {
        message: 'Request updated successfully',
        request: {
          _id: request._id,
          userName: request.userId.fullName,
          userContact: request.userId.contactNumber,
          residentialAddress: request.userId.residentialAddress,
          date: request.date,
          wasteType: request.wasteType,
          note: request.note,
          status: request.status,
          communityName: admin.communityName
        }
      };

      res.json(response);

    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      const response = {
        message: 'Request updated successfully but notification failed',
        request: {
          _id: request._id,
          userName: request.userId.fullName,
          userContact: request.userId.contactNumber,
          residentialAddress: request.userId.residentialAddress,
          date: request.date,
          wasteType: request.wasteType,
          note: request.note,
          status: request.status,
          communityName: admin.communityName
        }
      };

      res.json(response);
    }
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ 
      message: 'Error updating request',
      error: error.message,
    });
  }
});

// route to get all communities
app.get('/api/communities', async (req, res) => {
  try {
    const communities = await Community.find().select('name');
    res.json(communities.map(community => community.name));
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ message: 'Error fetching communities' });
  }
});

//  route to get single user details
app.get('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add logging to debug
    console.log('Fetching user with ID:', req.params.userId);

    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }


    // Send all user fields
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      contactNumber: user.contactNumber,
      communityName: user.communityName,
      residentialAddress: user.residentialAddress,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

module.exports = app;