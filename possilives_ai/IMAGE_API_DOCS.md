# Image Generation API Documentation

This API provides endpoints for generating images using Gemini AI and uploading them to Cloudinary.

## Prerequisites

1. **Environment Variables**: Create a `.env` file with the following variables:
   ```
   CLOUDINARY_SECRET=your_cloudinary_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

2. **Install Dependencies**: 
   ```bash
   pip install -r requirements.txt
   ```

## API Endpoints

### 1. Generate and Upload Image

**Endpoint**: `POST /generate-image`

**Description**: Generates an image from a text prompt using Gemini AI and uploads it to Cloudinary.

**Request Body**:
```json
{
  "prompt": "A beautiful sunset over mountains",
  "folder": "generated_images",  // optional, default: "generated_images"
  "public_id": "custom_id"       // optional, auto-generated if not provided
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "cloudinary_url": "https://res.cloudinary.com/dmcyzltfq/image/upload/v123456789/generated_images/generated_20250120_103000_abc12345.png",
  "public_id": "generated_20250120_103000_abc12345",
  "prompt": "A beautiful sunset over mountains",
  "generation_time": "2025-01-20T10:30:00.123456",
  "image_details": {
    "width": 1024,
    "height": 1024,
    "format": "png",
    "bytes": 245760
  },
  "text_response": "Generated a beautiful sunset scene..."  // optional
}
```

**Response** (Error - 400/500):
```json
{
  "success": false,
  "error": "Error description",
  "prompt": "Original prompt"
}
```

### 2. Generate Optimized Image

**Endpoint**: `POST /generate-optimized-image`

**Description**: Generates an image and returns both original and optimized URLs.

**Request Body**:
```json
{
  "prompt": "A beautiful sunset over mountains",
  "width": 500,     // optional, default: 500
  "height": 500,    // optional, default: 500
  "crop": "auto"    // optional, default: "auto"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "cloudinary_url": "https://res.cloudinary.com/dmcyzltfq/image/upload/v123456789/generated_images/generated_20250120_103000_abc12345.png",
  "optimized_url": "https://res.cloudinary.com/dmcyzltfq/image/upload/c_auto,g_auto,h_500,w_500/generated_images/generated_20250120_103000_abc12345.png",
  "public_id": "generated_20250120_103000_abc12345",
  "prompt": "A beautiful sunset over mountains",
  "generation_time": "2025-01-20T10:30:00.123456",
  "optimization_params": {
    "width": 500,
    "height": 500,
    "crop": "auto"
  },
  "image_details": {
    "width": 1024,
    "height": 1024,
    "format": "png",
    "bytes": 245760
  }
}
```

### 3. Test Image Generation

**Endpoint**: `GET /test-image-generation`

**Description**: Test endpoint to verify that image generation is working properly.

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Image generation is working",
  "image_data_length": 123456,
  "has_text_response": true
}
```

## Usage Examples

### Using curl

```bash
# Basic image generation
curl -X POST http://localhost:8000/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A majestic dragon flying over a medieval castle"}'

# Generate optimized image
curl -X POST http://localhost:8000/generate-optimized-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cute cat wearing a wizard hat",
    "width": 300,
    "height": 300,
    "crop": "fill"
  }'

# Test the service
curl http://localhost:8000/test-image-generation
```

### Using JavaScript/Fetch

```javascript
// Generate and upload image
async function generateImage(prompt) {
  try {
    const response = await fetch('http://localhost:8000/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        folder: 'my_custom_folder'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Image URL:', result.cloudinary_url);
      return result.cloudinary_url;
    } else {
      console.error('Error:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

// Usage
generateImage("A serene lake with mountains in the background")
  .then(url => {
    if (url) {
      // Use the image URL
      document.getElementById('generated-image').src = url;
    }
  });
```

### Using Python requests

```python
import requests

def generate_image(prompt, width=500, height=500):
    url = 'http://localhost:8000/generate-optimized-image'
    data = {
        'prompt': prompt,
        'width': width,
        'height': height,
        'crop': 'auto'
    }
    
    response = requests.post(url, json=data)
    result = response.json()
    
    if result.get('success'):
        return {
            'original_url': result['cloudinary_url'],
            'optimized_url': result['optimized_url'],
            'public_id': result['public_id']
        }
    else:
        print(f"Error: {result.get('error')}")
        return None

# Usage
result = generate_image("A futuristic city at night with neon lights")
if result:
    print(f"Original: {result['original_url']}")
    print(f"Optimized: {result['optimized_url']}")
```

## Error Handling

Common error responses:

1. **Missing prompt** (400):
   ```json
   {
     "success": false,
     "error": "Missing 'prompt' in request body"
   }
   ```

2. **Empty prompt** (400):
   ```json
   {
     "success": false,
     "error": "Prompt cannot be empty"
   }
   ```

3. **Image generation failed** (500):
   ```json
   {
     "success": false,
     "error": "Image generation failed: API key invalid",
     "prompt": "Your prompt here"
   }
   ```

4. **Cloudinary upload failed** (500):
   ```json
   {
     "success": false,
     "error": "Cloudinary upload failed: Invalid credentials",
     "prompt": "Your prompt here"
   }
   ```

## Configuration

### Cloudinary Settings

The Cloudinary configuration is set in `cloudinary.py`:
- **Cloud Name**: `dmcyzltfq`
- **API Key**: `145967985726491`
- **API Secret**: Set via `CLOUDINARY_SECRET` environment variable

### Gemini AI Settings

- **Model**: `gemini-2.0-flash-preview-image-generation`
- **Response Modalities**: `['IMAGE']` for image-only generation
- **API Key**: Set via `GEMINI_API_KEY` environment variable

## Running the Service

1. Set up environment variables
2. Install dependencies: `pip install -r requirements.txt`
3. Run the Flask app: `python main.py`
4. The API will be available at `http://localhost:8000`

## Notes

- Generated images are stored in the `generated_images` folder in Cloudinary by default
- Public IDs are auto-generated with timestamp and UUID if not provided
- Images are uploaded in PNG format for best quality
- The service supports both original and optimized image URLs
- All responses include detailed metadata about the generated images
