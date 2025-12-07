const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'restaurant/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG y WEBP'), false);
    }
  }
});

/**
 * Función para eliminar una imagen de Cloudinary
 */
const eliminarImagen = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return null;
    }

    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL de Cloudinary inválida');
    }

    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    const pathWithoutVersion = pathAfterUpload[0].startsWith('v') 
      ? pathAfterUpload.slice(1) 
      : pathAfterUpload;

    const publicIdWithExtension = pathWithoutVersion.join('/');
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('Imagen eliminada de Cloudinary:', publicId, result);
    return result;
  } catch (error) {
    console.error('Error al eliminar imagen de Cloudinary:', error);
    throw error;
  }
};

/**
 * Función para extraer el public_id de una URL de Cloudinary
 */
const extraerPublicId = (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return null;
    }

    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      return null;
    }

    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    const pathWithoutVersion = pathAfterUpload[0].startsWith('v') 
      ? pathAfterUpload.slice(1) 
      : pathAfterUpload;

    const publicIdWithExtension = pathWithoutVersion.join('/');
    return publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
  } catch (error) {
    console.error('Error al extraer public_id:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  upload,
  eliminarImagen,
  extraerPublicId
};
