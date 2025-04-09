import jwt from "jsonwebtoken"

export const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Not Authorized Please Login"
        })

    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)

        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id
        } else {
            return res.status(400).json({
                success: false,
                message: "Not Authorized Please Login"
            })

        }

        next();



    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        })

    }
}

export default userAuth

