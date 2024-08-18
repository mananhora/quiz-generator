from flask import Flask, request, jsonify # type: ignore
from dotenv import load_dotenv # type: ignore
import openai # type: ignore
import os
from flask_cors import CORS # type: ignore

load_dotenv()

app = Flask(__name__)

# CORS(app, origins=["http://localhost:5173"])  # Allow requests from this specific origin

# cors = CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for testing




openai.api_key = os.getenv('OPENAI_API_KEY')
client = openai

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    print ("hello in generatze quiz now whats up\n");
    data = request.json
    book_content = data.get('bookContent')
    try:
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Generate a quiz based on the following book content: {book_content}"}
            ]
        )
        print ("bla\n")
        print (response.choices[0])
        print ("bla\n")
        print (response.choices[0].message)
        print ("bla\n")
        # print (response.choices[0].message.content)
        print ("bla\n")
        quiz = response.choices[0].message.content
        print ("\n bla bla")
        return jsonify({'quiz': quiz})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
