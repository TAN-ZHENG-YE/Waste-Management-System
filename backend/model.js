const mongoose = require('mongoose');

// Helper function to get Malaysia time
function getMalaysiaTime() {
    const now = new Date();
    return new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for Malaysia timezone
}

// Define MongoDB schemas and models
const userSchema = new mongoose.Schema({
    fullName: String,
    contactNumber: String,
    email: { type: String, unique: true },
    password: String,
    communityName: String,
    residentialAddress: String,
    role: String,
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    profilePic: { type: String, default: '' },
    createdAt: {
        type: Date,
        default: getMalaysiaTime
    },
    resetToken: String,
    resetTokenExpiry: Date,
});

const pickupSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: {
        type: Date,
        set: function(date) {
            return new Date(new Date(date).getTime() + (8 * 60 * 60 * 1000));
        }
    },
    createdAt: {
        type: Date,
        default: getMalaysiaTime
    },
    wasteType: [String],
    note: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
});

const issueSchema = new mongoose.Schema({
    userName: String,
    communityName: String,
    issueType: String,
    location: String,
    description: String,
    photo: String,
    resolved: Boolean,
    createdAt: {
        type: Date,
        default: getMalaysiaTime
    },
});

const posterSchema = new mongoose.Schema({
    name: String,
    url: String,
    communityName: String,
    uploadedAt: {
        type: Date,
        default: getMalaysiaTime
    }
});

const communitySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    pickupSchedule: { type: String, required: true },
    createdAt: {
        type: Date,
        default: getMalaysiaTime
    }
});

const notificationSchema = new mongoose.Schema({
    type: String,
    message: String,
    communityName: String,
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: {
        type: Date,
        default: getMalaysiaTime
    }
});

const statisticsSchema = new mongoose.Schema({
    community: String,
    pickupStatistics: Array,
    recyclingRates: Array,
    issueStatistics: Array,
    communityActiveMembers: Array,
})

const User = mongoose.model('User', userSchema);
const Pickup = mongoose.model('Pickup', pickupSchema);
const Issue = mongoose.model('Issue', issueSchema);
const Poster = mongoose.model('Poster', posterSchema);
const Community = mongoose.model('Community', communitySchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Statistics = mongoose.model('Statistics', statisticsSchema);

module.exports = {
    User,
    Pickup,
    Issue,
    Poster,
    Community,
    Notification,
    Statistics
};