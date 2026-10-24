# Contributing to Promptora

Thank you for your interest in contributing to **Promptora**! We are building the standard open-source AI prompt optimizer for developers, prompt engineers, and researchers running local models.

## Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (Node 20+ recommended)
- **Python**: 3.10+
- **Ollama**: Installed locally from [ollama.com](https://ollama.com)
- **Git**

### 2. Pull the Recommended Model
```bash
ollama serve
ollama pull gemma3:4b
```

### 3. Backend Setup (FastAPI)
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend
uvicorn backend.main:app --reload --port 8000
```

### 4. Frontend Setup (React + Vite)
```bash
# Install npm dependencies
npm install

# Start development server
npm run dev
```

### 5. Running Tests
```bash
# Run backend test suite
pytest tests/ -v
```

## Pull Request Guidelines
1. Ensure all tests pass.
2. Maintain zero-pill design rules and clean UI aesthetics.
3. Every new backend feature must include unit tests with mocked Ollama calls.
4. Keep token estimation math accurate and transparent.
