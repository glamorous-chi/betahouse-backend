import Property from "../models/property.js";
import { cloudinary } from "../helpers/cloudinary.config.js";
import slugify from "slugify";

export const createProperty = async (req, res) => {
  try {
    const { name, location, price,type, bedroom, bathroom } = req.body;
    const imageFile = req.file;

    if (!name || !location || !price || !bedroom || !bathroom || !imageFile ||!type) {
      return res.status(400).json({ error: "All fields are required, including the image" });
    }

    const slug = slugify(name);

    let uploadedImage;
    try {
      const imageResult = await cloudinary.uploader.upload(imageFile.path);
      uploadedImage = {
        url: imageResult.secure_url,
        imagePublicId: imageResult.public_id,
      };
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    const newProperty = new Property({
      name,
      slug,
      location,
      price,
      type,
      bedroom,
      bathroom,
      image: uploadedImage,
    });

    await newProperty.save();

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newProperty,
    });
  } catch (err) {
    console.error("Error creating property:", err);
    res.status(500).json({ success: false, message: "Failed to create property", error: err });
  }
};

export const getOneProperty = async (req, res) => {
  try {
    const { propertyId } = req.params
    const property = await Property.findById(propertyId)

    if (!property) {
      return res.status(404).json({ success: false, message: "property not found" });
    }
    return res.json({ success: true, message: "Property retrieved successfully", property });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const getPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const property = await Property.findOne({ slug })

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    return res.json({ success: true, message: "Property retrieved successfully", property });
  }
  catch (err) {
    return res.json({ success: false, message: err.message })
  }
}

export const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { name, description, price, category, quantity } = req.body;
    const imageFile = req.file; // Assuming multer middleware is used to handle file uploads

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Update property fields
    property.name = name || property.name;
    property.description = description || property.description;
    property.price = price || property.price;
    property.category = category || property.category;
    property.quantity = quantity || property.quantity;

    if (name) {
      const nameSlug = slugify(name);
      property.slug = nameSlug || property.slug;
    }

    // Delete previously uploaded image from Cloudinary if a new image is uploaded
    if (imageFile && property.image && property.image.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(property.image.imagePublicId);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
    }

    // Upload new image to Cloudinary
    let uploadedImage = property.image;

    if (imageFile) {
      try {
        const imageResult = await cloudinary.uploader.upload(imageFile.path);
        uploadedImage = {
          url: imageResult.secure_url,
          imagePublicId: imageResult.public_id,
        };
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return res.status(500).json({ success: false, message: "Failed to upload image", error: err });
      }
    }

    // Update property image
    property.image = uploadedImage;

    // Save updated property
    await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: property,
    });
  } catch (err) {
    console.error("Error updating property:", err.message);
    res.status(500).json({ success: false, message: "Error updating property", error: err.message });
  }
};


// Get all properties with pagination
export const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const properties = await Property.find().skip(skip).limit(limit);
    const totalProperties = await Property.countDocuments();

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalProperties / limit),
      propertyCount: totalProperties,
      properties,
    });
  } catch (err) {
    console.error("Error fetching all properties:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch properties", error: err.message });
  }
};

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    res.status(200).json({ success: true, property });
  } catch (err) {
    console.error("Error fetching property by ID:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch property", error: err.message });
  }
};

// Get property by slug
export const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const property = await Property.findOne({ slug });

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    res.status(200).json({ success: true, property });
  } catch (err) {
    console.error("Error fetching property by slug:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch property", error: err.message });
  }
};

// Delete property by ID
export const deletePropertyById = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findByIdAndDelete(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    res.status(200).json({ success: true, message: `Property ID: ${propertyId} deleted successfully` });
  }
  catch (err) {
    console.error("Error deleting property by ID:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete property", error: err.message });
  }
};

// Search properties with pagination
export const searchProperty = async (req, res) => {
  const { terms } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Split the terms query parameter into an array of terms
    const searchTerms = terms ? terms.split(',') : [];

    // Build the regex search for each term
    const searchRegexes = searchTerms.map(term => new RegExp(term, 'i'));

    const properties = await Property.find({
      $and: [
        { isAvailable: true },
        {
          $or: [
            { location: { $in: searchRegexes } },
            { type: { $in: searchRegexes } },
          ],
        },
      ],
    }).skip(skip).limit(limit);

    const totalProperties = await Property.countDocuments({
      $and: [
        { isAvailable: true },
        {
          $or: [
            { location: { $in: searchRegexes } },
            { type: { $in: searchRegexes } },
          ],
        },
      ],
    });

    res.json({
      currentPage: page,
      propertiesFound: totalProperties,
      totalPages: Math.ceil(totalProperties / limit),
      properties,
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ success: false, message: 'Failed to search properties', errorMsg: error.message });
  }
};

