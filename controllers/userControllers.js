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