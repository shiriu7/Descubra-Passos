/*
 * Modo "3D realista": abre o local sobre os Google Photorealistic 3D Tiles usando CesiumJS.
 * O Cesium (~4 MB) só é baixado na primeira vez que o modo é aberto.
 */
(function () {
  "use strict";

  const CFG = window.CONFIG || {};
  const BASE = "https://cdn.jsdelivr.net/npm/cesium@1.144.0/Build/Cesium/";

  const overlay = document.getElementById("realista");
  const status = document.getElementById("realista-status");
  const titulo = document.getElementById("realista-titulo");
  const btnSobrevoo = document.getElementById("realista-sobrevoo");

  let carregamento = null;
  let viewer = null;
  let localAtual = null;
  let animacao = null;
  let aguardandoVista = false; // mostra "Carregando…" até a primeira vista do lugar ficar pronta
  const movel = window.matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  const CAPIM = "#D4A72C";

  function disponivel() { return !!CFG.cesiumIonToken; }
  function aberto() { return !overlay.hidden; }

  function carregarCesium() {
    if (!carregamento) {
      window.CESIUM_BASE_URL = BASE;
      carregamento = new Promise((ok, erro) => {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = BASE + "Widgets/widgets.css";
        document.head.appendChild(css);
        const s = document.createElement("script");
        s.src = BASE + "Cesium.js";
        s.onload = ok;
        s.onerror = () => { carregamento = null; erro(new Error("Falha ao baixar o CesiumJS")); };
        document.head.appendChild(s);
      });
    }
    return carregamento;
  }

  let tileset = null;

  async function criarViewer() {
    if (!viewer) {
      if (CFG.cesiumIonToken) Cesium.Ion.defaultAccessToken = CFG.cesiumIonToken;
      viewer = new Cesium.Viewer("realista-cena", {
        globe: false,
        baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false,
        navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false,
        infoBox: false, selectionIndicator: false,
        // Só desenha quando algo muda (câmera, tiles chegando): parado, a GPU descansa
        requestRenderMode: true,
        maximumRenderTimeChange: Infinity,
        // FXAA no lugar do MSAA 4x: suaviza as bordas por uma fração do custo
        msaaSamples: 1
      });
      viewer.scene.skyAtmosphere.show = true;
      viewer.resolutionScale = movel ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      viewer.scene.fog.enabled = true; // esconde e deixa de refinar tiles distantes
      viewer.scene.postProcessStages.fxaa.enabled = true;
      viewer.screenSpaceEventHandler.setInputAction(parar, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      viewer.screenSpaceEventHandler.setInputAction(parar, Cesium.ScreenSpaceEventType.WHEEL);
    }
    if (!tileset) { // tenta de novo se a primeira tentativa falhou
      // Os tiles do Google vêm pelo Cesium ion (asset 2275207), dentro da cota gratuita da conta
      tileset = await Cesium.createGooglePhotorealistic3DTileset(undefined, {
        showCreditsOnScreen: true,
        // Erro de tela maior que o padrão (16): bem menos tiles, diferença quase invisível.
        // No celular sobe para 32, como recomenda a documentação do Cesium.
        maximumScreenSpaceError: movel ? 32 : 24,
        // O padrão para os tiles do Google liga a colisão da câmera, que custa a cada quadro
        enableCollision: false,
        // Em movimento, adia o refinamento e reduz detalhe nas bordas e ao longe
        cullRequestsWhileMoving: true,
        cullRequestsWhileMovingMultiplier: 60,
        dynamicScreenSpaceError: true,
        foveatedScreenSpaceError: true,
        progressiveResolutionHeightFraction: 0.5,
        preloadFlightDestinations: true,
        // O padrão para o Google é 1,5 GB + 1 GB de folga: demais para um celular
        cacheBytes: (movel ? 256 : 512) * 1024 * 1024,
        maximumCacheOverflowBytes: (movel ? 128 : 256) * 1024 * 1024
      });
      viewer.scene.primitives.add(tileset);
      // Pronto quando a fila de tiles da vista atual esvazia (não por tempo fixo)
      tileset.loadProgress.addEventListener((pendentes, processando) => {
        if (aguardandoVista && pendentes + processando === 0) {
          aguardandoVista = false;
          mostrarStatus(null);
        }
      });
      let falhas = 0;
      tileset.tileFailed.addEventListener((e) => {
        console.warn("Tile 3D falhou:", e.url, e.message);
        if (++falhas === 5) mostrarStatus("Parte do modelo 3D não carregou. Confira a conexão.");
      });
    }
  }

  function mostrarStatus(texto) {
    status.hidden = !texto;
    if (texto) status.textContent = texto;
  }

  async function abrir(local, opcoes) {
    localAtual = local;
    overlay.hidden = false;
    titulo.textContent = local.nome;
    btnSobrevoo.hidden = !local.trilha;
    mostrarStatus("Carregando modelo 3D…");
    try {
      await carregarCesium();
      await criarViewer();
    } catch (e) {
      console.error(e);
      mostrarStatus("O 3D realista não abriu: o token em js/config.js foi recusado ou a conexão caiu.");
      return;
    }
    viewer.useDefaultRenderLoop = true;
    viewer.entities.removeAll();
    parar();
    aguardandoVista = true;
    const heading = Cesium.Math.toRadians((opcoes && opcoes.bearing) || 0);

    if (local.trilha) await mostrarTrilha(local, heading);
    else await mostrarEstrutura(local, heading);
  }

  async function alturas(coords) {
    // Altitudes do modelo de terreno (as mesmas do mapa); o geoide local fica em poucos metros
    try { return await Promise.all(coords.map(window.PassosMapa.elevacao)); }
    catch (e) { return coords.map(() => 800); }
  }

  async function mostrarEstrutura(local, heading) {
    const [h] = await alturas([local.coords]);
    let pos = Cesium.Cartesian3.fromDegrees(local.coords[0], local.coords[1], h);
    viewer.entities.add({
      position: pos,
      point: { pixelSize: 14, color: Cesium.Color.fromCssColorString(CAPIM), outlineColor: Cesium.Color.WHITE, outlineWidth: 3, disableDepthTestDistance: Number.POSITIVE_INFINITY }
    });
    voar(new Cesium.BoundingSphere(pos, 40), heading, -0.5, 260, () => orbitar(() => pos, heading));
    // Ajusta o alvo à superfície real do modelo quando os tiles chegarem
    try {
      const [ajustado] = await viewer.scene.clampToHeightMostDetailed([pos.clone()]);
      if (ajustado && localAtual === local) pos = ajustado;
    } catch (e) { /* mantém a altitude do terreno */ }
  }

  async function mostrarTrilha(local, heading) {
    const PM = window.PassosMapa;
    const pontos = PM.suavizar(PM.densificar(local.trilha.percurso, 6), 4);
    const alts = await alturas(pontos);
    const posicoes = pontos.map((p, i) => Cesium.Cartesian3.fromDegrees(p[0], p[1], alts[i]));
    viewer.entities.add({
      polyline: {
        positions: posicoes,
        width: 6,
        clampToGround: true,
        classificationType: Cesium.ClassificationType.BOTH,
        material: Cesium.Color.fromCssColorString(CAPIM)
      }
    });
    const esfera = Cesium.BoundingSphere.fromPoints(posicoes);
    voar(esfera, heading, -0.55, Math.max(esfera.radius * 2.8, 300));
    btnSobrevoo.onclick = () => (animacao ? parar() : sobrevoar(pontos, alts));
  }

  function voar(esfera, heading, pitch, distancia, aoChegar) {
    viewer.camera.flyToBoundingSphere(esfera, {
      offset: new Cesium.HeadingPitchRange(heading, pitch, distancia),
      duration: 2.5,
      complete: aoChegar
    });
  }

  function orbitar(obterAlvo, heading) {
    const id = Symbol();
    animacao = id;
    let ultimo = performance.now();
    const passo = (agora) => {
      if (animacao !== id) return;
      heading += Math.min(agora - ultimo, 50) * 0.00008;
      ultimo = agora;
      viewer.camera.lookAt(obterAlvo(), new Cesium.HeadingPitchRange(heading, -0.5, 260));
      viewer.scene.requestRender();
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  // Câmera segue atrás e acima do percurso, olhando para o ponto atual
  function sobrevoar(pontos, alts) {
    parar();
    const PM = window.PassosMapa;
    const dist = PM.distanciasAcumuladas(pontos);
    const total = dist[dist.length - 1];
    const duracao = Math.min(60000, Math.max(16000, total * 16));
    const recuo = Math.min(260, Math.max(120, total * 0.12));
    const em = (m) => {
      m = Math.max(0, Math.min(total, m));
      let lo = 0, hi = dist.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (dist[mid] < m) lo = mid; else hi = mid; }
      const f = dist[hi] > dist[lo] ? (m - dist[lo]) / (dist[hi] - dist[lo]) : 0;
      return {
        lng: pontos[lo][0] + (pontos[hi][0] - pontos[lo][0]) * f,
        lat: pontos[lo][1] + (pontos[hi][1] - pontos[lo][1]) * f,
        alt: alts[lo] + (alts[hi] - alts[lo]) * f
      };
    };
    const id = Symbol();
    animacao = id;
    btnSobrevoo.textContent = "Parar o sobrevoo";
    let inicio = null;
    const passo = (agora) => {
      if (animacao !== id) return;
      if (inicio === null) inicio = agora;
      const t = Math.min(1, (agora - inicio) / duracao);
      const m = (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) * total;
      const alvo = em(m), adiante = em(m + 40);
      const heading = Cesium.Math.toRadians(PM.rumo([alvo.lng, alvo.lat], [adiante.lng, adiante.lat]));
      const centro = Cesium.Cartesian3.fromDegrees(alvo.lng, alvo.lat, alvo.alt);
      viewer.camera.lookAt(centro, new Cesium.HeadingPitchRange(heading, -0.42, recuo));
      viewer.scene.requestRender();
      if (t < 1) requestAnimationFrame(passo);
      else parar();
    };
    requestAnimationFrame(passo);
  }

  function parar() {
    animacao = null;
    if (viewer) viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    btnSobrevoo.textContent = "Sobrevoar a trilha";
  }

  function fechar() {
    parar();
    overlay.hidden = true;
    localAtual = null;
    aguardandoVista = false;
    mostrarStatus(null);
    if (viewer) viewer.useDefaultRenderLoop = false; // não gasta GPU com a cena escondida
  }

  document.getElementById("realista-fechar").addEventListener("click", fechar);

  window.Realista = { disponivel, abrir, fechar, aberto };
})();
