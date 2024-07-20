import express from "express"
import { getAllUsers, getOneUser, updateUser, deleteUser} from "../controllers/user.js"
import { isAdmin, isLoggedIn } from "../middlewares/auth.js"
import { upload } from "../helpers/multer.js"
const router = express.Router()

router.get("/users", getAllUsers)
router.get("/user/:userId", getOneUser)
router.put("/update", isLoggedIn, upload.single("image"),updateUser)
router.delete("/delete/:userId",isLoggedIn, isAdmin, deleteUser)

export default router
