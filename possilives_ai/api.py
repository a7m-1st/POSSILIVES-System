import json
from flask import Flask, request, jsonify
import moviepy as mp
import speech_recognition as sr
from flask_cors import CORS
import uuid
from datetime import datetime
import logging

from inference import personality_detection
from jamai import response_generator
from ml import Predictor
from cloudinary_util import CloudinaryImageUploader
from gemini_util import GeminiImageGenerator
import uuid
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def create_image_prompt_from_response(response_text):
    """
    Extract key themes from the response text to create an image generation prompt.
    This function analyzes the future-related text and creates a visual prompt.
    """
    # Convert to lowercase for easier processing
    text_lower = response_text.lower()
    
    # Key themes and their corresponding visual elements
    theme_mappings = {
        # Career/Professional
        'career': 'professional office environment, success, achievement',
        'work': 'modern workplace, productivity, collaboration',
        'business': 'corporate setting, growth charts, handshake',
        'leadership': 'confident person leading team, boardroom',
        'entrepreneur': 'startup environment, innovation, creativity',
        
        # Relationships/Love
        'love': 'romantic sunset, couple holding hands, hearts',
        'relationship': 'two people connecting, warm atmosphere',
        'marriage': 'wedding bells, celebration, unity',
        'family': 'happy family gathering, home warmth',
        'friendship': 'group of friends, laughter, joy',
        
        # Personal Growth
        'growth': 'flourishing tree, upward arrow, transformation',
        'learning': 'books, education, enlightenment',
        'travel': 'scenic destinations, adventure, exploration',
        'adventure': 'mountain peaks, open roads, discovery',
        'creativity': 'art studio, colorful palette, inspiration',
        
        # Health/Wellness
        'health': 'vibrant nature, exercise, wellness',
        'fitness': 'active lifestyle, strength, vitality',
        'peace': 'serene landscape, meditation, calm',
        'happiness': 'bright sunshine, smiling faces, joy',
        
        # Achievement/Success
        'success': 'golden trophy, celebration, achievement',
        'accomplishment': 'mountain summit, victory, triumph',
        'goal': 'target achievement, focus, determination',
        'dream': 'ethereal clouds, stars, aspiration',
        
        # Wealth/Prosperity
        'wealth': 'abundant garden, prosperity symbols, growth',
        'prosperity': 'flowing river, abundance, richness',
        'financial': 'stable foundation, security, growth'
    }
    
    # Extract themes from the text
    found_themes = []
    visual_elements = []
    
    for theme, visual in theme_mappings.items():
        if theme in text_lower:
            found_themes.append(theme)
            visual_elements.append(visual)
    
    # Create a cohesive image prompt
    if visual_elements:
        # Take the first 2-3 most relevant themes to avoid overcrowding
        main_elements = visual_elements[:3]
        base_prompt = f"A beautiful, inspiring vision of the future featuring {', '.join(main_elements)}"
    else:
        # Fallback prompt if no specific themes are detected
        base_prompt = "A beautiful, inspiring vision of a bright and promising future"
    
    # Add style and mood descriptors
    style_elements = [
        "soft lighting",
        "warm colors", 
        "hopeful atmosphere",
        "dreamy quality",
        "cinematic composition",
        "artistic style"
    ]
    
    # Combine elements
    full_prompt = f"{base_prompt}, {', '.join(style_elements[:3])}, high quality, detailed"
    
    return full_prompt

@app.route('/upload/video', methods=['POST'])
def upload_file():
    # Check if a file is part of the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']

    # If the user does not select a file, the browser submits an empty file without a filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file
    file_path = 'uploaded_file.mp4'  # Change as needed
    file.save(file_path)

    # Extract audio and perform speech-to-text
    audio_file = extract_audio(file_path)
    text = speech_to_text(audio_file)

    # Get personality results
    personality_results = personality_detection(text)

    # Return the results as JSON
    return jsonify(personality_results), 200

def extract_audio(file_path: str) -> str:
    """Extract audio from video or audio file."""
    audio_path = f"{file_path}.wav"
    if file_path.endswith('.mp4'):
        video = mp.VideoFileClip(file_path)
        video.audio.write_audiofile(audio_path)
    else:
        # Assume it's an audio file
        audio_path = file_path  # Already an audio file
    return audio_path

def speech_to_text(audio_file: str) -> str:
    """Convert speech to text using SpeechRecognition."""
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)  # You can use other recognizers
    return text

