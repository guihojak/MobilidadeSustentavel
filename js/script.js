document.addEventListener("DOMContentLoaded", () => {
    // --- 1. SELETORES E ESTADO ---
    const elements = {
        html: document.documentElement,
        toggleTemaBtn: document.getElementById("toggleTema"),
        pontuacaoEl: document.getElementById("pontuacao"),
        formCalculadora: document.getElementById('formCalculadora'),
        distanciaInput: document.getElementById('distanciaKm'),
        resultadoCalculadoraEl: document.getElementById('resultadoCalculadora'),
        mapaEl: document.getElementById('mapaCiclovias'),
        scrollRevealElements: document.querySelectorAll('.scroll-reveal'),
        historicoCorridasEl: document.getElementById('historicoCorridas'),
        acharPertoBtn: document.getElementById('acharPerto'),
        navLinks: document.querySelectorAll('nav a[href^="#"]'),
        sections: document.querySelectorAll('main section[id]'),
    };

    const state = {
        pontuacao: 0,
        mapa: null,
        tileLayer: null,
    };

    const CONSTANTS = {
        CO2_POR_KM_CARRO: 0.120,
        TILE_URLS: {
            dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        },
    };

    // --- 2. FUNÇÕES AGRUPADAS POR FUNCIONALIDADE ---

    // --- Funções de UI/UX ---
    const showToast = (message) => {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'fixed bottom-5 right-5 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue text-brand-dark font-bold py-2 px-4 rounded-lg shadow-lg animate-fade-in-up z-50';
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    };

    const initActiveNavHighlight = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    elements.navLinks.forEach(link => {
                        const isActive = link.getAttribute('href').substring(1) === entry.target.id;
                        link.classList.toggle('nav-link-active', isActive);
                    });
                }
            });
        }, { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' });
        elements.sections.forEach(section => observer.observe(section));
    };

    const initScrollReveal = () => {
        if (!('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elements.scrollRevealElements.forEach(el => observer.observe(el));
    };

    // --- Funções de Tema ---
    const updateThemeUI = (isDark) => {
        elements.toggleTemaBtn.innerHTML = isDark
            ? '<i class="bi bi-sun-fill text-lg text-yellow-400"></i>'
            : '<i class="bi bi-moon-stars-fill text-lg text-indigo-400"></i>';
    };
    const updateMapTheme = () => {
        if (!state.mapa) return;
        if (state.tileLayer) state.mapa.removeLayer(state.tileLayer);
        const newTileUrl = elements.html.classList.contains('dark') ? CONSTANTS.TILE_URLS.dark : CONSTANTS.TILE_URLS.light;
        state.tileLayer = L.tileLayer(newTileUrl, { attribution: '&copy; OpenStreetMap & CartoDB' }).addTo(state.mapa);
    };
    const toggleTheme = () => {
        const isDarkNow = elements.html.classList.toggle("dark");
        localStorage.setItem("tema", isDarkNow ? "dark" : "light");
        updateThemeUI(isDarkNow);
        updateMapTheme();
    };
    const initTheme = () => {
        updateThemeUI(elements.html.classList.contains("dark"));
    };

    // --- Funções de Pontuação e Histórico ---
    const initScore = () => {
        state.pontuacao = parseInt(localStorage.getItem("pontos")) || 0;
        renderScore();
    };
    const updateScore = (pontosGanhos) => {
        state.pontuacao += pontosGanhos;
        localStorage.setItem("pontos", state.pontuacao);
        renderScore();
    };
    const renderScore = () => {
        if (!elements.pontuacaoEl) return;
        elements.pontuacaoEl.textContent = state.pontuacao;
        elements.pontuacaoEl.classList.add('animate-pulse');
        setTimeout(() => elements.pontuacaoEl.classList.remove('animate-pulse'), 800);
    };
    const renderHistorico = () => {
        const historico = JSON.parse(localStorage.getItem('historicoCorridas')) || [];
        if (!elements.historicoCorridasEl) return;
        if (historico.length === 0) {
            elements.historicoCorridasEl.innerHTML = '';
            return;
        }
        elements.historicoCorridasEl.innerHTML = `
            <h4 class="text-sm font-semibold text-gray-400 text-center mb-2 mt-6">Últimas corridas:</h4>
            <ul class="space-y-2 text-sm">${historico.map(corrida => `
                <li class="flex justify-between items-center bg-brand-light p-2 rounded-md opacity-80">
                    <span>${corrida.distancia} km</span>
                    <span class="text-brand-accent-green font-medium">+${corrida.co2} kg CO₂</span>
                </li>`).join('')}
            </ul>`;
    };

    // --- Funções do Mapa ---
    const calcularDistancia = (p1, p2) => {
        const dx = p1.lat - p2.lat;
        const dy = p1.lng - p2.lng;
        return Math.sqrt(dx * dx + dy * dy);
    };
    const acharCicloviaProxima = () => {
        if (!navigator.geolocation) {
            elements.acharPertoBtn.textContent = "Geolocalização não suportada";
            return;
        }
        elements.acharPertoBtn.disabled = true;
        elements.acharPertoBtn.innerHTML = '<i class="bi bi-hourglass-split mr-2 animate-spin"></i>Procurando...';
        navigator.geolocation.getCurrentPosition(async (position) => {
            const userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
            L.marker([userPos.lat, userPos.lng]).addTo(state.mapa).bindPopup("<b>Você está aqui!</b>").openPopup();
            try {
                const response = await fetch("data/ciclovias.json");
                const ciclovias = await response.json();
                let maisProximo = null;
                let menorDistancia = Infinity;
                ciclovias.forEach(ponto => {
                    const distancia = calcularDistancia({ lat: ponto.coords[0], lng: ponto.coords[1] }, userPos);
                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        maisProximo = ponto;
                    }
                });
                if (maisProximo) {
                    state.mapa.setView(maisProximo.coords, 15);
                }
            } catch (e) {
                showToast("Erro ao carregar dados das ciclovias.");
            } finally {
                elements.acharPertoBtn.disabled = false;
                elements.acharPertoBtn.innerHTML = '<i class="bi bi-geo-alt-fill mr-2"></i>Achar perto de mim';
            }
        }, () => {
            showToast("Permissão de localização negada.");
            elements.acharPertoBtn.disabled = false;
            elements.acharPertoBtn.innerHTML = '<i class="bi bi-geo-alt-fill mr-2"></i>Achar perto de mim';
        });
    };
    const initMap = async () => {
        if (!elements.mapaEl) return;
        state.mapa = L.map(elements.mapaEl, { zoomControl: false }).setView([-23.420999, -51.933056], 13);
        L.control.zoom({ position: 'bottomright' }).addTo(state.mapa);
        updateMapTheme();
        try {
            const response = await fetch("data/ciclovias.json");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const ciclovias = await response.json();
            ciclovias.forEach(ponto => {
                L.marker(ponto.coords, {
                    icon: L.divIcon({ className: 'custom-div-icon', html: `<div class="marker-pin"></div><i class="bi bi-bicycle"></i>`, iconSize: [30, 42], iconAnchor: [15, 42] })
                }).addTo(state.mapa).bindPopup(`<strong>${ponto.nome}</strong>`);
            });
        } catch (error) {
            elements.mapaEl.innerHTML = '<p class="p-4 text-center text-red-400">Não foi possível carregar os dados das ciclovias.</p>';
        }
    };

    // --- 3. MANIPULADORES DE EVENTOS E INICIALIZAÇÃO ---
    const handleCalculadoraSubmit = (e) => {
        e.preventDefault();
        const distancia = parseFloat(elements.distanciaInput.value);
        if (isNaN(distancia) || distancia <= 0) {
            showToast("Por favor, insira um valor válido.");
            return;
        }
        const co2Economizado = (CONSTANTS.CO2_POR_KM_CARRO * distancia).toFixed(3);
        const pontosGanhos = Math.round(distancia * 10);
        elements.resultadoCalculadoraEl.innerHTML = `<p class="text-white">Você evitou a emissão de <strong class="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent-green to-brand-accent-blue">${co2Economizado} kg de CO₂!</strong></p>`;
        
        const historico = JSON.parse(localStorage.getItem('historicoCorridas')) || [];
        historico.unshift({ distancia, co2: co2Economizado });
        if (historico.length > 3) historico.pop();
        localStorage.setItem('historicoCorridas', JSON.stringify(historico));
        
        renderHistorico();
        updateScore(pontosGanhos);
        showToast(`+${pontosGanhos} pontos ganhos!`);
        elements.distanciaInput.value = '';
    };

    const initEventListeners = () => {
        if (elements.toggleTemaBtn) elements.toggleTemaBtn.addEventListener("click", toggleTheme);
        if (elements.formCalculadora) elements.formCalculadora.addEventListener("submit", handleCalculadoraSubmit);
        if (elements.acharPertoBtn) elements.acharPertoBtn.addEventListener('click', acharCicloviaProxima);
    };

    const init = () => {
        initTheme();
        initScore();
        initMap();
        initEventListeners();
        initScrollReveal();
        initActiveNavHighlight();
        renderHistorico();
    };

    // Inicia a aplicação
    init();
});