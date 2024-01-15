from flask import Flask, render_template, request, jsonify
from langchain_helper import get_qa_chain, create_vector_db

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/create_knowledgebase', methods=['POST'])
def create_knowledgebase():
    create_vector_db()
    return "Knowledgebase created successfully!"

@app.route('/ask_question', methods=['POST'])
def ask_question():
    data = request.get_json()
    question = data['question']

    chain = get_qa_chain()
    response = chain(question)

    return jsonify({'answer': response["result"]})

@app.route('/api', methods=['POST'])
def api():
    data = request.get_json()
    question = data['question']

    chain = get_qa_chain()
    response = chain(question)

    return jsonify({'answer': response["result"]})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

