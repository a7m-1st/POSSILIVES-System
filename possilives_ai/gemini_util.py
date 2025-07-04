from dotenv import load_dotenv
import os
from typing import Optional, List
import base64
from google import genai
from google.genai.types import GenerateContentConfig, Part

load_dotenv()

class GeminiImageGenerator:
    """A class to handle Gemini AI image generation tasks."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the Gemini image generator.
        
        Args:
            api_key: Optional API key. If not provided, will use GEMINI_API_KEY from environment.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        self.client = genai.Client(api_key=self.api_key)
    
    def generate_content(
        self, 
        prompt: str, 
        model: str = "gemini-2.0-flash-preview-image-generation",
        response_modalities: List[str] = None
    ) -> genai.types.GenerateContentResponse:
        """Generate content using Gemini AI.
        
        Args:
            prompt: The text prompt for generation
            model: The model to use for generation
            response_modalities: List of response types (default: ['TEXT', 'IMAGE'])
            
        Returns:
            The response from the Gemini API
        """
        if response_modalities is None:
            response_modalities = ['TEXT', 'IMAGE']
        
        response = self.client.models.generate_content(
            model=model,
            contents=prompt,
            config=GenerateContentConfig(
                response_modalities=response_modalities
            )
        )
        return response
    
    def extract_image_data(self, response: genai.types.GenerateContentResponse) -> Optional[str]:
        """Extract base64 image data from Gemini response.
        
        Args:
            response: The response object from generate_content
            
        Returns:
            Base64 encoded image data or None if no image found
        """
        try:
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    return part.inline_data.data
            return None
        except (IndexError, AttributeError):
            return None
    
    def extract_text_response(self, response: genai.types.GenerateContentResponse) -> Optional[str]:
        """Extract text response from Gemini response.
        
        Args:
            response: The response object from generate_content
            
        Returns:
            Text response or None if no text found
        """
        try:
            for part in response.candidates[0].content.parts:
                if part.text is not None:
                    return part.text
            return None
        except (IndexError, AttributeError):
            return None
    
    def generate_image_from_prompt(self, prompt: str) -> dict:
        """Generate an image from a text prompt and return structured data.
        
        Args:
            prompt: The text prompt for image generation
            
        Returns:
            Dictionary containing success status, image data, and any text response
        """
        try:
            response = self.generate_content(prompt, response_modalities=['IMAGE', 'TEXT'])
            
            image_data = self.extract_image_data(response)
            text_response = self.extract_text_response(response)
            
            if image_data:
                return {
                    "success": True,
                    "image_data": image_data,
                    "text_response": text_response,
                    "prompt": prompt
                }
            else:
                return {
                    "success": False,
                    "error": "No image generated",
                    "text_response": text_response,
                    "prompt": prompt
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "prompt": prompt
            }
    
    def generate_text_only(
        self, 
        prompt: str, 
        system_instruction: Optional[str] = None,
        model: str = "gemini-2.0-flash-preview"
    ) -> dict:
        """Generate text-only content using Gemini AI with optional system instruction.
        
        Args:
            prompt: The text prompt for generation
            system_instruction: Optional system instruction to guide the AI's behavior
            model: The model to use for text generation (default: gemini-2.0-flash-preview)
            
        Returns:
            Dictionary containing success status and generated text
        """
        try:
            config = GenerateContentConfig(
                response_modalities=['TEXT']
            )
            
            # Add system instruction if provided
            if system_instruction:
                config.system_instruction = system_instruction
            
            response = self.client.models.generate_content(
                model=model,
                contents=prompt,
                config=config
            )
            
            text_response = self.extract_text_response(response)
            
            if text_response:
                return {
                    "success": True,
                    "text": text_response,
                    "prompt": prompt,
                    "system_instruction": system_instruction
                }
            else:
                return {
                    "success": False,
                    "error": "No text response generated",
                    "prompt": prompt
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "prompt": prompt
            }

def main():
    """Main function to demonstrate usage."""
    try:
        generator = GeminiImageGenerator()
        
        prompt = "Generate the word PEKOM, along side our bro 'Sayyid'. Make it colorful and bright"
        
        result = generator.generate_image_from_prompt(prompt)
        
        if result["success"]:
            print("Image generated successfully!")
            print(f"Image data length: {len(result['image_data'])} characters")
            if result["text_response"]:
                print(f"Text response: {result['text_response']}")
        else:
            print(f"Error generating image: {result['error']}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()