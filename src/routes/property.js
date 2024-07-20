import express from 'express';
import { createProperty, deletePropertyById, getAllProperties, getBySlug, getPropertyById, searchProperty, updateProperty} from '../controllers/property.js';
import { upload } from '../helpers/multer.js';
import { isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create',upload.single("image"), createProperty);
router.get("/all", getAllProperties)
router.get("/:propertyId", getPropertyById)
router.get("/slug/:slug", getBySlug)
router.post("/search", searchProperty)
router.put("/update/:propertyId", upload.single("image"),updateProperty)
router.delete("/:propertyId", deletePropertyById)

export default router;