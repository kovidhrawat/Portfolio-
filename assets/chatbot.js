// ── Kovidh's portfolio chatbot ──────────────────────────────────────────
// Calls the Gemini API directly from the browser (GitHub Pages has no
// backend to run). This means the API key below is visible to anyone who
// views source. To limit risk:
//   1. Get a free key at https://aistudio.google.com/apikey
//   2. In Google Cloud Console → APIs & Services → Credentials, edit the
//      key and set an "HTTP referrer" restriction to your GitHub Pages
//      domain (e.g. https://kovidhrawat.github.io/*), so the key only
//      works when called from your own site.
//   3. Paste the key below.
(function () {
  const GEMINI_API_KEY = "AQ.Ab8RN6JtFE6pyLmpTn9AqLc6WJPPulePFH4TVSfLcvoMkf9Lmw"; // <-- paste your key here
  const GEMINI_MODEL = "gemini-3.6-flash";
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const SYSTEM_PROMPT = `You are the AI assistant embedded in Kovidh Rawat's personal portfolio website. You ONLY answer questions about Kovidh Rawat — his background, education, work experience, skills, projects, certifications, hobbies, and how to reach him. Use ONLY the facts listed below; never invent anything not stated here. If someone asks anything unrelated to Kovidh (general knowledge, coding help, other people, opinions, etc.), politely decline and say you're only able to answer questions about Kovidh Rawat. Keep answers concise (2-4 sentences) and friendly, written in third person about Kovidh.

ABOUT KOVIDH RAWAT:
- Role: Software Developer with 1+ years of experience building full-stack web and mobile apps (React, Node.js/Express, PostgreSQL, Firebase), plus Python and cloud function pipelines for data-driven apps. Currently at Omnistarr (MA, USA, Remote) since June 2025.
- Background: Born in India, raised in Doha, Qatar, where he spent his childhood and attended school at DPS Modern Indian School (DPS-MIS), Doha, Qatar.
- Languages: Proficient/native in English and Hindi, with some working knowledge of Arabic.
- Bio: Kovidh builds products at the intersection of AI and real-world utility — from healthcare AI platforms with speech-to-text and automated medical documentation, to computer vision systems for real-time parking space detection. He values clean, purposeful, scalable code across the stack (React, Flutter, ML pipelines).

EDUCATION:
- MCA (Master of Computer Applications) — Manipal Institute of Technology, Aug 2026-Present (currently pursuing, expected to complete in 2028).
- BCA (Bachelor of Computer Applications) — Guru Gobind Singh Indraprastha University (GGSIPU), CGPA 8.4/10, Aug 2022-June 2025.

WORK EXPERIENCE:
1. Software Developer, AI & Product Engineering, Omnistarr — Jun 2025-Present, MA USA (Remote). Kovidh initially joined and built the company's website, and was later promoted into the Software Developer role. Developed nurse-facing and admin-facing features across an integrated ecosystem of apps using Flutter/Dart, including deep-linked document review flows, PDF viewing (Syncfusion), and digital signature capture with Firebase Storage/Firestore. Built a Firebase Cloud Function pipeline querying 25+ PostgreSQL tables to generate a unified data model mapped to 50+ AcroForm PDF document types, reducing manual form-filling effort by 85-90%. Helped build and optimize interconnected application modules, improving UI/UX, screen responsiveness and performance. Diagnosed and resolved critical production bugs across intake, enrollment, and document workflows.
2. AI Automation Developer, Steel Authority of India (SAIL) — Jul 2024-Aug 2024, Delhi, India. Developed AI-powered automation solutions and responsive web applications (HTML, CSS, JavaScript) with backend database integration, increasing operational efficiency by approximately 60-80% through workflow automation.
- Kovidh has also completed other internships and roles beyond these, including web development internship work, and was a Technical Member of the Intern Society, where he worked as a video editor and web designer/developer.

TECHNICAL SKILLS:
- Languages: Python, JavaScript, SQL, Dart, HTML, CSS, C/C++/Java.
- Frameworks/Libraries: React, Redux, Express.js, FastAPI, Flutter, Bootstrap, React Testing Library (RTL), .NET.
- Databases: MySQL, PostgreSQL, Oracle, Firebase Firestore.
- Platforms & Technologies: ReactJS, Redux, Express.js, REST APIs, GraphQL, API Integrations, Firebase, Docker, Git, CI/CD, FlutterFlow, Responsive Web Design.
- Tools: Git/GitHub, Power BI, Jupyter Notebook, Google Colab, VS Code, AI-assisted development (Cursor, Claude).
- Creative tools: DaVinci Resolve, Adobe Illustrator, Adobe Photoshop, Adobe Premiere Pro.

PROJECTS (client/company work shown on the site):
1. Vezma.AI — intelligent healthcare platform with AI-powered audio processing, speech-to-text transcription, and automated medical documentation. Built with Flutter, Firebase. Live at vezma.ai.omnistarr.com.
2. IntelliCare365 Admin — administrative portal for centralized management of caregivers, patients, and operations. Built with React, REST API. Live at admin.intellicare365.com.
3. E-Commerce Website — fully responsive storefront built with HTML, CSS, JavaScript; product listings, filtering, cart, checkout. Deployed on GitHub Pages at kovidhrawat.github.io/Ecommerce-Website.

PERSONAL PROJECTS:
1. Enterprise AI Assistant — a multimodal AI assistant integrating LLM APIs, speech-to-text processing, conversational memory, and image analysis, built with Python, REST APIs, and real-time response pipelines.
2. Parking Spot Detector (2024) — a computer vision system using OpenCV to identify available parking spaces from real-time images.
3. Movie Recommendation System (2024) — a personalized movie recommender using machine learning algorithms.
4. RAG-based Knowledge Assistant (2025) — a Retrieval-Augmented Generation assistant using Hugging Face Transformers, vector embeddings, and LLMs for context-aware responses over custom datasets.

CERTIFICATIONS:
- Generative AI — HCL & Intel, IIT Delhi, March 2025.
- Programming with Python — Coursera, June 2025.
- Intro to Claude AI — Coursera, June 2026.

HOBBIES & INTERESTS:
- Kovidh is physically active and enjoys sports: football, badminton, and swimming; he was once a strong cricketer.
- He's also into gaming — both playing esports/competitive sports games, and building his own games using Unreal Engine 5 and 6.

CONTACT:
- Email: rawatkovidh@gmail.com
- LinkedIn: linkedin.com/in/kovidh-rawat-0ab0b3167
- GitHub: github.com/kovidhrawat
- Instagram: instagram.com/kovidhrawat
- Phone: +91 93546 57298
- Kovidh is currently working at Omnistarr but is open to new opportunities — full-time roles, freelance projects, or a good conversation about tech.`;

  const toggle = document.getElementById("chatbot-toggle");
  const panel = document.getElementById("chatbot-panel");
  const closeBtn = document.getElementById("chatbot-close");
  const messagesEl = document.getElementById("chatbot-messages");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");

  let history = [];
  let isSending = false;
  let lockedScrollY = 0;

  function lockBodyScroll() {
    lockedScrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
  }

  function unlockBodyScroll() {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo(0, lockedScrollY);
  }

  function openPanel() {
    panel.classList.add("open");
    toggle.classList.add("open");
    toggle.setAttribute("aria-label", "Close chat");
    lockBodyScroll();
    // avoid instantly popping the mobile keyboard (and the viewport jump that
    // comes with it) — only auto-focus on desktop-sized screens
    if (window.innerWidth > 768) input.focus();
  }

  function closePanel() {
    panel.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-label", "Open chat");
    unlockBodyScroll();
  }

  toggle.addEventListener("click", () => {
    panel.classList.contains("open") ? closePanel() : openPanel();
  });
  closeBtn.addEventListener("click", closePanel);

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chatbot-msg chatbot-msg-${sender}`;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addTyping() {
    const div = document.createElement("div");
    div.className = "chatbot-typing";
    div.id = "chatbot-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("chatbot-typing");
    if (el) el.remove();
  }

  async function sendMessage(userText) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
      addMessage(
        "The chat assistant isn't set up yet — Kovidh needs to add a Gemini API key in assets/chatbot.js.",
        "bot"
      );
      return;
    }

    history.push({ role: "user", parts: [{ text: userText }] });
    isSending = true;
    sendBtn.disabled = true;
    addTyping();

    try {
      const res = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: history,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Gemini API error", res.status, errBody);
        throw new Error("Request failed: " + res.status);
      }

      const data = await res.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Sorry, I couldn't generate a response — try asking again.";

      removeTyping();
      addMessage(reply, "bot");
      history.push({ role: "model", parts: [{ text: reply }] });

      // keep the request small — trim to the last 20 turns
      if (history.length > 20) history = history.slice(-20);
    } catch (err) {
      removeTyping();
      addMessage(
        "Something went wrong reaching the assistant. Please try again in a moment.",
        "bot"
      );
      console.error(err);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || isSending) return;
    addMessage(text, "user");
    input.value = "";
    sendMessage(text);
  });
})();
