import bcrypt from "bcrypt"
import Jwt from "jsonwebtoken"
import User from "../Models/UserModle.js"
import transporter from "../db/nodemailer.js"
import userAuth from "../middleware/userAuth.js"

export const register = async (req, res) => {

    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(404).json({
            success: false,
            message: "Missing Details"
        })
    }

    try {

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(404).json({
                success: false,
                message: "User already exits"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = new User({ name, email, password: hashPassword })
        await user.save();

        const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000


        });

        //send welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: '🎉 Welcome to MyAuthApp! Let’s Get Started!',
            text: `Thank you for signing up! ${email} Enjoy our services`

        }

        try {

            await transporter.sendMail(mailOptions);
            console.log("✅ Email Sent Successfully");

        } catch (error) {
            console.error("❌ Email Sending Failed:", error);

        }
        return res.status(200).json({
            success: true,
            user: user
        })



    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })

    }

}

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email"
            })
        }

        const isMatched = await bcrypt.compare(password, user.password)

        if (!isMatched) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            })

        }

        const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000


        })

        return res.status(200).json({
            success: true
        })


    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })

    }

}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production",


        })


        return res.status(200).json({
            success: true,
            message: "Logged Out"
        })
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
}


//Send verification OTP to user's email
export const sendVerifyOtp = async (req, res) => {
    try {

        console.log("Received request body:", req.body);  // ✅ Debugging

        const { userId } = req.body
        console.log("userId", userId);



        // ✅ Ensure userId is provided
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await User.findById(userId)
        console.log("found user", user);


        // ✅ Check if user exists
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.IsAccountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account Verified Already"
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.verifyOtp = otp
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        //send OTP
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `your OTP is ${otp}. Verify your account using this otp `

        }

        try {
            await transporter.sendMail(mailOptions)
            console.log("✅ OTP sent Successfully");

        } catch (error) {
            console.error("❌ OTP sending fail", error);


        }

        res.status(200).json({
            success: true,
            message: "Verification OTP sent on email"
        })


    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })

    }
}


// Verify Email
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body

    if (!userId || !otp) {
        return res.status(400).json({
            success: false,
            message: "Missing Details"
        })
    }

    try {

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        if (user.verifyOtp === "" || user.verifyOtp != otp) {
            console.log("Stored OTP:", user.verifyOtp);
            console.log("Received OTP:", otp);
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            })
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            })
        }

        user.IsAccountVerified = true
        user.verifyOtp = ' '
        user.verifyOtpExpireAt = 0

        await user.save()

        res.status(200).json({
            success: true,
            message: "Email Verified successfully"
        })





    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }

}

// Check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({ success: true })
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
}

// Send Password reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Emial is required"
        })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not Found"
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save();

        //send OTP
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset OTP',
            text: `Your otp for resetting your password is ${otp}
            Use this otp to proceed with resetting your password `

        }

        try {
            await transporter.sendMail(mailOptions)
            console.log("✅ OTP sent Successfully");

        } catch (error) {
            console.error("❌ OTP sending fail", error);


        }

        res.status(200).json({
            success: true,
            message: "Otp sent to your email"
        })

    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
}


// Reset User Password 
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Email, OTP and New Password are required "
        })
    }

    try {

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not Found"
            })
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired"
            })
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashPassword,
            user.resetOtp = ""
        user.resetOtpExpireAt = 0

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset Successfully"
        })


    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })

    }

}