import User from "../Models/UserModle.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body

        const user = await User.findById(userId)

        if (!user) {
            res.status(400).json({
                success: false,
                message: "User not Found"
            })

        }

        res.status(200).json({
            success: true,
            userData: {
                name: user.name,
                IsAccountVerified: user.IsAccountVerified
            }
        })


    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }

}

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            data: users
            // data: 'abc'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
};