@app.route('/generate-response', methods=['POST'])
def generate_response():
    # Get data from the request
    data = request.json
    details = str(data.get("details"))
    big_5_personality = str(data.get("big_5_personality"))
    social_circle = data.get("social_circle")
    habits = str(data.get("habits"))
    note = data.get("note")

    # Call the response_generator function
    response_text = response_generator(details, big_5_personality, social_circle, habits, note)
    
    # Generate an image based on the response text
    try:
        # Extract key themes from the response for image generation
        image_prompt = create_image_prompt_from_response(response_text)
        
        # Generate and upload image
        generator = GeminiImageGenerator()
        generation_result = generator.generate_image_from_prompt(image_prompt)
        
        image_url = None
        if generation_result["success"]:
            # Upload to Cloudinary
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            public_id = f"future_vision_{timestamp}_{unique_id}"
            
            uploader = CloudinaryImageUploader()
            upload_result = uploader.upload_base64_image(
                base64_data=generation_result["image_data"],
                public_id=public_id,
                folder="future_visions"
            )
            
            if upload_result["success"]:
                image_url = upload_result["secure_url"]
        
        # Return both response text and image URL
        return jsonify({
            "response_text": response_text,
            "image_url": image_url,
            "image_prompt": image_prompt if image_url else None
        })
        
    except Exception as e:
        # If image generation fails, still return the text response
        return jsonify({
            "response_text": response_text,
            "image_url": None,
            "error": f"Image generation failed: {str(e)}"
        })

predictor = Predictor()
predictor.prepPredictor()

# @app.route("/predict-personality", methods=["POST", "GET"])
# def predict_personality():
#     if request.method == "POST":
#         value = json.loads(request.data.decode("UTF-8"))
#         input = [value['text']]
#         print(input)
#         result = predictor.predict(input)
#         response = jsonify({'output': str(result)})
#         response.headers.add('Access-Control-Allow-Origin', '*')
#         #return jsonify(prediction=result)
#         return response
#     elif request.method == "GET":
#         print('get req recieved')
#         return "testing :)"
#     else:
#         print('unknow req')

@app.route('/generate-image', methods=['POST'])
def generate_and_upload_image():
    """
    Generate an image from a text prompt using Gemini AI and upload to Cloudinary.
    
    Expected JSON payload:
    {
        "prompt": "A beautiful sunset over mountains",
        "folder": "generated_images" (optional),
        "public_id": "custom_id" (optional)
    }
    
    Returns:
    {
        "success": true,
        "cloudinary_url": "https://res.cloudinary.com/...",
        "public_id": "generated_123",
        "prompt": "Original prompt",
        "generation_time": "2025-01-20T10:30:00Z"
    }
    """
    try:
        # Get data from request
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'prompt' in request body"
            }), 400
        
        prompt = data.get('prompt')
        folder = data.get('folder', 'generated_images')
        custom_public_id = data.get('public_id')
        
        if not prompt.strip():
            return jsonify({
                "success": False,
                "error": "Prompt cannot be empty"
            }), 400
        
        # Initialize the image generator
        generator = GeminiImageGenerator()
        
        # Generate image using Gemini
        generation_result = generator.generate_image_from_prompt(prompt)
        
        if not generation_result["success"]:
            return jsonify({
                "success": False,
                "error": f"Image generation failed: {generation_result.get('error', 'Unknown error')}",
                "prompt": prompt
            }), 500
        
        # Generate unique public ID if not provided
        if not custom_public_id:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            custom_public_id = f"generated_{timestamp}_{unique_id}"
        
        # Upload to Cloudinary
        uploader = CloudinaryImageUploader()
        upload_result = uploader.upload_base64_image(
            base64_data=generation_result["image_data"],
            public_id=custom_public_id,
            folder=folder
        )
        
        if not upload_result["success"]:
            return jsonify({
                "success": False,
                "error": f"Cloudinary upload failed: {upload_result.get('error', 'Unknown error')}",
                "prompt": prompt
            }), 500
        
        # Return success response
        response_data = {
            "success": True,
            "cloudinary_url": upload_result["secure_url"],
            "public_id": upload_result["public_id"],
            "prompt": prompt,
            "generation_time": datetime.now().isoformat(),
            "image_details": {
                "width": upload_result.get("width"),
                "height": upload_result.get("height"),
                "format": upload_result.get("format"),
                "bytes": upload_result.get("bytes")
            }
        }
        
        # Include text response if available
        if generation_result.get("text_response"):
            response_data["text_response"] = generation_result["text_response"]
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "prompt": data.get('prompt', '') if 'data' in locals() else ''
        }), 500

