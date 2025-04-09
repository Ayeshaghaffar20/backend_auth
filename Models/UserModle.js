import mongoose from "mongoose";

const userScheme = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: '0' },
    IsAccountVerified: { type: Boolean, default: 'false' },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: '0' },

});

const User = mongoose.model("authUser", userScheme)

export default User