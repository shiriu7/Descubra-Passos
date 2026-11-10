(function () {
  "use strict";

  const CENTRO = [-46.6105, -20.7215];
  const VISAO_GERAL = { center: CENTRO, zoom: 13.6, pitch: 35, bearing: -10 };
  const EXAGERO_RELEVO = 1; // escala real do terreno
  const RESOLUCAO_MAX = Math.min(window.devicePixelRatio || 1, 2);
  const CAPIM = "#D4A72C"; // cor de seleção (mesma de --capim no CSS)

  // Ícones em traço, grade de 24×24: usados no mapa (canvas) e na lista/painel (SVG)
  const CATEGORIAS = {
    turismo: {
      nome: "Passeios", cor: "#2F4C87",
      icone: "M12 2.5v4M10 4.5h4M5 21v-9.5l7-4.5 7 4.5V21M10 21v-5h4v5M3 21h18"
    },
    trilha: {
      nome: "Trilha", cor: "#5E7F35",
      icone: "M2.5 19.5 9 9.5l4 6 2.5-3.5 6 7.5zM7.5 12l1.5 1.5 1.5-1"
    },
    hotel: {
      nome: "Hospedagem", cor: "#6F5A8C",
      icone: "M3 19V6M3 15h18v4M11 15v-5h7a3 3 0 0 1 3 3v2M7 12.5h.01"
    },
    restaurante: {
      nome: "Onde comer", cor: "#8C2F2B",
      icone: "M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17.5 21V3c-2.2 1.5-3.5 4.5-3.5 9h3.5"
    }
  };
  const ORDEM = ["turismo", "trilha", "hotel", "restaurante"];

  const locais = window.LOCAIS || [];
  const caderno = document.getElementById("caderno");
  let filtroCategoria = "todos";
  let termoBusca = "";
  let selecionado = null;
  let camadaPredios = null;
  let sateliteFixo = false;
  let animacao = null; // { tipo: "orbita" | "sobrevoo", id }

  // ---------- Mapa ----------
  const mapa = new maplibregl.Map({
    container: "mapa",
    style: "https://tiles.openfreemap.org/styles/liberty",
    ...VISAO_GERAL,
    // Acima de ~72° o horizonte puxa centenas de tiles distantes e o quadro despenca
    maxPitch: 72,
    fadeDuration: 120,
    pixelRatio: RESOLUCAO_MAX,
    maxTileCacheSize: 800, // revisitar um local não baixa os tiles de novo
    attributionControl: { compact: true }
  });
  mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

  // Resolução adaptativa: em movimento desenha com menos pixels; parado, volta à nitidez total.
  // Em telas de alta densidade isso corta pela metade (ou mais) o custo de cada quadro.
  if (RESOLUCAO_MAX > 1 && typeof mapa.setPixelRatio === "function") {
    let reduzido = false, esperaNitidez;
    // A órbita é lenta e mostra o prédio de perto: fica em resolução total
    const emOrbita = () => animacao && animacao.tipo === "orbita";
    mapa.on("movestart", () => {
      clearTimeout(esperaNitidez);
      if (!reduzido && !emOrbita()) { reduzido = true; mapa.setPixelRatio(1); }
    });
    mapa.on("moveend", () => {
      clearTimeout(esperaNitidez);
      // A órbita dispara moveend a cada quadro, então o timeout abaixo nunca venceria
      if (reduzido && emOrbita()) { reduzido = false; mapa.setPixelRatio(RESOLUCAO_MAX); return; }
      // Espera um instante: animações encadeadas (voo → órbita) não ficam alternando
      esperaNitidez = setTimeout(() => {
        if (reduzido && (!animacao || emOrbita())) { reduzido = false; mapa.setPixelRatio(RESOLUCAO_MAX); }
      }, 250);
    });
  }

  // Falhas de estilo ou de tiles não ficam silenciosas
  let ultimoAviso = 0;
  mapa.on("error", (e) => {
    console.warn("Mapa:", e && e.error ? e.error.message : e);
    if (Date.now() - ultimoAviso < 15000) return;
    ultimoAviso = Date.now();
    avisar("Parte do mapa não carregou. Confira a conexão e mova o mapa para tentar de novo.");
  });

  mapa.on("load", () => {
    estilizarMapaBase();

    // Relevo real (modelo digital de elevação, tiles Terrarium da AWS)
    const DEM = {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      // z13 (~19 m/pixel) já é mais fino que o dado de origem na região (~30 m);
      // z14 só quadruplicava a malha do terreno sem ganho visível
      maxzoom: 13
    };
    mapa.addSource("relevo", { ...DEM, attribution: "Relevo: Mapzen/AWS Terrain Tiles" });
    mapa.setTerrain({ source: "relevo", exaggeration: EXAGERO_RELEVO });
    mapa.setLight({ anchor: "map", position: [1.4, 215, 35], intensity: 0.3, color: "#FFFFFF" });
    try {
      mapa.setSky({ "sky-color": "#A9C9D6", "horizon-color": "#EEF0EA", "sky-horizon-blend": 0.7, "fog-color": "#EEF0EA", "fog-ground-blend": 0.35 });
    } catch (e) { /* versões sem suporte a céu */ }

    // Imagem de satélite: só é carregada quando entra em uso (visão de detalhe)
    const primeiraCamadaTexto = mapa.getStyle().layers.find((l) => l.type === "symbol");
    mapa.addSource("satelite", {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      // Na região só há foto até o z18; o z19 devolve um aviso "Map data not yet available"
      maxzoom: 18,
      attribution: "Imagens: Esri, Maxar, Earthstar Geographics"
    });
    mapa.addLayer({
      id: "satelite",
      type: "raster",
      source: "satelite",
      layout: { visibility: "none" },
      paint: { "raster-opacity": 0, "raster-opacity-transition": { duration: 700 }, "raster-fade-duration": 150 }
    }, primeiraCamadaTexto && primeiraCamadaTexto.id);

    prepararPredios3D();

    // Trilhas
    mapa.addSource("trilhas", { type: "geojson", data: geojsonTrilhas() });
    mapa.addLayer({
      id: "trilhas-borda", type: "line", source: "trilhas",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#FFFFFF", "line-opacity": 0.92, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3.5, 17, 11] }
    });
    mapa.addLayer({
      id: "trilha-ativa", type: "line", source: "trilhas",
      filter: ["==", ["get", "id"], ""],
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": CAPIM, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 17, 9] }
    });
    mapa.addLayer({
      id: "trilhas", type: "line", source: "trilhas",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": CATEGORIAS.trilha.cor,
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 17, 4.5],
        "line-dasharray": [2, 1.2]
      }
    });
    mapa.addSource("progresso", { type: "geojson", data: linha([]) });
    mapa.addLayer({
      id: "progresso", type: "line", source: "progresso",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": CATEGORIAS.trilha.cor, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 4, 17, 9] }
    });
    mapa.on("click", "trilhas", (e) => selecionar(e.features[0].properties.id));
    cursorClicavel("trilhas");

    // Estrutura destacada em 3D
    mapa.addSource("destaque", { type: "geojson", data: colecao([]) });
    mapa.addLayer({
      id: "destaque",
      type: "fill-extrusion",
      source: "destaque",
      paint: {
        "fill-extrusion-color": CAPIM,
        "fill-extrusion-height": ["get", "altura"],
        "fill-extrusion-base": ["get", "base"],
        "fill-extrusion-opacity": 0.95
      }
    });

    criarMarcadores();

    // Link direto para um lugar: espera o relevo da vista inicial. Voando antes disso,
    // o terreno chega no meio do voo e o MapLibre ergue a câmera, cortando zoom e inclinação.
    const inicial = decodeURIComponent(location.hash.slice(1));
    if (inicial && locais.some((l) => l.id === inicial)) mapa.once("idle", () => selecionar(inicial));

    // Sombreamento do relevo: só enfeite, entra depois que o primeiro quadro estiver pronto
    mapa.once("idle", () => {
      mapa.addSource("relevo-sombra", DEM);
      const primeiraRua = mapa.getStyle().layers.find((l) => /^(tunnel|road|bridge)_/.test(l.id));
      mapa.addLayer({
        id: "relevo-sombra",
        type: "hillshade",
        source: "relevo-sombra",
        layout: { visibility: sateliteLigado ? "none" : "visible" },
        paint: {
          "hillshade-exaggeration": 0.32,
          "hillshade-shadow-color": "#4F5E52",
          "hillshade-highlight-color": "#FFFFFF",
          "hillshade-accent-color": "#5E6B57",
          "hillshade-illumination-direction": 315
        }
      }, primeiraRua && primeiraRua.id);
    });
  });

  // Qualquer interação do usuário interrompe a animação de câmera
  ["mousedown", "touchstart", "wheel"].forEach((ev) =>
    mapa.on(ev, (e) => { if (e.originalEvent) pararAnimacao(); })
  );

  function cursorClicavel(camada) {
    mapa.on("mouseenter", camada, () => (mapa.getCanvas().style.cursor = "pointer"));
    mapa.on("mouseleave", camada, () => (mapa.getCanvas().style.cursor = ""));
  }

  // Recolore o estilo Liberty com a paleta do projeto e tira o que compete com os nossos marcadores
  function estilizarMapaBase() {
    const cor = (id, prop, valor) => { try { mapa.setPaintProperty(id, prop, valor); } catch (e) { /* camada ausente */ } };
    const esconder = (id) => mapa.setLayoutProperty(id, "visibility", "none");
    mapa.getStyle().layers.forEach((l) => {
      const id = l.id;
      if (l.type === "background") cor(id, "background-color", "#EEF0EA");
      else if (id === "natural_earth") esconder(id);
      else if (id === "water") cor(id, "fill-color", "#A9CDCB");
      else if (id.startsWith("waterway")) cor(id, "line-color", "#8EBDBA");
      else if (id === "park") { cor(id, "fill-color", "#D9E4CC"); cor(id, "fill-outline-color", "rgba(0,0,0,0)"); }
      else if (id === "park_outline") esconder(id);
      else if (id === "landcover_wood") cor(id, "fill-color", "rgba(170,196,150,.55)");
      else if (id === "landcover_grass") cor(id, "fill-color", "#E1E8D5");
      else if (id === "landuse_residential") cor(id, "fill-color", "#E7E9E2");
      else if (/^landuse_(pitch|track|cemetery|school|hospital)$/.test(id)) cor(id, "fill-color", "#E3E7DA");
      else if (id === "building") { cor(id, "fill-color", "#E0E1D9"); cor(id, "fill-outline-color", "#D2D4CA"); }
      else if (l.type === "line" && /^(tunnel|road|bridge)_/.test(id) && !/rail/.test(id)) {
        if (/casing/.test(id)) cor(id, "line-color", "#D3D8CF");
        else if (/motorway|trunk_primary/.test(id)) cor(id, "line-color", "#F6E7B8");
        else cor(id, "line-color", "#FFFFFF");
      }
      else if (/^boundary/.test(id)) cor(id, "line-color", "#AEB6AA");
      else if (l.type === "symbol") {
        // Os pontos de interesse do mapa base disputam atenção com os nossos lugares
        if (/^poi_|one_way|shield/.test(id)) { esconder(id); return; }
        cor(id, "text-color", /water|waterway/.test(id) ? "#2D6A70" : /^label_/.test(id) ? "#1B2420" : "#56625C");
        cor(id, "text-halo-color", "rgba(255,255,255,.88)");
      }
    });
  }

  function prepararPredios3D() {
    const estilo = mapa.getStyle();
    const existente = estilo.layers.find((l) => l.type === "fill-extrusion");
    if (existente) {
      camadaPredios = existente.id;
      mapa.setLayerZoomRange(camadaPredios, 14, 24);
      mapa.setPaintProperty(camadaPredios, "fill-extrusion-color", "#E4E4DC");
      mapa.setPaintProperty(camadaPredios, "fill-extrusion-opacity", 0.9);
      return;
    }
    const fonteVetorial = Object.keys(estilo.sources).find((s) => estilo.sources[s].type === "vector");
    if (!fonteVetorial) return;
    camadaPredios = "predios-3d";
    mapa.addLayer({
      id: camadaPredios,
      type: "fill-extrusion",
      source: fonteVetorial,
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": "#E4E4DC",
        "fill-extrusion-height": ["coalesce", ["get", "render_height"], 6],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": 0.9
      }
    });
  }

  // ---------- Marcadores (desenhados pela GPU, acompanham o relevo sem atraso) ----------
  function imagemSelo(cor, icone) {
    const r = 2; // resolução dupla para telas de alta densidade
    const tam = 34 * r, meio = tam / 2;
    const c = document.createElement("canvas");
    c.width = c.height = tam;
    const ctx = c.getContext("2d");
    ctx.shadowColor = "rgba(27,36,32,.35)";
    ctx.shadowBlur = 4 * r;
    ctx.shadowOffsetY = 1.5 * r;
    ctx.beginPath();
    ctx.arc(meio, meio, 14 * r, 0, Math.PI * 2);
    ctx.fillStyle = cor;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = 2.5 * r;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    // Ícone 24×24 reduzido para 16 px no centro do selo
    ctx.save();
    ctx.translate(meio - 8 * r, meio - 8 * r);
    ctx.scale((16 * r) / 24, (16 * r) / 24);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.2;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.stroke(new Path2D(icone));
    ctx.restore();
    return { width: tam, height: tam, data: ctx.getImageData(0, 0, tam, tam).data };
  }

  function criarMarcadores() {
    Object.entries(CATEGORIAS).forEach(([chave, cat]) =>
      mapa.addImage("selo-" + chave, imagemSelo(cat.cor, cat.icone), { pixelRatio: 2 })
    );
    mapa.addSource("locais", {
      type: "geojson",
      data: colecao(locais.map((l) => ({
        type: "Feature",
        properties: { id: l.id, nome: l.nome, categoria: l.categoria },
        geometry: { type: "Point", coordinates: l.coords }
      })))
    });
    // Anel dourado sob o lugar selecionado
    mapa.addLayer({
      id: "selecao",
      type: "circle",
      source: "locais",
      filter: ["==", ["get", "id"], ""],
      paint: {
        "circle-radius": 23,
        "circle-color": "rgba(212,167,44,.28)",
        "circle-stroke-color": CAPIM,
        "circle-stroke-width": 3,
        "circle-pitch-alignment": "viewport"
      }
    });
    mapa.addLayer({
      id: "locais",
      type: "symbol",
      source: "locais",
      layout: {
        "icon-image": ["concat", "selo-", ["get", "categoria"]],
        "icon-allow-overlap": true,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.72, 14, 1],
        "symbol-sort-key": ["match", ["get", "categoria"], "turismo", 1, "trilha", 2, 3],
        "text-field": ["step", ["zoom"], "", 15.5, ["get", "nome"]],
        "text-font": ["Noto Sans Bold"],
        "text-size": 12,
        "text-anchor": "top",
        "text-offset": [0, 1.4],
        "text-optional": true
      },
      paint: { "text-color": "#1B2420", "text-halo-color": "rgba(255,255,255,.92)", "text-halo-width": 1.6 }
    });
    mapa.on("click", "locais", (e) => selecionar(e.features[0].properties.id));
    cursorClicavel("locais");
  }

  function marcarSelecionado(local) {
    if (!mapa.getLayer("locais")) return;
    const id = local ? local.id : "";
    mapa.setFilter("selecao", ["==", ["get", "id"], local && !local.trilha ? id : ""]);
    mapa.setFilter("trilha-ativa", ["==", ["get", "id"], local && local.trilha ? id : ""]);
  }

  // ---------- Busca, filtros e lista ----------
  function visivel(local) {
    const okCat = filtroCategoria === "todos" || local.categoria === filtroCategoria;
    const texto = local.nome + " " + (local.tags || []).join(" ") + " " + (local.descricao || "") + " " + (local.municipio || "") + " " + (local.endereco || "");
    return okCat && (!termoBusca || normalizar(texto).includes(normalizar(termoBusca)));
  }

  function aplicarFiltros(enquadrar) {
    const visiveis = locais.filter(visivel);
    const ids = visiveis.map((l) => l.id);
    if (mapa.getLayer("locais")) {
      const filtro = ["in", ["get", "id"], ["literal", ids]];
      mapa.setFilter("locais", filtro);
      mapa.setFilter("trilhas", filtro);
      mapa.setFilter("trilhas-borda", filtro);
    }
    renderizarLista();
    if (enquadrar && visiveis.length && !selecionado) enquadrarLocais(visiveis);
  }

  // Ajusta a câmera para mostrar os lugares filtrados ("Todos" volta para a cidade)
  function enquadrarLocais(lista) {
    if (filtroCategoria === "todos" && !termoBusca) {
      mapa.flyTo({ ...VISAO_GERAL, padding: preenchimento(true), speed: 1, curve: 1.4 });
      return;
    }
    const limites = new maplibregl.LngLatBounds(lista[0].coords, lista[0].coords);
    lista.forEach((l) => (l.trilha ? l.trilha.percurso : [l.coords]).forEach((c) => limites.extend(c)));
    mapa.fitBounds(limites, { padding: preenchimento(true), maxZoom: 15.5, pitch: 35, duration: 1600 });
  }

  function iconeSvg(cat) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + CATEGORIAS[cat].icone + '"/></svg>';
  }

  function renderizarLista() {
    const ul = document.getElementById("lista");
    const frag = document.createDocumentFragment();
    const visiveis = locais.filter(visivel);
    ORDEM.forEach((cat) => {
      const doGrupo = visiveis.filter((l) => l.categoria === cat);
      if (!doGrupo.length) return;
      if (filtroCategoria === "todos") {
        const g = document.createElement("li");
        g.className = "grupo";
        g.setAttribute("role", "presentation");
        g.textContent = CATEGORIAS[cat].nome;
        frag.appendChild(g);
      }
      doGrupo.forEach((l) => {
        const li = document.createElement("li");
        li.tabIndex = 0;
        li.innerHTML =
          '<span class="selo" style="background:' + CATEGORIAS[cat].cor + '">' + iconeSvg(cat) + "</span>" +
          '<div><div class="nome">' + esc(l.nome) + "</div>" +
          '<div class="sub">' + esc(l.municipio ? l.municipio + ", a " + l.distanciaPassos + " de Passos" : l.endereco || "Passos") + "</div></div>";
        li.addEventListener("click", () => selecionar(l.id));
        li.addEventListener("keydown", (e) => { if (e.key === "Enter") selecionar(l.id); });
        frag.appendChild(li);
      });
    });
    ul.replaceChildren(frag);
    document.getElementById("vazio").hidden = visiveis.length > 0;
  }

  // Contagem por categoria nos filtros
  document.querySelectorAll(".chip").forEach((chip) => {
    const cat = chip.dataset.cat;
    const qtd = cat === "todos" ? locais.length : locais.filter((l) => l.categoria === cat).length;
    if (cat !== "todos") chip.insertAdjacentHTML("afterbegin", '<span class="cor" style="background:' + CATEGORIAS[cat].cor + '"></span>');
    chip.insertAdjacentHTML("beforeend", ' <span class="qtd">' + qtd + "</span>");
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => { c.classList.remove("ativo"); c.setAttribute("aria-pressed", "false"); });
      chip.classList.add("ativo");
      chip.setAttribute("aria-pressed", "true");
      filtroCategoria = cat;
      aplicarFiltros(true);
    });
  });
  let esperaBusca;
  document.getElementById("busca").addEventListener("input", (e) => {
    clearTimeout(esperaBusca);
    esperaBusca = setTimeout(() => {
      termoBusca = e.target.value.trim();
      aplicarFiltros(false);
    }, 150);
  });
  renderizarLista();

  // Gaveta no celular: a alça recolhe e expande a lista
  document.getElementById("alca").addEventListener("click", () => {
    if (selecionado) return;
    caderno.classList.toggle("recolhido");
  });

  // ---------- Seleção e câmera ----------
  function selecionar(id) {
    const local = locais.find((l) => l.id === id);
    if (!local) return;
    pararAnimacao();
    limparDestaque();
    selecionado = local;
    marcarSelecionado(local);
    history.replaceState(null, "", "#" + id);
    abrirPainel(local);
    definirSatelite(true);

    if (local.trilha) focarTrilha(local);
    else focarEstrutura(local);
  }

  // Espaço que a interface ocupa sobre o mapa (no desktop o mapa já começa depois da coluna)
  function preenchimento() {
    if (window.innerWidth > 760) return { top: 60, bottom: 60, left: 60, right: 60 };
    return { top: 64, bottom: Math.round(caderno.getBoundingClientRect().height) + 16, left: 20, right: 20 };
  }

  // Voo suave: a duração acompanha a distância percorrida
  function voar(opcoes, aoChegar) {
    mapa.flyTo({ speed: 0.9, curve: 1.5, essential: true, padding: preenchimento(), ...opcoes });
    if (aoChegar) mapa.once("moveend", aoChegar);
  }

  function focarEstrutura(local) {
    const pose = { center: local.coords, zoom: 17.6, pitch: 62 };
    voar({ ...pose, bearing: mapa.getBearing() + 40 }, () => {
      if (selecionado !== local) return;
      destacarEstrutura(local);
      // Se o relevo chegou durante o voo e a câmera foi erguida, completa a aproximação
      if (Math.abs(mapa.getPitch() - pose.pitch) > 4 || Math.abs(mapa.getZoom() - pose.zoom) > 0.3) {
        mapa.easeTo({ ...pose, padding: preenchimento(), duration: 900 });
        mapa.once("moveend", () => selecionado === local && iniciarOrbita());
      } else iniciarOrbita();
    });
  }

  function focarTrilha(local) {
    const percurso = local.trilha.percurso;
    const limites = percurso.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(percurso[0], percurso[0]));
    // cameraForBounds soma o padding pedido ao padding atual do mapa; desconta o que já existe
    const atual = mapa.getPadding(), alvo = preenchimento(), extra = {};
    ["top", "bottom", "left", "right"].forEach((k) => (extra[k] = Math.max(0, alvo[k] - (atual[k] || 0)) + 30));
    const camera = mapa.cameraForBounds(limites, { padding: extra, bearing: -20 }) || {};
    voar({
      center: camera.center || local.coords,
      zoom: Math.min((camera.zoom || 15) - 0.4, 16.8),
      bearing: -20,
      pitch: 62
    });
    calcularAltimetria(local);
  }

  function iniciarOrbita() {
    const id = Symbol();
    animacao = { tipo: "orbita", id };
    let ultimo = performance.now();
    const passo = (agora) => {
      if (!animacao || animacao.id !== id) return;
      const dt = Math.min(agora - ultimo, 50); // evita salto ao voltar de outra aba
      ultimo = agora;
      mapa.setBearing(mapa.getBearing() + dt * 0.005);
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  // Sobrevoo: a câmera persegue o ponto atual da trilha (o MapLibre mantém a altura
  // sobre o relevo); o rumo olha 60 m à frente e é amortecido para não dar trancos.
  function sobrevoarTrilha(local) {
    pararAnimacao();
    const id = Symbol();
    animacao = { tipo: "sobrevoo", id };
    atualizarBotaoSobrevoo(true);

    const pontos = suavizar(densificar(local.trilha.percurso, 4), 6);
    const dist = distanciasAcumuladas(pontos);
    const total = dist[dist.length - 1];
    const duracao = Math.min(60000, Math.max(16000, total * 16)); // ~16 s por km
    // Zoom e inclinação moderados: a câmera cruza tiles novos com menos frequência
    const ZOOM = 16.2, PITCH = 62;
    const noPonto = (m) => {
      m = Math.max(0, Math.min(total, m));
      let lo = 0, hi = dist.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (dist[mid] < m) lo = mid; else hi = mid; }
      const f = dist[hi] > dist[lo] ? (m - dist[lo]) / (dist[hi] - dist[lo]) : 0;
      return { i: lo, pos: interpolar(pontos[lo], pontos[hi], f) };
    };
    const rumoEm = (m) => rumo(noPonto(m - 60).pos, noPonto(m + 60).pos);

    // Transição suave até a posição inicial antes de começar a andar
    let rumoAtual = rumoEm(0);
    mapa.easeTo({ center: pontos[0], zoom: ZOOM, pitch: PITCH, bearing: rumoAtual, duration: 1500 });
    mapa.once("moveend", () => {
      if (!animacao || animacao.id !== id) return;
      let inicio = null, anterior = null, ultimaLinha = 0;
      const passo = (agora) => {
        if (!animacao || animacao.id !== id) return;
        if (inicio === null) inicio = anterior = agora;
        const dt = Math.min(agora - anterior, 50);
        anterior = agora;
        const t = Math.min(1, (agora - inicio) / duracao);
        const m = suave(t) * total;
        const alvo = noPonto(m);
        // Amortecimento exponencial independente da taxa de quadros
        rumoAtual = suavizarAngulo(rumoAtual, rumoEm(m), 1 - Math.exp(-dt / 600));
        mapa.jumpTo({ center: alvo.pos, bearing: rumoAtual, pitch: PITCH, zoom: ZOOM });

        if (agora - ultimaLinha > 120 || t === 1) { // atualizar a linha a cada quadro é desnecessário
          ultimaLinha = agora;
          mapa.getSource("progresso").setData(linha(pontos.slice(0, alvo.i + 1).concat([alvo.pos])));
        }
        if (t < 1) requestAnimationFrame(passo);
        else { animacao = null; atualizarBotaoSobrevoo(false); }
      };
      requestAnimationFrame(passo);
    });
  }

  function pararAnimacao() {
    if (animacao && animacao.tipo === "sobrevoo") atualizarBotaoSobrevoo(false);
    animacao = null;
  }

  function atualizarBotaoSobrevoo(ativo) {
    const btn = document.getElementById("btn-sobrevoo");
    if (!btn) return;
    btn.querySelector("path").setAttribute("d", ativo ? "M7 7h10v10H7z" : "M7 4.5v15l12-7.5z");
    btn.lastChild.textContent = ativo ? " Parar o sobrevoo" : " Sobrevoar a trilha";
  }

  // Destaca em 3D o prédio do local: usa o contorno cadastrado ou procura no mapa base
  function destacarEstrutura(local) {
    if (local.contorno) {
      mapa.getSource("destaque").setData(colecao([{
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [local.contorno] },
        properties: { altura: local.altura || 8, base: 0 }
      }]));
      return;
    }
    if (local.localizacao === "aproximada") return;
    const camada = camadaPredios && mapa.getLayer(camadaPredios);
    if (!camada) return;
    // Com relevo ativo a consulta por pixel não é confiável; consulta os dados da fonte
    const feicoes = mapa.querySourceFeatures(camada.source, { sourceLayer: camada.sourceLayer || "building" });
    if (!feicoes.length) return;
    const alvo = new maplibregl.LngLat(local.coords[0], local.coords[1]);
    // Os tiles agrupam vários prédios num MultiPolygon: avalia cada polígono separadamente
    let melhor = null, menor = Infinity;
    feicoes.forEach((f) => {
      const g = f.geometry;
      const partes = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
      partes.forEach((aneis) => {
        if (menor === 0) return;
        const geometria = { type: "Polygon", coordinates: aneis };
        if (contemPonto(geometria, local.coords)) { menor = 0; melhor = { geometria, props: f.properties }; return; }
        const c = centroide(geometria);
        const d = alvo.distanceTo(new maplibregl.LngLat(c[0], c[1]));
        if (d < menor) { menor = d; melhor = { geometria, props: f.properties }; }
      });
    });
    // Sem contorno próprio, só destaca se for um prédio isolado (não um quarteirão fundido)
    if (!melhor || menor > 40 || areaAproximada(melhor.geometria.coordinates[0]) > 1500) return;
    const props = melhor.props || {};
    mapa.getSource("destaque").setData(colecao([{
      type: "Feature",
      geometry: melhor.geometria,
      properties: {
        altura: (props.render_height || props.height || 8) + 0.3,
        base: props.render_min_height || 0
      }
    }]));
  }

  function limparDestaque() {
    if (mapa.getSource("destaque")) mapa.getSource("destaque").setData(colecao([]));
    if (mapa.getSource("progresso")) mapa.getSource("progresso").setData(linha([]));
  }

  // ---------- Satélite ----------
  let esconderSatelite, sateliteLigado = false;
  function definirSatelite(ligado) {
    if (!mapa.getLayer("satelite")) return;
    const on = ligado || sateliteFixo;
    [["btn-mapa", !on], ["btn-satelite", on]].forEach(([id, ativo]) => {
      const b = document.getElementById(id);
      b.classList.toggle("ativo", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
    if (on === sateliteLigado) return;
    sateliteLigado = on;
    clearTimeout(esconderSatelite);
    // Sobre a foto, prédios translúcidos: o volume aparece sem esconder os telhados
    if (camadaPredios) mapa.setPaintProperty(camadaPredios, "fill-extrusion-opacity", on ? 0.5 : 0.9);
    if (on) {
      mapa.setLayoutProperty("satelite", "visibility", "visible");
      // Espera um quadro para a transição de opacidade valer depois da visibilidade
      requestAnimationFrame(() => mapa.setPaintProperty("satelite", "raster-opacity", 1));
      // Terminado o esmaecimento, para de desenhar o que o satélite cobre
      esconderSatelite = setTimeout(() => alternarCamadasBase(false), 750);
    } else {
      alternarCamadasBase(true);
      mapa.setPaintProperty("satelite", "raster-opacity", 0);
      // Depois do esmaecimento, desliga a camada para não baixar tiles à toa
      esconderSatelite = setTimeout(() => mapa.setLayoutProperty("satelite", "visibility", "none"), 750);
    }
  }

  // Camadas do mapa base totalmente cobertas pelo satélite (áreas, ruas, água, relevo sombreado)
  let camadasSobSatelite = null;
  function alternarCamadasBase(visiveis) {
    const camadas = mapa.getStyle().layers;
    if (!camadasSobSatelite) {
      const ate = camadas.findIndex((l) => l.id === "satelite");
      camadasSobSatelite = camadas.slice(0, ate)
        .filter((l) => ["fill", "line", "background"].includes(l.type) && (l.layout || {}).visibility !== "none")
        .map((l) => l.id);
    }
    // O relevo sombreado entra depois do carregamento, então é tratado à parte
    camadasSobSatelite.concat(mapa.getLayer("relevo-sombra") ? ["relevo-sombra"] : []).forEach((id) => {
      if (mapa.getLayer(id)) mapa.setLayoutProperty(id, "visibility", visiveis ? "visible" : "none");
    });
  }

  function visaoGeral() {
    pararAnimacao();
    limparDestaque();
    fecharPainel();
    definirSatelite(false);
    mapa.flyTo({ ...VISAO_GERAL, padding: preenchimento(), speed: 1, curve: 1.4 });
  }

  // Volta para a lista e enquadra o que o filtro atual mostra
  function voltarParaLista() {
    pararAnimacao();
    limparDestaque();
    fecharPainel();
    definirSatelite(false);
    const visiveis = locais.filter(visivel);
    if (visiveis.length) enquadrarLocais(visiveis);
  }

  document.getElementById("btn-visao-geral").addEventListener("click", visaoGeral);
  document.getElementById("btn-mapa").addEventListener("click", () => { sateliteFixo = false; definirSatelite(false); });
  document.getElementById("btn-satelite").addEventListener("click", () => { sateliteFixo = true; definirSatelite(true); });

  // ---------- Painel ----------
  const painel = document.getElementById("painel");
  const conteudo = document.getElementById("painel-conteudo");

  function abrirPainel(local) {
    const cat = CATEGORIAS[local.categoria];
    const lat = local.coords[1], lng = local.coords[0];
    const destino = local.localizacao === "aproximada" && local.endereco
      ? encodeURIComponent(local.endereco + ", " + (local.municipio || "Passos") + ", MG")
      : lat + "," + lng;
    const rota = "https://www.google.com/maps/dir/?api=1&destination=" + destino;
    const realista = window.Realista && window.Realista.disponivel();
    let html = "";

    html += '<header class="painel-cabecalho" style="--cor:' + cat.cor + '">';
    html += '<span class="painel-categoria">' + iconeSvg(local.categoria) + cat.nome + "</span>";
    html += "<h2>" + esc(local.nome) + "</h2>";
    if (local.municipio)
      html += '<p class="onde">' + esc(local.municipio) + (local.distanciaPassos ? ", a cerca de " + esc(local.distanciaPassos) + " de Passos" : "") + "</p>";
    else if (local.endereco)
      html += '<p class="onde">' + esc(local.endereco) + "</p>";
    if (local.tags && local.tags.length)
      html += '<div class="tags">' + local.tags.map((t) => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>";
    html += "</header>";

    if (local.trilha) {
      const km = distanciasAcumuladas(local.trilha.percurso).pop() / 1000;
      html += '<section><dl class="ficha">' +
        ficha("Distância (ida)", km.toFixed(1).replace(".", ",") + " km") +
        ficha("Ida e volta", esc((local.trilha.tempoMedio || "A confirmar").replace(" (ida e volta)", ""))) +
        ficha("Subida acumulada", "…", null, "ganho") +
        ficha("Dificuldade", "…", null, "dificuldade") +
        "</dl></section>";
      html += '<section class="perfil"><h3>Perfil de elevação</h3><div id="perfil"><p class="legenda">Calculando a partir do relevo…</p></div></section>';
      if (local.trilha.pontos && local.trilha.pontos.length > 1)
        html += '<section><h3>No caminho</h3><ol class="pontos">' + local.trilha.pontos.map((p) => "<li>" + esc(p) + "</li>").join("") + "</ol></section>";
    }

    if (local.trilha || realista) {
      html += '<section><div class="acoes">';
      if (local.trilha) html += '<button class="btn" id="btn-sobrevoo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg><span> Sobrevoar a trilha</span></button>';
      if (realista) html += '<button class="btn destaque" id="btn-realista">Ver em 3D realista</button>';
      html += "</div></section>";
    }

    html += "<section><h3>Sobre</h3><p>" + esc(local.descricao || "Descrição a confirmar.") + "</p></section>";
    if (local.historia) html += "<section><h3>História</h3><p>" + esc(local.historia) + "</p></section>";

    // Vários telefones vêm separados por " / ": cada um vira um link próprio
    const telefones = (local.telefone || "").split(" / ").filter(Boolean)
      .map((t) => '<a href="tel:' + t.replace(/[^\d+]/g, "") + '">' + esc(t) + "</a>").join("<br>");
    html += '<section><h3>Como visitar</h3><dl class="info">' +
      linhaInfo("Endereço", local.endereco) +
      linhaInfo("Horário", local.horario) +
      (telefones ? "<dt>Telefone</dt><dd>" + telefones + "</dd>" : linhaInfo("Telefone", null)) +
      linhaInfo("Site", local.site && local.site.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").slice(0, 40), local.site) +
      (local.instagram ? linhaInfo("Instagram", "@" + local.instagram, "https://instagram.com/" + local.instagram) : "") +
      "</dl>" +
      (local.localizacao === "aproximada"
        ? '<p class="nota">Ponto no mapa estimado pelo endereço; pode estar a um quarteirão do lugar exato.</p>'
        : "") +
      "</section>";

    html += '<section><div class="acoes">' +
      '<a class="btn" href="' + rota + '" target="_blank" rel="noopener">Como chegar</a>' +
      '<button class="btn secundario" id="btn-compartilhar">Copiar link</button>' +
      "</div></section>";
    if (local.fontes && local.fontes.length)
      html += '<section><p class="nota">Fontes: ' + local.fontes.map(esc).join(", ") + ".</p></section>";

    conteudo.innerHTML = html;
    painel.hidden = false;
    painel.scrollTop = 0;
    caderno.classList.remove("recolhido");
    caderno.classList.add("detalhe");

    const btnSobrevoo = document.getElementById("btn-sobrevoo");
    if (btnSobrevoo) btnSobrevoo.addEventListener("click", () => {
      if (animacao && animacao.tipo === "sobrevoo") pararAnimacao();
      else sobrevoarTrilha(local);
    });
    const btnRealista = document.getElementById("btn-realista");
    if (btnRealista) btnRealista.addEventListener("click", () => {
      pararAnimacao();
      window.Realista.abrir(local, { bearing: mapa.getBearing() });
    });
    document.getElementById("btn-compartilhar").addEventListener("click", (e) => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(location.href).then(() => (e.target.textContent = "Link copiado"));
    });
  }

  function fecharPainel() {
    painel.hidden = true;
    caderno.classList.remove("detalhe");
    selecionado = null;
    marcarSelecionado(null);
    history.replaceState(null, "", location.pathname + location.search);
  }

  document.getElementById("painel-fechar").addEventListener("click", voltarParaLista);
  // Links internos e o botão voltar do navegador abrem o lugar do endereço
  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && (!selecionado || selecionado.id !== id) && locais.some((l) => l.id === id)) selecionar(id);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (window.Realista && window.Realista.aberto()) window.Realista.fechar();
    else if (selecionado) voltarParaLista();
  });

  function ficha(rotulo, valor, nota, id) {
    return "<div" + (id ? ' id="' + id + '"' : "") + "><dt>" + rotulo + (nota ? ", " + nota : "") + "</dt><dd>" + valor + "</dd></div>";
  }

  function linhaInfo(rotulo, texto, href) {
    if (!texto) return "<dt>" + rotulo + '</dt><dd class="vazio">A confirmar</dd>';
    const conteudo = href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(texto) + "</a>" : esc(texto);
    return "<dt>" + rotulo + "</dt><dd>" + conteudo + "</dd>";
  }

  function avisar(texto) {
    const el = document.getElementById("aviso-mapa");
    el.textContent = texto;
    el.hidden = false;
    clearTimeout(avisar.espera);
    avisar.espera = setTimeout(() => (el.hidden = true), 6000);
  }

  // ---------- Altimetria (lida direto dos tiles de relevo) ----------
  // Tiles Terrarium z14 (~10 m/pixel): altitude = R * 256 + G + B / 256 - 32768
  const ZOOM_RELEVO = 14;
  const tilesRelevo = new Map();

  function tileRelevo(x, y) {
    const chave = x + "/" + y;
    if (!tilesRelevo.has(chave)) {
      tilesRelevo.set(chave, new Promise((ok, erro) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = c.height = 256;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          ok(ctx.getImageData(0, 0, 256, 256).data);
        };
        img.onerror = erro;
        img.src = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/" + ZOOM_RELEVO + "/" + x + "/" + y + ".png";
      }));
    }
    return tilesRelevo.get(chave);
  }

  async function elevacao(lngLat) {
    const n = 2 ** ZOOM_RELEVO;
    const lat = lngLat[1] * Math.PI / 180;
    const px = (lngLat[0] + 180) / 360 * n;
    const py = (1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2 * n;
    const dados = await tileRelevo(Math.floor(px), Math.floor(py));
    const i = (Math.floor((py % 1) * 256) * 256 + Math.floor((px % 1) * 256)) * 4;
    return dados[i] * 256 + dados[i + 1] + dados[i + 2] / 256 - 32768;
  }

  async function calcularAltimetria(local) {
    const pontos = densificar(local.trilha.percurso, 15);
    const dist = distanciasAcumuladas(pontos);
    let alts;
    try {
      alts = await Promise.all(pontos.map(elevacao));
    } catch (e) {
      const alvo = document.getElementById("perfil");
      if (alvo) alvo.textContent = "O relevo não carregou. Abra a trilha de novo para tentar outra vez.";
      return;
    }
    if (selecionado !== local) return;

    let ganho = 0;
    let ref = alts[0];
    alts.forEach((a) => { // limiar de 2 m para ignorar ruído do modelo
      if (a - ref > 2) { ganho += a - ref; ref = a; }
      else if (ref - a > 2) ref = a;
    });
    const min = Math.min(...alts), max = Math.max(...alts), total = dist[dist.length - 1];
    const caixa = document.getElementById("ganho");
    if (caixa) caixa.querySelector("dd").textContent = Math.round(ganho) + " m";
    const dif = document.getElementById("dificuldade");
    if (dif) dif.querySelector("dd").textContent = dificuldade(total, ganho);

    const W = 320, H = 84, faixa = Math.max(max - min, 10);
    const pts = alts.map((a, i) => (dist[i] / total * W).toFixed(1) + "," + (H - 4 - (a - min) / faixa * (H - 14)).toFixed(1));
    const alvo = document.getElementById("perfil");
    if (!alvo) return;
    alvo.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img" aria-label="Perfil de elevação da trilha">' +
      '<polygon points="0,' + H + " " + pts.join(" ") + " " + W + "," + H + '" fill="rgba(94,127,53,.16)"/>' +
      '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#5E7F35" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
      "</svg>" +
      '<p class="legenda">Altitude entre ' + Math.round(min) + " m e " + Math.round(max) + " m, estimada pelo relevo</p>";
  }

  // Classificação simples por inclinação média da subida e extensão (ida)
  function dificuldade(metros, ganho) {
    const inclinacao = ganho / Math.max(metros, 1);
    let nivel = inclinacao < 0.06 ? 0 : inclinacao < 0.12 ? 1 : 2;
    if (metros > 8000) nivel++;
    return ["Leve", "Moderada", "Difícil", "Difícil"][nivel];
  }

  // ---------- Geometria ----------
  function geojsonTrilhas() {
    return colecao(locais.filter((l) => l.trilha).map((l) => ({
      type: "Feature",
      properties: { id: l.id },
      geometry: { type: "LineString", coordinates: l.trilha.percurso }
    })));
  }
  function colecao(features) { return { type: "FeatureCollection", features }; }
  function linha(coords) {
    return { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords.length > 1 ? coords : [] } };
  }

  function distancia(a, b) {
    return new maplibregl.LngLat(a[0], a[1]).distanceTo(new maplibregl.LngLat(b[0], b[1]));
  }
  function distanciasAcumuladas(pontos) {
    const d = [0];
    for (let i = 1; i < pontos.length; i++) d.push(d[i - 1] + distancia(pontos[i - 1], pontos[i]));
    return d;
  }
  // Insere pontos intermediários a cada `passo` metros
  function densificar(coords, passo) {
    const saida = [coords[0]];
    for (let i = 1; i < coords.length; i++) {
      const n = Math.max(1, Math.ceil(distancia(coords[i - 1], coords[i]) / passo));
      for (let k = 1; k <= n; k++) saida.push(interpolar(coords[i - 1], coords[i], k / n));
    }
    return saida;
  }
  // Média móvel: arredonda as quinas para a câmera não dar trancos
  function suavizar(pontos, janela) {
    return pontos.map((_, i) => {
      let x = 0, y = 0, n = 0;
      for (let k = Math.max(0, i - janela); k <= Math.min(pontos.length - 1, i + janela); k++) {
        x += pontos[k][0]; y += pontos[k][1]; n++;
      }
      return [x / n, y / n];
    });
  }
  function suavizarAngulo(atual, alvo, k) {
    const delta = ((alvo - atual + 540) % 360) - 180;
    return atual + delta * k;
  }
  function suave(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function interpolar(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function rumo(a, b) {
    const r = Math.PI / 180;
    const y = Math.sin((b[0] - a[0]) * r) * Math.cos(b[1] * r);
    const x = Math.cos(a[1] * r) * Math.sin(b[1] * r) - Math.sin(a[1] * r) * Math.cos(b[1] * r) * Math.cos((b[0] - a[0]) * r);
    return Math.atan2(y, x) / r;
  }
  function centroide(geom) {
    const anel = geom.type === "Polygon" ? geom.coordinates[0] : geom.type === "MultiPolygon" ? geom.coordinates[0][0] : null;
    if (!anel) return null;
    let x = 0, y = 0;
    anel.forEach((c) => { x += c[0]; y += c[1]; });
    return [x / anel.length, y / anel.length];
  }

  // Área em m² (fórmula do laço, projeção equiretangular local)
  function areaAproximada(anel) {
    const kx = 111320 * Math.cos(anel[0][1] * Math.PI / 180), ky = 110540;
    let soma = 0;
    for (let i = 0, j = anel.length - 1; i < anel.length; j = i++)
      soma += (anel[j][0] * kx) * (anel[i][1] * ky) - (anel[i][0] * kx) * (anel[j][1] * ky);
    return Math.abs(soma / 2);
  }

  function contemPonto(geom, pt) {
    const poligonos = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
    return poligonos.some((aneis) => {
      const anel = aneis[0];
      let dentro = false;
      for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
        const [xi, yi] = anel[i], [xj, yj] = anel[j];
        if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) dentro = !dentro;
      }
      return dentro;
    });
  }

  // ---------- Utilidades ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function normalizar(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }

  // Usado pelo modo realista para reaproveitar a altimetria
  window.PassosMapa = { elevacao, densificar, distanciasAcumuladas, suavizar, rumo };
})();
