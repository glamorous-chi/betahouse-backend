// Middlewares work in between routes and controllers
import jwt from "jsonwebtoken";
import User from "../models/user.js"

export const isLoggedIn = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({success: false, message:"Invalid token or no token provided"})
    }

    const token = authHeader.split(" ")[1]; //This extracts just the token and removes the "Bearer" in front of the token.
    
    // verify the token
    // Whatever you use in signing the token, is the same you will use to verify the token.
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err){
                res.status(403).json({success:false, message: "Invalid token"})
            }
            else{
                req.user = decodedToken
                console.log(req.user);
                console.log({decodedToken});
                next();
            }
        })
    }
    
    else{
        res.status(401).json({success: false, message: "You are not authorized"})
    }
}
export const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id
        // OR
        // const {_id} = req.user;
        const user = await User.findById({_id:userId})

        if(!user){
            return res.status(404).json({success: false, message: "User not found"})
        }
        // Check for the role of the user
        if(user.role === 1){
            next();
        }
        else{
            return res.status(403).json({success: false, message: "You are not authorized"});
        }
       

    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Error checking if user is admin"})
    }
}