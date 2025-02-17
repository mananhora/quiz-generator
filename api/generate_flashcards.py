import os
import json
import anthropic

def generate_flashcards(book_content):
    claude = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY', ''))
    
    message = claude.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        temperature=0.7,
        system="You are a helpful AI that creates educational flashcards. You must respond with ONLY valid JSON, no other text.",
        messages=[{
            "role": "user",
            "content": f"""Create 5 focused flashcards from this text. Return ONLY a JSON object with this structure:
            {{"flashcards": [
                {{"question": "...", "answer": "..."}}
            ]}}
            Content: {book_content}"""
        }]
    )
    
    response_content = message.content[0].text
    json_start = response_content.find('{')
    json_end = response_content.rfind('}') + 1
    json_str = response_content[json_start:json_end]
    return json.loads(json_str)

# For Vercel
def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            }
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        book_content = body.get('bookContent')
        
        if not book_content:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'No book content provided'})
            }
        
        flashcards_data = generate_flashcards(book_content)
        
        return {
            'statusCode': 200,
            'body': json.dumps(flashcards_data),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Failed to generate flashcards',
                'details': str(e)
            })
        }

# For local development
if __name__ == "__main__":
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    from dotenv import load_dotenv
    
    # Load environment variables for local development
    load_dotenv()
    
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/api/generate_flashcards', methods=['POST'])
    def flask_handler():
        try:
            book_content = request.json.get('bookContent')
            if not book_content:
                return jsonify({'error': 'No book content provided'}), 400
                
            flashcards_data = generate_flashcards(book_content)
            return jsonify(flashcards_data)
            
        except Exception as e:
            return jsonify({
                'error': 'Failed to generate flashcards',
                'details': str(e)
            }), 500
    
    print("Starting local server on http://localhost:3000")
    app.run(port=3000, debug=True) 