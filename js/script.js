document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnDicas");
  const lista = document.getElementById("listaDicas");
  const pontos = document.getElementById("pontuacao");
  const toggleBtn = document.getElementById("toggleTema");
  const body = document.body;

  // ======== Pontuação ========= //
  let pontuacao = localStorage.getItem("pontos") ? parseInt(localStorage.getItem("pontos")) : 0;
  pontos.textContent = pontuacao;

  // ======== Tema Escuro/Claro ========= //
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo === "escuro") {
    body.classList.add("tema-escuro");
    toggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("tema-escuro");
    const temaAtual = body.classList.contains("tema-escuro") ? "escuro" : "claro";
    localStorage.setItem("tema", temaAtual);
    toggleBtn.innerHTML = temaAtual === "escuro"
      ? '<i class="bi bi-sun-fill"></i>'
      : '<i class="bi bi-moon-stars-fill"></i>';
  });

  // ======== Última visita ========= //
  const ultimaVisita = localStorage.getItem("ultimaVisita");
  if (ultimaVisita) {
    console.log(`Bem-vindo de volta! Sua última visita foi em: ${ultimaVisita}`);
  }
  localStorage.setItem("ultimaVisita", new Date().toLocaleString());

  // ======== Dicas ========= //
  let dicasCarregadas = false;

  btn.addEventListener("click", async () => {
    if (dicasCarregadas) {
      lista.innerHTML = "";
      btn.textContent = "Mostrar Dicas";
      dicasCarregadas = false;
      return;
    }

    try {
      const res = await fetch("data/dicas.json");
      if (!res.ok) throw new Error("Erro ao carregar dicas");
      const dicas = await res.json();

      dicas.forEach(dica => {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.innerHTML = `<strong>${dica.titulo}</strong><br>${dica.descricao}`;
        lista.appendChild(item);
      });

      pontuacao += dicas.length * 5;
      localStorage.setItem("pontos", pontuacao);
      pontos.textContent = pontuacao;

      const feedback = document.createElement("div");
      feedback.className = "text-success fw-bold mb-2 animate__animated animate__fadeInDown";
      feedback.innerHTML = `+${dicas.length * 5} pontos ganhos! 🎉`;
      lista.prepend(feedback);
      setTimeout(() => feedback.remove(), 3000);

      btn.textContent = "Ocultar Dicas";
      dicasCarregadas = true;

    } catch (error) {
      lista.innerHTML = `<li class="list-group-item text-danger">Erro ao carregar dicas 😢</li>`;
      console.error(error);
    }
  });

  // ======== Mapa com Leaflet ========= //
  const mapa = L.map('mapaCiclovias').setView([-23.420999, -51.933056], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);

  fetch("data/ciclovias.json")
    .then(res => res.json())
    .then(ciclovias => {
      ciclovias.forEach(ponto => {
        L.marker(ponto.coords)
          .addTo(mapa)
          .bindPopup(`<strong>${ponto.nome}</strong><br>Trecho cicloviário`);
      });
    });
});