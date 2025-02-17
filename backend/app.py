from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
import anthropic
import logging
import json

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app with explicit debug mode
app = Flask(__name__)
app.debug = os.getenv('FLASK_ENV') == 'development'

# Enable CORS
CORS(app)

# Load environment variables
load_dotenv()
claude_api_key = os.getenv('ANTHROPIC_API_KEY', '')
if not claude_api_key:
    raise ValueError("No Claude API key found in environment variables")

# Initialize Claude client
claude = anthropic.Anthropic(api_key=claude_api_key)

@app.route('/generate-flashcards', methods=['POST'])
def generate_flashcards():
    logger.info("Generate flashcards endpoint hit")
    if not request.is_json:
        logger.error("Request is not JSON")
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.json
    logger.info(f"Received data: {data}")
    
    book_content = data.get('bookContent')
    if not book_content:
        logger.error("No book content provided")
        return jsonify({"error": "No book content provided"}), 400

    try:
        message = claude.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1000,
            temperature=0.7,
            system="You are a helpful AI that creates educational flashcards. You must respond with ONLY valid JSON, no other text.",
            messages=[
                {
                    "role": "user",
                    "content": f"""Create 5 focused flashcards from this text. Return ONLY a JSON object with this structure:
                    {{"flashcards": [
                        {{"question": "...", "answer": "..."}}
                    ]}}
                    Content: {book_content}"""
                }
            ]
        )
        
        response_content = message.content[0].text
        
        # Extract just the JSON part if there's extra text
        try:
            # Find the first '{' and last '}'
            json_start = response_content.find('{')
            json_end = response_content.rfind('}') + 1
            if json_start >= 0 and json_end > 0:
                json_str = response_content[json_start:json_end]
                flashcards_data = json.loads(json_str)
            else:
                raise ValueError("No JSON object found in response")
                
            return jsonify(flashcards_data)
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing JSON response: {str(e)}")
            return jsonify({
                'error': 'Invalid response format',
                'details': str(e)
            }), 500

    except Exception as e:
        logger.error(f"Error generating flashcards: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Failed to generate flashcards',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    # Run the app with debug mode
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=5001, debug=True)
