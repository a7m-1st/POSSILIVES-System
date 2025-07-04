import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import base64
import io
from PIL import Image
import tempfile
import os
from dotenv import load_dotenv

load_dotenv()

API_SECRET = os.getenv("CLOUDINARY_SECRET")

# Configuration       
cloudinary.config( 
    cloud_name = "dmcyzltfq", 
    api_key = "145967985726491", 
    api_secret = API_SECRET,
    secure=True
)

class CloudinaryImageUploader:
    """A service class for uploading images to Cloudinary."""
    
    @staticmethod
    def upload_base64_image(base64_data: str, public_id: str = None, folder: str = "generated_images") -> dict:
        """
        Upload a base64 encoded image to Cloudinary.
        
        Args:
            base64_data: Base64 encoded image data or raw binary data
            public_id: Optional public ID for the image
            folder: Cloudinary folder to store the image
            
        Returns:
            Dictionary containing the upload result with secure_url
        """
        try:
            # Check if input is already binary data
            if isinstance(base64_data, bytes):
                image_data = base64_data
            else:
                # Handle string input - could be base64 or need conversion
                try:
                    # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
                    if base64_data.startswith('data:'):
                        base64_data = base64_data.split(',', 1)[1]
                    
                    # Decode base64 to bytes
                    image_data = base64.b64decode(base64_data)
                except Exception:
                    # If base64 decoding fails, assume it's already binary data encoded as string
                    image_data = base64_data.encode('latin-1')
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
                temp_file.write(image_data)
                temp_file_path = temp_file.name
            
            try:
                # Upload to Cloudinary
                upload_options = {
                    "folder": folder,
                    "resource_type": "image",
                    "format": "png"
                }
                
                if public_id:
                    upload_options["public_id"] = public_id
                
                result = cloudinary.uploader.upload(temp_file_path, **upload_options)
                
                return {
                    "success": True,
                    "secure_url": result["secure_url"],
                    "public_id": result["public_id"],
                    "width": result.get("width"),
                    "height": result.get("height"),
                    "format": result.get("format"),
                    "bytes": result.get("bytes")
                }
            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def upload_from_url(image_url: str, public_id: str = None, folder: str = "generated_images") -> dict:
        """
        Upload an image from a URL to Cloudinary.
        
        Args:
            image_url: URL of the image to upload
            public_id: Optional public ID for the image
            folder: Cloudinary folder to store the image
            
        Returns:
            Dictionary containing the upload result with secure_url
        """
        try:
            upload_options = {
                "folder": folder,
                "resource_type": "image"
            }
            
            if public_id:
                upload_options["public_id"] = public_id
            
            result = cloudinary.uploader.upload(image_url, **upload_options)
            
            return {
                "success": True,
                "secure_url": result["secure_url"],
                "public_id": result["public_id"],
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format"),
                "bytes": result.get("bytes")
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def get_optimized_url(public_id: str, width: int = 500, height: int = 500, crop: str = "auto") -> str:
        """
        Get an optimized URL for an uploaded image.
        
        Args:
            public_id: The public ID of the uploaded image
            width: Desired width
            height: Desired height
            crop: Crop mode (auto, fill, scale, etc.)
            
        Returns:
            Optimized image URL
        """
        optimized_url, _ = cloudinary_url(
            public_id,
            width=width,
            height=height,
            crop=crop,
            gravity="auto",
            fetch_format="auto",
            quality="auto"
        )
        return optimized_url