@app.route('/generate-optimized-image', methods=['POST'])
def generate_and_get_optimized_url():
    """
    Generate an image and return both original and optimized URLs.
    
    Expected JSON payload:
    {
        "prompt": "A beautiful sunset over mountains",
        "width": 500 (optional, default: 500),
        "height": 500 (optional, default: 500),
        "crop": "auto" (optional, default: "auto")
    }
    """
    try:
        # Get data from request
        data = request.json
        if not data or 'prompt' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'prompt' in request body"
            }), 400
        
        prompt = data.get('prompt')
        width = data.get('width', 500)
        height = data.get('height', 500)
        crop = data.get('crop', 'auto')
        
        # First generate and upload the image
        generation_response = generate_and_upload_image()
        generation_data = generation_response[0].get_json()
        
        if not generation_data.get("success"):
            return generation_response
        
        # Get optimized URL
        uploader = CloudinaryImageUploader()
        optimized_url = uploader.get_optimized_url(
            public_id=generation_data["public_id"],
            width=width,
            height=height,
            crop=crop
        )
        
        # Add optimized URL to response
        generation_data["optimized_url"] = optimized_url
        generation_data["optimization_params"] = {
            "width": width,
            "height": height,
            "crop": crop
        }
        
        return jsonify(generation_data), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/analyze-habits', methods=['POST'])
