// ── Kovidh's portfolio chatbot ──────────────────────────────────────────
// Calls a Cloudflare Worker (see /cloudflare-worker.js) instead of Gemini
// directly. The Worker holds the Gemini API key server-side as an
// encrypted secret, so no key ever ships in this file or the GitHub repo —
// nothing here for GitHub's secret scanner (or anyone viewing source) to
// find and get auto-revoked.
(function () {
  const WORKER_ENDPOINT = "https://portfolio-chatbot.kovidhrawat2004.workers.dev"; // <-- paste your deployed Worker URL here

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
    if (!WORKER_ENDPOINT || WORKER_ENDPOINT.includes("YOUR-WORKER-NAME")) {
      addMessage(
        "The chat assistant isn't set up yet — Kovidh needs to deploy the Cloudflare Worker and add its URL in assets/chatbot.js.",
        "bot"
      );
      return;
    }

    history.push({ role: "user", parts: [{ text: userText }] });
    isSending = true;
    sendBtn.disabled = true;
    addTyping();

    try {
      const res = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: history,
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
