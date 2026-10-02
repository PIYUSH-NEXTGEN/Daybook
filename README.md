

<p align="center">
   <img src="./src/assets/images/logo-nobg.webp" alt="DayBook logo" width="280" height="240" />
</p>


DayBook is a private, local-first AI journal that learns your habits, identifies recurring patterns, and helps you reflect on what you could improve.

Your journal data stays on your device. AI analysis runs locally using an open-weight model through Ollama.

## Features

- Write daily journal entries
- Analyze entries with a local AI model
- Identify recurring habits and patterns
- Review wins, struggles, and areas for improvement
- Track personal goals for your Winter Arc
- Keep journal data stored locally
- Run AI analysis without an API key or cloud AI service

## Requirements

Install the following before running DayBook:

- Node.js 26 or newer
- PNPM
- Ollama
- Git

Check your installations:

```bash
node --version
pnpm --version
ollama --version
git --version
```

## AI Model

DayBook uses Gemma 3 4B through Ollama.

Pull the model:

```bash
ollama pull gemma3:4b
```

Start Ollama:

```bash
ollama serve
```

You can test the model with:

```bash
ollama run gemma3:4b
```

## Installation

Clone the repository:

```bash
git clone https://github.com/greenbugx/Daybook
cd DayBook
```

Install frontend dependencies:

```bash
pnpm install
```

Install backend dependencies:

```bash
cd server
pnpm install
cd ..
```

## Running DayBook

DayBook uses three local processes:

1. React frontend
2. Local backend
3. Ollama

### 1. Start Ollama

In a terminal:

```bash
ollama serve
```

Make sure the model is available:

```bash
ollama pull gemma3:4b
```

### 2. Start the backend

In another terminal:

```bash
cd server
pnpm dev
```

The backend runs at:

```text
http://localhost:3001
```

### 3. Start the frontend

In another terminal from the project root:

```bash
pnpm dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

## Architecture

```text
                    DayBook
                       |
                       v
             React + TypeScript
                       |
                       v
                Local Backend
                       |
              +--------+--------+
              |                 |
              v                 v
           SQLite            Ollama
                                |
                                v
                            Gemma 3
```

The application is designed so that journal content, personal memories, and AI processing remain on the user's machine.

## Privacy

DayBook is built around local-first privacy.

Your journal contains personal information, so DayBook does not require sending journal entries to third-party AI services.

There is:

- No OpenAI API key
- No Gemini API key
- No hosted database
- No required cloud AI service

AI analysis is performed locally through Ollama.

## Development

Start the frontend:

```bash
pnpm dev
```

Start the backend:

```bash
cd server
pnpm dev
```

Build the frontend:

```bash
pnpm build
```

Build the backend:

```bash
cd server
pnpm build
```

## License

Check [LICENSE](LICENSE) for license info.
