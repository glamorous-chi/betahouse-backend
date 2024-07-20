import express from 'express';
import {login, signUp} from "../controllers/auth.js"
import {upload} from '../helpers/multer.js'
const router = express.Router()

router.post("/signup",upload.single('image'),signUp)
router.post("/login", login)

export default router;