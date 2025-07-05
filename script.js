const cooldownMs = 6 * 60 * 60 * 1000; // 6h
const button = document.getElementById("claimButton");
const timerText = document.getElementById("timerText");
const result = document.getElementById("result");

let canards = [];

fetch('canards.json')
  .then(response => response.json())
  .then(data => {
    canards = data;
    checkCooldown();
  })
  .catch(err => {
    button.textContent = "Erreur de chargement 😢";
    console.error("Erreur lors du chargement des canards :", err);
  });

function checkCooldown() {
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
  // Étape 1 : pondération des raretés
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

  // Étape 2 : filtrer les canards par rareté
  const filtered = canards.filter(d => d.rarity === selectedRarity);
  if (filtered.length === 0) {
    alert(`Aucun canard disponible pour la rareté ${selectedRarity}`);
    return;
  }

  const duck = filtered[Math.floor(Math.random() * filtered.length)];

  // Stockage local
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
