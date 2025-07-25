# ZoroBot 🤖 - Your AI-Powered Assistant

ZoroBot is an intelligent chat application built with Flask that leverages the power of large language models (LLMs), Wikipedia, and PDF document analysis to provide comprehensive answers. It's designed to be a versatile assistant, capable of extracting information from uploaded documents, summarizing Wikipedia articles, and engaging in general knowledge conversations.

## ✨ Features

*   **PDF Document Analysis**: Upload PDF files and ask questions directly about their content. ZoroBot uses TF-IDF for relevance checking and an LLM (Llama3) to generate answers from the PDF text.
*   **Wikipedia Integration**: Get concise summaries of topics directly from Wikipedia.
*   **LLM Fallback**: If information isn't found in uploaded PDFs or Wikipedia, ZoroBot can still provide answers using a local Llama3 model.
*   **Predefined Responses**: Handles common greetings and queries with quick, predefined answers.
*   **Interactive Chat Interface**: A clean and responsive web interface for seamless interaction.
*   **Chat History Management**: Clears chat history and uploaded PDF data.
*   **Voice Input (WebkitSpeechRecognition)**: Speak your queries directly to ZoroBot (browser support dependent).

## 🚀 Technologies Used

*   **Flask**: Web framework for the backend.
*   **PyPDF2**: For extracting text from PDF documents.
*   **scikit-learn**: Used for TF-IDF vectorization and cosine similarity to determine PDF relevance.
*   **wikipedia**: Python library for accessing Wikipedia.
*   **Ollama**: For running local Llama3 LLM.
*   **HTML/CSS/JavaScript**: For the frontend user interface.

## ⚙️ Setup and Installation

### Prerequisites

*   Python 3.x
*   Ollama (running locally with `llama3` model pulled)

    ```bash
    # Download and install Ollama from https://ollama.com/download
    ollama run llama3
    ```

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ZoroBot.git
    cd ZoroBot
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    *   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

4.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

5.  **Run the Flask application:**
    ```bash
    python app.py
    ```

    The application will typically run on `http://127.0.0.1:5000/`.

## 💡 Usage

1.  **Open your web browser** and navigate to `http://127.0.0.1:5000/`.
2.  **Chat with ZoroBot**: Type your questions in the input field and press Enter or click "Send".
3.  **Upload a PDF**: Click the "Upload PDF" button (paperclip icon) to select a PDF file. Once uploaded, you can ask questions related to its content.
4.  **Clear Chat**: Click the "Clear" button to clear the chat history and any loaded PDF.
5.  **Voice Input**: Click the microphone icon to use voice-to-text for your queries (requires browser support for WebkitSpeechRecognition).

## 📂 Project Structure
ZoroBot/ ├── app.py # Main Flask application logic ├── requirements.txt # Python dependencies ├── static/ │ ├── responses.json # Predefined chat responses │ ├── script.js # Frontend JavaScript for chat functionality │ ├── style.css # CSS for styling the application │ ├── zoro_bg.png # Background image │ ├── zoro_lo.png # Logo variant │ └── zoro_logo.png # Main logo ├── templates/ │ └── index.html # HTML template for the chat interface └── uploads/ # Directory for uploaded PDF files (created if not exists) ├── Disease_Diagnosis_Report.pdf ├── Mohamed_Shahid_H.pdf └── Titanic_EDA_Report.pdf


Run
Copy code

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
Made with ❤️ by Mohamed Shahid