def analyze_habits():
    """
    Endpoint to analyze habit data and generate recommendations using Gemini AI
    """
    try:
        data = request.get_json()
        
        # Extract the analysis prompt from the request
        analysis_prompt = data.get('prompt', '')
        
        if not analysis_prompt:
            return jsonify({
                'success': False,
                'error': 'No analysis prompt provided'
            }), 400
          # Initialize Gemini generator
        generator = GeminiImageGenerator()
        
        # Generate text-only recommendations using dedicated text function
        system_instruction = "You are an expert habit analyst and life coach. Provide detailed, actionable recommendations based on the habit data provided. Focus on practical steps, behavioral psychology principles, and sustainable habit formation strategies. Respond in brief, no more than 50 words."
        
        result = generator.generate_text_only(
            prompt=analysis_prompt,
            system_instruction=system_instruction,
            model="gemini-2.5-flash-preview-05-20"
        )
        
        if result["success"]:
            return jsonify({
                'success': True,
                'recommendations': result["text"],
                'prompt': analysis_prompt,
                'system_instruction': system_instruction
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get("error", "No recommendations generated"),
                'prompt': analysis_prompt
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/validate-habit', methods=['POST'])
def validate_habit():
    """
    Validate a habit using Gemini AI to check if it's:
    1. Not a duplicate
    2. Not NSFW/inappropriate
    3. A valid positive habit
    
    Expected JSON payload:
    {
        "title": "Exercise daily",
        "description": "Go for a 30-minute walk",
        "existing_habits": ["Read books", "Meditate"]
    }
    
    Returns:
    {
        "is_valid": true/false,
        "reason": "explanation if invalid",
        "suggestion": "improvement suggestion if invalid"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "is_valid": False,
                "reason": "No data provided",
                "suggestion": "Please provide habit details"
            }), 400
        
        title = data.get('title', '').strip()
        description = data.get('description', '')
        existing_habits = data.get('existing_habits', [])
        
        if not title:
            return jsonify({
                "is_valid": False,
                "reason": "Habit title cannot be empty",
                "suggestion": "Please provide a descriptive title for your habit"
            }), 400
        
        # Initialize Gemini client
        try:
            generator = GeminiImageGenerator()
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            return fallback_validation(title, description, existing_habits)
        
        # Prepare the validation prompt
        existing_habits_text = "\n".join([f"- {habit}" for habit in existing_habits])
        
        system_instruction = """You are a habit validation expert. Your task is to validate habits for a personal development app.

        Validation criteria:
        1. The habit should be positive and focused on personal growth/health/productivity
        2. It should not be NSFW, inappropriate, harmful, or offensive
        3. It should not be a duplicate or very similar to existing habits
        4. It should be actionable and specific enough to be tracked

        Respond ONLY with a JSON object in this exact format:
        {
            "is_valid": true/false,
            "reason": "explanation if invalid, null if valid",
            "suggestion": "improvement suggestion if invalid, null if valid"
        }

        Be strict but fair in your validation."""

        prompt = f"""Please validate this habit:

Title: "{title}"
Description: "{description or 'No description provided'}"

Existing habits to check for duplicates:
{existing_habits_text if existing_habits_text else "No existing habits"}

Validate according to the criteria and respond with the JSON format specified."""

        # Call Gemini for validation
        result = generator.generate_text_only(
            prompt=prompt,
            system_instruction=system_instruction,
            model="gemini-2.5-flash-preview-05-20"
        )
        
        if not result["success"]:
            logger.error(f"Gemini API error: {result.get('error', 'Unknown error')}")
            return fallback_validation(title, description, existing_habits)
        
        # Parse Gemini response
        try:
            response_text = result["text"].strip()
            # Extract JSON from response if it's wrapped in markdown or other text
            if "```json" in response_text:
                start = response_text.find("```json") + 7
                end = response_text.find("```", start)
                response_text = response_text[start:end].strip()
            elif "{" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                response_text = response_text[start:end]
            
            validation_result = json.loads(response_text)
            
            return jsonify({
                "is_valid": validation_result.get("is_valid", False),
                "reason": validation_result.get("reason"),
                "suggestion": validation_result.get("suggestion")
            }), 200
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Raw response: {result['text']}")
            return fallback_validation(title, description, existing_habits)
            
    except Exception as e:
        logger.error(f"Error during habit validation: {e}")
        return jsonify({
            "is_valid": False,
            "reason": "Internal server error during validation",
            "suggestion": "Please try again later"
        }), 500

def fallback_validation(title, description, existing_habits):
    """Fallback validation when Gemini is unavailable"""
    
    # Basic validation
    if not title:
        return jsonify({
            "is_valid": False,
            "reason": "Habit title cannot be empty",
            "suggestion": "Please provide a descriptive title for your habit"
        }), 400
    
    if len(title) < 3:
        return jsonify({
            "is_valid": False,
            "reason": "Habit title is too short",
            "suggestion": "Please provide a title with at least 3 characters"
        }), 400
    
    if len(title) > 100:
        return jsonify({
            "is_valid": False,
            "reason": "Habit title is too long",
            "suggestion": "Please keep the title under 100 characters"
        }), 400
    
    # Check for duplicates
    for existing_habit in existing_habits:
        if existing_habit.strip().lower() == title.lower():
            return jsonify({
                "is_valid": False,
                "reason": "A habit with this title already exists",
                "suggestion": "Try modifying the title to make it more specific"
            }), 400
    
    # Basic NSFW check
    nsfw_keywords = [
        "sex", "porn", "nude", "explicit", "adult", "xxx", "erotic",
        "violence", "kill", "murder", "suicide", "self-harm", "drug",
        "alcohol", "drunk", "high", "weed", "cocaine", "heroin"
    ]
    
    content_to_check = (title + " " + description).lower()
    for keyword in nsfw_keywords:
        if keyword in content_to_check:
            return jsonify({
                "is_valid": False,
                "reason": "Habit content is not appropriate for a personal development app",
                "suggestion": "Please create a habit focused on positive personal growth"
            }), 400
    
    return jsonify({"is_valid": True}), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'possilives-ai'})

@app.route('/test-text-generation', methods=['POST'])
def test_text_generation():
    """Test endpoint to verify text-only generation with system instruction."""
    try:
        data = request.get_json()
        prompt = data.get('prompt', 'Hello there')
        
        generator = GeminiImageGenerator()
        
        # Test with cat persona as requested
        result = generator.generate_text_only(
            prompt=prompt,
            system_instruction="You are a cat. Your name is Neko.",
            model="gemini-2.0-flash-preview"
        )
        
        if result["success"]:
            return jsonify({
                "success": True,
                "message": "Text generation is working",
                "response": result["text"],
                "prompt": prompt,
                "system_instruction": result["system_instruction"]
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Unknown error"),
                "message": "Text generation failed"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Test failed"
        }), 500

@app.route('/test-image-generation', methods=['GET'])
def test_image_generation():
    """Test endpoint to verify image generation is working."""
    try:
        # Test with a simple prompt
        test_prompt = "A simple red circle on a white background"
        
        generator = GeminiImageGenerator()
        result = generator.generate_image_from_prompt(test_prompt)
        
        if result["success"]:
            return jsonify({
                "success": True,
                "message": "Image generation is working",
                "image_data_length": len(result["image_data"]),
                "has_text_response": bool(result.get("text_response"))
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("error", "Unknown error"),
                "message": "Image generation failed"
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),            "message": "Test failed"
        }), 500

if __name__ == '__main__':
    # Run the Flask app
    print("Starting PossiLives AI Service...")
    print("This service provides AI-powered personality analysis, future predictions, and habit analysis")
    app.run(host='0.0.0.0', port=5000, debug=True)