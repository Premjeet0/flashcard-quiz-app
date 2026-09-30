(() => {
  const KEY = "flashcards-v2";
  const defaults = [
    { q: "What does HTML stand for?", a: "HyperText Markup Language", c: "Web Development" },
    { q: "Which CSS property changes text color?", a: "color", c: "Web Development" },
    { q: "Which keyword declares a block-scoped variable in JavaScript?", a: "let (or const)", c: "Web Development" },
    { q: "What does 'git commit' do?", a: "Saves staged changes as a new snapshot in the repository history.", c: "Git" },
    { q: "What does 'git push' do?", a: "Uploads your local commits to a remote repository like GitHub.", c: "Git" },
    { q: "What is the capital of India?", a: "New Delhi", c: "General" }
  ];
  const $ = id => document.getElementById(id);
  const app = $("app");
  let cards = load(), category = "All", shuffled = false, mode = "study";
  let deck = [], index = 0, flipped = false, editing = null;
  let quiz = { list: [], i: 0, right: 0, missed: [] };

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s)) return s; } catch (e) {}
    return defaults.map(c => ({ ...c }));
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cards)); } catch (e) {} };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cats = () => [...new Set(cards.map(c => c.c))].sort();
  const filtered = () => cards.filter(c => category === "All" || c.c === category);

  function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1600);
  }

  function fillCategories() {
    if (category !== "All" && !cats().includes(category)) category = "All";
    const sel = $("category");
    sel.innerHTML = "";
    ["All", ...cats()].forEach(c => {
      const o = document.createElement("option");
      o.value = c; o.textContent = c === "All" ? `All categories (${cards.length})` : `${c} (${cards.filter(x => x.c === c).length})`;
      sel.appendChild(o);
    });
    sel.value = category;
    $("cats").innerHTML = cats().map(c => `<option value="${c.replace(/"/g, "&quot;")}">`).join("");
  }

  function setFlipped(v) {
    flipped = v;
    $("card").classList.toggle("flipped", v);
    $("flipBtn").textContent = v ? "Show Question" : "Show Answer";
    if (mode === "quiz") {
      $("grade").hidden = !v;
      $("flipBtn").hidden = v;
    }
  }

  function show(id, on) { $(id).hidden = !on; }

  function render() {
    fillCategories();
    show("result", false);
    const list = mode === "quiz" ? quiz.list : deck;
    const has = list.length > 0;
    show("study", has); show("empty", !has);
    if (!has) { $("counter").textContent = ""; $("bar").style.width = "0"; return; }
    const n = mode === "quiz" ? quiz.i : index;
    const card = list[n];
    $("question").textContent = card.q;
    $("answer").textContent = card.a;
    $("counter").textContent = mode === "quiz" ? `Question ${n + 1} of ${list.length}` : `Card ${n + 1} of ${list.length}`;
    $("bar").style.width = `${((n + 1) / list.length) * 100}%`;
    $("prevBtn").disabled = n === 0;
    $("nextBtn").disabled = n === list.length - 1;
    $("flipBtn").hidden = false; $("grade").hidden = true;
    setFlipped(false);
  }

  function buildDeck() {
    const f = filtered();
    deck = shuffled ? shuffle(f) : f;
    index = 0;
  }

  function startQuiz(list) {
    quiz = { list: shuffle(list), i: 0, right: 0, missed: [] };
    mode = "quiz"; app.dataset.mode = "quiz";
    $("tabQuiz").classList.add("active"); $("tabStudy").classList.remove("active");
    render();
  }

  function setMode(m) {
    if (m === "quiz") { startQuiz(filtered()); }
    else {
      mode = "study"; app.dataset.mode = "study";
      $("tabStudy").classList.add("active"); $("tabQuiz").classList.remove("active");
      buildDeck(); render();
    }
  }

  function grade(correct) {
    correct ? quiz.right++ : quiz.missed.push(quiz.list[quiz.i]);
    if (quiz.i < quiz.list.length - 1) { quiz.i++; render(); return; }
    const total = quiz.list.length, pct = Math.round((quiz.right / total) * 100);
    show("study", false); show("result", true);
    $("score").textContent = `${quiz.right} / ${total} (${pct}%)`;
    $("scoreNote").textContent = quiz.missed.length ? `${quiz.missed.length} to review. Retry the ones you missed.` : "Perfect score. Great work!";
    $("retryBtn").disabled = !quiz.missed.length;
    $("bar").style.width = "100%"; $("counter").textContent = "Quiz complete";
  }

  function openDialog(card) {
    editing = card;
    $("dialogTitle").textContent = card ? "Edit card" : "Add card";
    $("cInput").value = card ? card.c : (category === "All" ? "General" : category);
    $("qInput").value = card ? card.q : "";
    $("aInput").value = card ? card.a : "";
    $("dialog").showModal(); $("qInput").focus();
  }

  // Events
  $("flipBtn").onclick = () => setFlipped(!flipped);
  $("card").onclick = () => mode === "study" ? setFlipped(!flipped) : (!flipped && setFlipped(true));
  $("prevBtn").onclick = () => { if (index > 0) { index--; render(); } };
  $("nextBtn").onclick = () => { if (index < deck.length - 1) { index++; render(); } };
  $("gotBtn").onclick = () => grade(true);
  $("missBtn").onclick = () => grade(false);
  $("tabStudy").onclick = () => setMode("study");
  $("tabQuiz").onclick = () => setMode("quiz");
  $("restartBtn").onclick = () => startQuiz(filtered());
  $("retryBtn").onclick = () => quiz.missed.length && startQuiz(quiz.missed);
  $("category").onchange = e => { category = e.target.value; mode === "quiz" ? startQuiz(filtered()) : (buildDeck(), render()); };
  $("shuffleBtn").onclick = e => { shuffled = !shuffled; e.target.setAttribute("aria-pressed", shuffled); buildDeck(); render(); toast(shuffled ? "Shuffled" : "Original order"); };
  $("addBtn").onclick = $("emptyAdd").onclick = () => openDialog(null);
  $("editBtn").onclick = () => deck.length && openDialog(deck[index]);
  $("cancelBtn").onclick = () => $("dialog").close();

  $("deleteBtn").onclick = () => {
    if (!deck.length || !confirm("Delete this card?")) return;
    cards.splice(cards.indexOf(deck[index]), 1);
    save(); const keep = index; buildDeck(); index = Math.min(keep, Math.max(deck.length - 1, 0)); render(); toast("Card deleted");
  };

  $("form").onsubmit = e => {
    const q = $("qInput").value.trim(), a = $("aInput").value.trim(), c = $("cInput").value.trim() || "General";
    if (!q || !a) { e.preventDefault(); return; }
    if (editing) { Object.assign(editing, { q, a, c }); toast("Card updated"); }
    else { cards.push({ q, a, c }); category = c; toast("Card added"); }
    save(); buildDeck();
    if (!editing) index = deck.length - 1;
    render();
  };

  $("exportBtn").onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "flashcards.json"; a.click();
    URL.revokeObjectURL(url); toast("Exported flashcards.json");
  };
  $("importBtn").onclick = () => $("importFile").click();
  $("importFile").onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        const ok = data.filter(x => x && x.q && x.a).map(x => ({ q: String(x.q), a: String(x.a), c: String(x.c || "General") }));
        if (!ok.length) throw 0;
        cards = cards.concat(ok); save(); category = "All"; buildDeck(); render(); toast(`Imported ${ok.length} cards`);
      } catch (err) { toast("Invalid file. Use exported JSON."); }
      e.target.value = "";
    };
    r.readAsText(file);
  };

  document.addEventListener("keydown", e => {
    if ($("dialog").open || /TEXTAREA|INPUT|SELECT/.test(e.target.tagName)) return;
    if (mode === "study") {
      if (e.key === "ArrowRight") $("nextBtn").click();
      else if (e.key === "ArrowLeft") $("prevBtn").click();
    }
    if (e.key === " " && e.target.tagName !== "BUTTON") { e.preventDefault(); if (!$("flipBtn").hidden) $("flipBtn").click(); }
  });

  buildDeck(); render();
})();
