document.addEventListener("DOMContentLoaded", () => {
    // --- SELETORES DE ELEMENTOS ---
    const elements = {
        html: document.documentElement,
        toggleTemaBtn: document.getElementById("toggleTema"),
        pontuacaoEl: document.getElementById("pontuacao"),
        formCalculadora: document.getElementById('formCalculadora'),
        distanciaInput: document.getElementById('distanciaKm'),
        resultadoCalculadoraEl: document.getElementById('resultadoCalculadora'),
        mapaEl: document.getElementById('mapaCiclovias'),
        scrollRevealElements: document.querySelectorAll('.scroll-reveal'),
    };

    // --- ESTADO DA APLICAÇÃO ---
    const state = {
        pontuacao: 0,
        mapa: null,
        tileLayer: null, // <-- VAMOS GUARDAR A CAMADA DO MAPA AQUI
    };

    // --- CONSTANTES ---
    const CO2_POR_KM_CARRO = 0.120;
    const TILE_URLS = {
        dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    };

    // --- FUNÇÕES DE MANIPULAÇÃO DE TEMA ---
    const updateThemeUI = (isDark) => {
        elements.toggleTemaBtn.innerHTML = isDark
            ? '<i class="bi bi-sun-fill text-lg text-yellow-400"></i>'
            : '<i class="bi bi-moon-stars-fill text-lg text-indigo-400"></i>';
    };
    
    // ATUALIZA O TEMA DO MAPA (FUNÇÃO NOVA E CRUCIAL)
    const updateMapTheme = () => {
        if (!state.mapa) return;

        // Remove a camada de tiles antiga, se existir
        if (state.tileLayer) {
            state.mapa.removeLayer(state.tileLayer);
        }

        const isDark = elements.html.classList.contains('dark');
        const newTileUrl = isDark ? TILE_URLS.dark : TILE_URLS.light;

        // Adiciona a nova camada e a guarda no estado
        state.tileLayer = L.tileLayer(newTileUrl, {
            attribution: '&copy; OpenStreetMap & CartoDB'
        }).addTo(state.mapa);
    };

    const toggleTheme = () => {
        const isDarkNow = elements.html.classList.toggle("dark");
        localStorage.setItem("tema", isDarkNow ? "dark" : "light");
        updateThemeUI(isDarkNow);
        updateMapTheme(); // <-- CHAMA A ATUALIZAÇÃO DO MAPA
    };
    
    const initTheme = () => {
        const isDark = elements.html.classList.contains("dark");
        updateThemeUI(isDark);
    };
    
    // --- FUNÇÃO DE INICIALIZAÇÃO DO MAPA (ATUALIZADA) ---
    const initMap = async () => {
        if (!elements.mapaEl) return;

        state.mapa = L.map(elements.mapaEl, {
            zoomControl: false 
        }).setView([-23.420999, -51.933056], 13); // Coordenadas de Paranavaí
        
        L.control.zoom({ position: 'bottomright' }).addTo(state.mapa);
        
        updateMapTheme(); // <-- USA A NOVA FUNÇÃO PARA CONFIGURAR O TEMA INICIAL

        try {
            const response = await fetch("data/ciclovias.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const ciclovias = await response.json();
            
            ciclovias.forEach(ponto => {
                L.marker(ponto.coords, {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="marker-pin"></div><i class="bi bi-bicycle"></i>`,
                        iconSize: [30, 42],
                        iconAnchor: [15, 42]
                    })
                }).addTo(state.mapa).bindPopup(`<strong>${ponto.nome}</strong>`);
            });
        } catch (error) {
            console.error("Erro ao carregar ciclovias:", error);
            elements.mapaEl.innerHTML = '<p class="p-4 text-center text-red-400">Não foi possível carregar os dados das ciclovias.</p>';
        }
    };
    
    // --- OUTRAS FUNÇÕES (sem alterações) ---
    const initScore = () => { state.pontuacao = parseInt(localStorage.getItem("pontos")) || 0; renderScore(); };
    const updateScore = (pontosGanhos) => { state.pontuacao += pontosGanhos; localStorage.setItem("pontos", state.pontuacao); renderScore(); };
    const renderScore = () => { if (!elements.pontuacaoEl) return; elements.pontuacaoEl.textContent = state.pontuacao; elements.pontuacaoEl.classList.add('animate-pulse'); setTimeout(() => elements.pontuacaoEl.classList.remove('animate-pulse'), 800); };
    const initScrollReveal = () => { if(!('IntersectionObserver' in window)) return; const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 }); elements.scrollRevealElements.forEach(el => observer.observe(el)); };
    const handleCalculadoraSubmit = (e) => { e.preventDefault(); const distancia = parseFloat(elements.distanciaInput.value); if (isNaN(distancia) || distancia <= 0) { elements.resultadoCalculadoraEl.innerHTML = `<p class="text-red-400">Por favor, insira um valor válido.</p>`; return; } const co2Economizado = (distancia * CO2_POR_KM_CARRO).toFixed(3); const pontosGanhos = Math.round(distancia * 10); elements.resultadoCalculadoraEl.innerHTML = `<p class="text-white">Você evitou a emissão de <strong class="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent-green to-brand-accent-blue">${co2Economizado} kg de CO₂!</strong></p><p class="text-sm text-brand-accent-green mt-1">+${pontosGanhos} pontos ganhos!</p>`; updateScore(pontosGanhos); elements.distanciaInput.value = ''; };
    const initEventListeners = () => { if (elements.toggleTemaBtn) elements.toggleTemaBtn.addEventListener("click", toggleTheme); if (elements.formCalculadora) elements.formCalculadora.addEventListener("submit", handleCalculadoraSubmit); };

    // --- FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL ---
    const init = () => {
        initTheme();
        initScore();
        initMap();
        initEventListeners();
        initScrollReveal();
    };

    // Inicia a aplicação
    init();
});