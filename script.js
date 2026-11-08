(() => {
  "use strict";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const bladesGroup = document.getElementById("blades");
  const peao = document.getElementById("peao");
  const centerLetter = document.getElementById("centerLetter");
  const result = document.getElementById("result");
  const spinButton = document.getElementById("spinButton");
  const resetButton = document.getElementById("resetButton");
  const history = document.getElementById("history");
  const round = document.getElementById("round");
  const remaining = document.getElementById("remaining");
  const toast = document.getElementById("toast");
  const installButton = document.getElementById("installButton");

  let drawn = [];
  let spinning = false;
  let deferredInstallPrompt = null;

  // Desenha 26 pás radiais e identifica cada uma com uma letra.
  const cx = 250, cy = 250, inner = 116, outer = 238;
  alphabet.forEach((letter, i) => {
    const angle = (i * 360 / 26) - 90;
    const half = 5.45;
    const rad = d => d * Math.PI / 180;
    const p1 = [cx + inner * Math.cos(rad(angle - half)), cy + inner * Math.sin(rad(angle - half))];
    const p2 = [cx + outer * Math.cos(rad(angle - half)), cy + outer * Math.sin(rad(angle - half))];
    const p3 = [cx + outer * Math.cos(rad(angle + half)), cy + outer * Math.sin(rad(angle + half))];
    const p4 = [cx + inner * Math.cos(rad(angle + half)), cy + inner * Math.sin(rad(angle + half))];
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", [p1,p2,p3,p4].map(p => p.join(",")).join(" "));
    polygon.setAttribute("fill", i % 2 ? "#eee9d2" : "#fffbe8");
    polygon.setAttribute("stroke", "#171717");
    polygon.setAttribute("stroke-width", "1.7");
    bladesGroup.appendChild(polygon);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const r = 177;
    label.setAttribute("x", cx + r * Math.cos(rad(angle)));
    label.setAttribute("y", cy + r * Math.sin(rad(angle)) + 7);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-family", "Arial, sans-serif");
    label.setAttribute("font-size", "18");
    label.setAttribute("font-weight", "900");
    label.setAttribute("fill", "#242424");
    label.textContent = letter;
    bladesGroup.appendChild(label);
  });

  function update() {
    round.textContent = drawn.length;
    remaining.textContent = `${26 - drawn.length} ${26 - drawn.length === 1 ? "letra disponível" : "letras disponíveis"}`;
    history.innerHTML = "";
    if (!drawn.length) {
      const empty = document.createElement("span");
      empty.className = "empty";
      empty.textContent = "As letras sorteadas aparecerão aqui.";
      history.appendChild(empty);
    } else {
      drawn.forEach(letter => {
        const chip = document.createElement("span");
        chip.className = "letter-chip";
        chip.textContent = letter;
        history.appendChild(chip);
      });
    }
    spinButton.disabled = spinning || drawn.length === 26;
    spinButton.textContent = drawn.length === 26 ? "FIM DE JOGO!" : spinning ? "GIRANDO..." : "GIRAR O PEÃO";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function spin() {
    if (spinning || drawn.length >= 26) return;
    const available = alphabet.filter(letter => !drawn.includes(letter));
    const chosen = available[Math.floor(Math.random() * available.length)];
    spinning = true;
    update();
    peao.classList.remove("spinning");
    // Reinicia a animação antes de iniciar um novo giro.
    void peao.offsetWidth;
    peao.classList.add("spinning");

    window.setTimeout(() => {
      peao.classList.remove("spinning");
      centerLetter.textContent = chosen;
      result.textContent = chosen;
      drawn.push(chosen);
      spinning = false;
      update();
      if (drawn.length === 26) showToast(`Todas as letras saíram! Fim das 26 rodadas.`);
      else showToast(`A letra sorteada foi ${chosen}!`);
    }, 4200);
  }

  function reset() {
    if (spinning) return;
    drawn = [];
    centerLetter.textContent = "?";
    result.textContent = "?";
    update();
    showToast("Nova partida iniciada. Boa sorte!");
  }

  spinButton.addEventListener("click", spin);
  resetButton.addEventListener("click", reset);
  update();

  // Instalação PWA: botão aparece quando o navegador oferece o prompt.
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast("No iPhone: use Compartilhar e depois 'Adicionar à Tela de Início'.");
      return;
    }
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    showToast("Aplicativo instalado!");
  });

  // Safari/iOS não dispara beforeinstallprompt; oferece instrução no botão.
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (isIOS && !isStandalone) installButton.hidden = false;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(err => console.warn("SW:", err));
    });
  }
})();
