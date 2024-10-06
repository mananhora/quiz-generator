from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
from langchain import OpenAI, LLMChain
from langchain.prompts import PromptTemplate
import numpy as np

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Allow all origins for testing, adjust to specific domains in production
CORS(app, resources={r"/*": {"origins": "*"}})

# Setup OpenAI API using LangChain
openai_api_key = os.getenv('OPENAI_API_KEY')

# LangChain components
llm = OpenAI(model='gpt-3.5-turbo', openai_api_key=openai_api_key)
prompt_template = PromptTemplate(
    input_variables=["book_content"],
    template="Generate a quiz based on the following book content: {book_content}"
)

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    book_content = data.get('bookContent')
    
    try:
        # Using LangChain's LLMChain to process the prompt
        chain = LLMChain(llm=llm, prompt=prompt_template)
        response = chain.run(book_content)

        return jsonify({'quiz': response})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
