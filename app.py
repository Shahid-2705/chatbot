import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import PyPDF2
import wikipedia
from wikipedia.exceptions import DisambiguationError, PageError
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from ollama import Client
from datetime import datetime

import json

# Load predefined responses from local JSON
with open("static/responses.json", "r", encoding="utf-8") as f:
    predefined_responses = json.load(f)

# Initialize services
wikipedia.set_lang("en")
client = Client(host='http://localhost:11434')

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'

# Global state
chat_history = []
pdf_text = ""

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        text = ""
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                content = page.extract_text()
                if content:
                    text += content
        return text
    except Exception as e:
        print("❌ PDF Read Error:", e)
        return ""

# TF-IDF relevance checker
def answer_from_pdf(query, text):
    documents = [text, query]
    tfidf = TfidfVectorizer().fit_transform(documents)
    similarity = cosine_similarity(tfidf[-1:], tfidf[:-1])
    score = similarity[0][0]
    return (text if score > 0.2 else None), score

# Ask Ollama LLaMA
def ask_llama(query, context=None):
    try:
        prompt = f"Answer the question using this PDF context:\n{context[:1500]}\n\nQ: {query}" if context else query
        response = client.chat(model='llama3', messages=[{"role": "user", "content": prompt}])
        return response['message']['content']
    except Exception as e:
        return f"⚠️ LLaMA Error: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')




@app.route('/chat', methods=['POST'])
def chat():
    global pdf_text
    user_msg = request.json.get('message', '')
    now = datetime.now().strftime("%d-%m %H:%M")
    chat_history.append({'sender': 'user', 'message': user_msg, 'time': now})

    responses = []

    # Lowercase message for matching
    user_msg_key = user_msg.lower().strip()

    if user_msg_key in predefined_responses:
        reply = predefined_responses[user_msg_key]
        chat_history.append({'sender': 'bot', 'message': reply, 'time': now})
        return jsonify(chat=chat_history[-2:])


    # 1. Check if relevant PDF is available
    if pdf_text:
        match, score = answer_from_pdf(user_msg, pdf_text)
        if match:
            pdf_response = ask_llama(user_msg, pdf_text)
            responses.append({'sender': 'bot', 'message': f"📄 From PDF: {pdf_response}", 'time': now})

    # 2. Wikipedia answer attempt
    wiki_success = False
    try:
        wiki_summary = wikipedia.summary(user_msg, sentences=2)
        responses.append({'sender': 'bot', 'message': f"📘 From Wikipedia: {wiki_summary}", 'time': now})
        wiki_success = True
    except (DisambiguationError, PageError, Exception):
        wiki_success = False

    # 3. LLaMA fallback if Wikipedia fails
    if not wiki_success:
        llama_response = ask_llama(user_msg)
        responses.append({'sender': 'bot', 'message': f"🧠 From LLaMA: {llama_response}", 'time': now})

    chat_history.extend(responses)
    return jsonify(chat=responses)

@app.route('/upload', methods=['POST'])
def upload_pdf():
    global pdf_text
    file = request.files.get('pdf')
    if not file or not file.filename.endswith('.pdf'):
        return jsonify({'status': 'error', 'message': 'Only PDF files are accepted.'})

    try:
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filename = secure_filename(file.filename)
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)

        pdf_text = extract_text_from_pdf(path)
        if not pdf_text.strip():
            return jsonify({'status': 'error', 'message': 'No readable content in PDF.'})

        return jsonify({'status': 'success', 'message': '📄 PDF uploaded and processed.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Upload failed: {str(e)}'})

@app.route('/clear', methods=['POST'])
def clear_history():
    global chat_history, pdf_text
    chat_history = []
    pdf_text = ""
    return jsonify({'status': 'cleared'})

if __name__ == '__main__':
    app.run(debug=True)
