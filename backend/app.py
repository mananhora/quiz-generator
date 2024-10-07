from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

openai_api_key = os.getenv('OPENAI_API_KEY')
chat = ChatOpenAI(model_name='gpt-3.5-turbo', openai_api_key=openai_api_key)

quiz_prompt = ChatPromptTemplate.from_template(
    """Generate a quiz based on the following book content. 
    For each question, provide 4 options (a, b, c, d) and indicate the correct answer.
    Format each question as follows:
    Question: [question text]
    a) [option a]
    b) [option b]
    c) [option c]
    d) [option d]
    Correct: [correct option letter]

    Book content: {book_content}
    """
)

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    book_content = data.get('bookContent')
    
    try:
        chain = LLMChain(llm=chat, prompt=quiz_prompt)
        response = chain.run(book_content)

        # Parse the response into a structured format
        questions = []
        for question in response.split('\n\n'):
            lines = question.split('\n')
            q = {
                'question': lines[0].replace('Question: ', ''),
                'options': [line.strip() for line in lines[1:5]],
                'correct': lines[5].replace('Correct: ', '')
            }
            questions.append(q)

        return jsonify({'quiz': questions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.json
    question_index = data.get('questionIndex')
    selected_option = data.get('selectedOption')
    correct_option = data.get('correctOption')
    
    is_correct = selected_option == correct_option
    
    return jsonify({'isCorrect': is_correct})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
