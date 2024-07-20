import User from "../models/user.js"
import { hashedPassword, comparePassword} from "../helpers/auth.js"
import jwt from "jsonwebtoken";
import { cloudinary } from "../helpers/cloudinary.config.js";

export const signUp = async (req, res) => {
    try {
        const { firstName,lastName, email, password } = req.body
        const image = req.file

        if (!firstName) {
            return res.status(400).json({ success: false, message: "First Name required" })
        }
        if (!lastName) {
            return res.status(400).json({ success: false, message: "Last Name required" })
        }
        if (!email) {
            return res.status(400).json({ success: false, message: "Email required" })
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: "Password required and must be at least 6 characters" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" })
        }

        const hashed = await hashedPassword(password)

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashed
        });

        if (image) {
            try {
                const imagePath = await cloudinary.uploader.upload(image.path);
                user.image = imagePath.secure_url;
                user.imagePublicId = imagePath.public_id;
            }
            catch (err) {
                console.log(err);
                return res.json({ success: false, message: "Error uploading image", err });
            }
        }
        await user.save()

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
        return res.json({ success: true, message: "User registerd successfully",user, token })
    }

    catch (err) {
        console.log("Error creating registration", err.message);
        return res.status(500).json({ message: "Registration failed", err })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email) {
            return res.status(400).json({ success: false, message: "Email required" })
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Passowrd required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 86400 })

        const match = await comparePassword(password, user.password)

        if (!match) {
            return res.status(400).json({ success: false, message: "Wrong password" })
        }
        return res.json({ success: true, message: "Login successful", user, token })
    }
    catch (err) {
        console.log("Error creating registration", err.message);
        return res.status(500).json({ message: "Registration failed", err })
    }
}

