import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    pic: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/128/1077/1077063.png"
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export { User };
