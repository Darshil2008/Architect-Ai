# 🏗️ Architect AI

> **Turn your project idea into a production-grade technical architecture.**

Architect AI is an interactive, AI-powered architecture studio that helps developers transform an idea into a structured technical blueprint.

Instead of starting with a random tech stack or a blank document, Architect AI conducts an adaptive technical interview and generates a complete architecture plan—including the technology stack, database schema, system architecture, engineering trade-offs, and development roadmap.

🔗 **Live Demo:** [Architect AI Live Demo](https://darshil2008.github.io/Architect-Ai/?utm_source=chatgpt.com)

---

## ✨ Features

### 🧠 Dynamic Adaptive AI Interview

Architect AI doesn't rely on a static questionnaire.

It conducts a **multi-turn technical discovery process** that adapts based on the user's answers.

- 🤖 Live Gemini API integration
- 🔐 Client-side BYOK API key storage using LocalStorage
- 💬 Multi-turn adaptive technical interview
- 🧩 Context-aware follow-up questions
- 📈 Discovery based on scale and requirements

---

### 🔌 Offline Heuristic Engine

No API key? Architect AI can still help.

The project includes an intelligent offline heuristic engine with **10 domain archetypes**, allowing the interview to adapt even without an AI API.

Supported domains include:

- 🤖 AI / RAG Applications
- 💼 SaaS Platforms
- 🛒 E-Commerce
- 💳 FinTech
- 🌐 IoT Systems
- 📱 Consumer Applications
- And more...

The engine analyzes requirements such as:

- Expected scale
- Concurrent users
- Database constraints
- Real-time requirements
- System complexity
- Domain-specific needs

---

## 📊 Multi-Tab Engineering Visualizer

Architect AI generates more than just a technology recommendation.

It provides a complete engineering blueprint.

### 🏗️ 7-Layer Architecture Stack

Get recommendations and architectural trade-offs across:

1. Frontend
2. Ingress
3. Compute
4. Database
5. Cache
6. CI/CD
7. Observability

Each layer includes architectural rationale and implementation considerations.

---

### 🗄️ Database ERD Schema

Visualize your data model with an interactive Entity Relationship Diagram.

Features include:

- Table definitions
- Data types
- Primary Keys
- Foreign Keys
- Relationships
- Constraints
- Query indexes

---

### 🔀 Live System Architecture Flowcharts

Generate system architecture diagrams directly in the browser.

Powered by Mermaid.js, Architect AI can visualize the flow between different parts of your system.

Examples include:

```text
User
  ↓
Frontend
  ↓
API / Backend
  ↓
Database
  ↓
Cache / External Services
```

---

### 📅 Interactive Sprint Roadmap

Turn your architecture into an execution plan.

The roadmap provides:

- Development phases
- Engineering milestones
- Tasks and deliverables
- Interactive checklists
- Completion tracking

---

## 💾 Persistence & Exports

Your architecture doesn't disappear when you close the browser.

### Session History

Save and manage previous architecture sessions.

- Save architectures locally
- Reload previous sessions
- Review past blueprints
- Persistent browser-based storage

### Export Options

Export your generated architecture as:

- 📄 **GitHub-ready Markdown (`.md`)**
- 📦 **Structured JSON**
- 🖨️ **Print-to-PDF**

---

## ⚡ Built with Pure Vanilla Web Technologies

Architect AI was completely re-engineered using:

- HTML5
- CSS3
- Modern JavaScript
- Gemini API
- Mermaid.js
- LocalStorage

### No:

❌ React  
❌ Next.js  
❌ Build steps  
❌ Bundlers  
❌ Backend dependency  

Just open it in a browser and run it.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Death-Slaughter/Architect-Ai.git
```

### 2. Navigate to the project

```bash
cd Architect-Ai
```

### 3. Run the project

Since this project uses pure HTML, CSS, and JavaScript, no installation or build process is required.

Simply open:

```text
index.html
```

in your browser.

You can also use a local development server such as VS Code Live Server.

---

## 🤖 Using AI Mode

Architect AI supports AI-powered adaptive interviews through the Gemini API.

1. Open Architect AI.
2. Enter your Gemini API key.
3. The key is stored locally in your browser using LocalStorage.
4. Start the interview.
5. Answer the technical questions.
6. Let Architect AI generate your engineering blueprint.

> **Note:** The API key is handled client-side and is not sent to a custom backend server.

---

## 🧩 How It Works

```text
Project Idea
     ↓
Adaptive Technical Interview
     ↓
AI / Heuristic Analysis
     ↓
Requirement Discovery
     ↓
Architecture Generation
     ↓
┌─────────────────────────────┐
│  Technology Stack           │
│  System Architecture        │
│  Database Schema            │
│  Engineering Trade-offs     │
│  Sprint Roadmap             │
│  Resume Impact              │
└─────────────────────────────┘
     ↓
Export / Save / Continue
```

---

## 📁 Project Philosophy

Architect AI was built around one core question:

> **What if developers could validate and structure their technical decisions before writing the actual code?**

The goal isn't to replace software architects.

The goal is to help developers move from:

**"I have an idea."**

to:

**"I have a technical plan for building it."**

---

## 🛣️ Roadmap

Future versions may include:

- [ ] More AI providers
- [ ] Improved architecture recommendations
- [ ] Cloud cost estimation
- [ ] Security architecture analysis
- [ ] Team collaboration
- [ ] Architecture comparison
- [ ] More domain archetypes
- [ ] Advanced scalability simulations
- [ ] Deployment recommendations
- [ ] GitHub integration

---

## 🌐 Live Preview

Try the project here:

[🚀 Launch Architect AI](https://darshil2008.github.io/Architect-Ai/?utm_source=chatgpt.com)

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome!

If you find a bug, have an idea for a feature, or want to improve the architecture engine, feel free to open an issue or submit a pull request.

---

## 👨‍💻 Author

**Darshil Gehlot**

- [GitHub](https://github.com/Death-Slaughter?utm_source=chatgpt.com)
- [LinkedIn](https://www.linkedin.com/in/darshil-gehlot-4b72a9414/?utm_source=chatgpt.com)

---

## 📄 License

This project is open source and available for learning and development purposes.

---

### ⭐ If you found Architect AI interesting, consider giving the repository a star!

**Build ideas. Ask the right questions. Architect before you code.** 🚀
