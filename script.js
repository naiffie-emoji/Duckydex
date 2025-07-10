const cooldownMs = 2 * 60 * 60 * 1000; // 2h
const button = document.getElementById("claimButton");
const timerText = document.getElementById("timerText");
const result = document.getElementById("result");

let canards = [];

// 🔔 Notifications
if (Notification.permission !== "granted" && Notification.permission !== "denied") {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("Notifications activées !");
    }
  });
}

// 🔁 Chargement initial
fetch('canards.json')
  .then(response => response.json())
  .then(data => {
    canards = data;
    handleURLParams(); // 👈 Ajout ici
    checkCooldown();
  })
  .catch(err => {
    button.textContent = "Erreur de chargement 😢";
    console.error("Erreur lors du chargement des canards :", err);
  });

// 🧩 Gère les paramètres ?add=... ou ?remove=...
function handleURLParams() {
  const params = new URLSearchParams(window.location.search);
  const addId = params.get("add");
  const removeId = params.get("remove");

  let collection = JSON.parse(localStorage.getItem("collection")) || [];

  if (addId) {
    // Ajoute même s'il est déjà présent
    collection.push(addId);
    localStorage.setItem("collection", JSON.stringify(collection));

    const added = canards.find(d => d.id === addId);
    if (added) showDuck(added);
    alert(`✅ Zōion ajouté : ${addId}`);
  }

  if (removeId) {
    const index = collection.indexOf(removeId);
    if (index !== -1) {
      collection.splice(index, 1); // Retire une seule occurrence
      localStorage.setItem("collection", JSON.stringify(collection));
      alert(`❌ Une copie de ${removeId} a été retirée.`);
    } else {
      alert(`⚠️ Tu ne possèdes pas ce Zōion : ${removeId}`);
    }
  }
}

function checkCooldown() {
  const resetFromFight = localStorage.getItem("resetTimerFromFight");

  if (resetFromFight === "true") {
    localStorage.removeItem("resetTimerFromFight");
    enableButton();
    return;
  }

  const lastClaim = parseInt(localStorage.getItem("lastClaim")) || 0;
  const now = Date.now();
  const remaining = cooldownMs - (now - lastClaim);

  if (remaining > 0) {
    updateTimer(remaining);
    const interval = setInterval(() => {
      const newRemaining = cooldownMs - (Date.now() - lastClaim);
      if (newRemaining <= 0) {
        clearInterval(interval);
        enableButton();
      } else {
        updateTimer(newRemaining);
      }
    }, 1000);
  } else {
    enableButton();
  }
}

function enableButton() {
  button.disabled = false;
  button.textContent = "Obtenir un canard";
  timerText.textContent = "";
  button.onclick = claimDuck;

  if (Notification.permission === "granted") {
    new Notification("🦆 Tu peux récupérer un nouveau canard !");
  }
}

function updateTimer(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  button.disabled = true;
  button.textContent = "⏳ En attente...";
  timerText.textContent = `Prochain canard dans ${h}h ${m}m ${s}s`;
}

function claimDuck() {
  const rarityPool = [
    { rarity: "Légendaire", chance: 1 },
    { rarity: "Épique", chance: 4 },
    { rarity: "Rare", chance: 15 },
    { rarity: "Commun", chance: 80 }
  ];

  const rand = Math.random() * 100;
  let selectedRarity = "Commun";
  let cumulative = 0;

  for (const r of rarityPool) {
    cumulative += r.chance;
    if (rand <= cumulative) {
      selectedRarity = r.rarity;
      break;
    }
  }

  const filtered = canards.filter(d => d.rarity === selectedRarity);
  if (filtered.length === 0) {
    alert(`Aucun canard disponible pour la rareté ${selectedRarity}`);
    return;
  }

  const duck = filtered[Math.floor(Math.random() * filtered.length)];

  const collection = JSON.parse(localStorage.getItem("collection") || "[]");
  collection.push(duck.id);
  localStorage.setItem("collection", JSON.stringify(collection));
  localStorage.setItem("lastClaim", Date.now());

  showDuck(duck);
  checkCooldown();
}

function showDuck(duck) {
  result.innerHTML = `
    <div class="card">
      <img src="${duck.image}" alt="${duck.name}">
      <h3>${duck.name}</h3>
      <span>${duck.rarity}</span>
    </div>
  `;
                                         }
