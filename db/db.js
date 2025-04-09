import mongoose from "mongoose";
import chalk from "chalk";

const URL = process.env.MONGODB_URL

const connectDB = async () => {
    try {
        await mongoose.connect(URL, { dbName: "myDatabase" })
        console.log(chalk.bgBlue.white('connected to MongoDB'));

    } catch (error) {
        console.error(chalk.bgRed.white("error in connecting to db", error));


    }
}

export default connectDB


