let THREE;
let GLTFLoader;

const localeTime = document.querySelector("#locale-time");
const siteMenu = document.querySelector(".site-menu");
const siteMenuButton = document.querySelector(".site-menu__icon");
const revealTexts = document.querySelectorAll("[data-scroll-reveal]");
const wordRevealGroups = document.querySelectorAll("[data-word-reveal]");
const letterDropTexts = document.querySelectorAll("[data-letter-drop]");
const typewriterTexts = document.querySelectorAll("[data-typewriter]");
const maskRevealTitles = document.querySelectorAll("[data-mask-reveal]");
const homeLetterTexts = document.querySelectorAll(".home-letters");
const homeSymbolLayer = document.querySelector(".home-symbols");
const homeProcessItems = document.querySelectorAll(".home-process__item");
const textureCards = document.querySelectorAll(".texture-card");
const homeMemory = document.querySelector(".home-memory");
const homeSystemIndex = document.querySelector(".home-system-index");
const siteFooter = document.querySelector(".site-footer");
const productStepsFrame = document.querySelector(".product-steps-frame");
const osRevealStack = document.querySelector(".reveal--os");
const osReturnStack = document.querySelector(".os-return");
const memoryTabs = document.querySelectorAll("[data-memory-tab]");
const memoryPanes = document.querySelectorAll("[data-memory-pane]");
const modelPartConfigs = [
  {
    key: "interface",
    path: "3d_Models/GLTF/METAL_RING.glb",
    assembledPosition: [-1.2, 0.8, 0.2],
    position: [-4.35, 2.05, 0],
    compactPosition: [-1.45, 1.05, 0],
    compactAssembledPosition: [-0.25, 0.25, 0.2],
    rotation: [-0.2094, 5.8992, -0.1222],
    size: 1.66,
    compactSize: 0.92,
  },
  {
    key: "engine",
    path: "3d_Models/GLTF/CHIP.glb",
    assembledPosition: [-1.2, 0.8, 0],
    position: [-1.2, 0.8, 0],
    compactPosition: [-0.25, 0.25, 0],
    compactAssembledPosition: [-0.25, 0.25, 0],
    rotation: [-0.2094, 5.8992, -0.1222],
    size: 1.45,
    compactSize: 0.82,
  },
  {
    key: "outer",
    path: "3d_Models/GLTF/GLASS.glb",
    assembledPosition: [-1.2, 0.8, -0.2],
    position: [3.0, -0.55, 0],
    compactPosition: [1.2, -0.45, 0],
    compactAssembledPosition: [-0.25, 0.25, -0.2],
    rotation: [-0.2094, 5.8992, -0.1222],
    size: 4.25,
    compactSize: 2.3,
  },
];
const sourceMaterialProfiles = {
  interface: {
    color: 0xd9d7d1,
    roughness: 0.22,
    metalness: 1,
    envMapIntensity: 1.35,
    opacity: 1,
  },
  outer: {
    color: 0xe6f0f2,
    roughness: 0.08,
    metalness: 0,
    specularIntensity: 1,
    envMapIntensity: 1.65,
    opacity: 0.28,
    transmission: 0.6,
    thickness: 0.35,
    ior: 1.45,
    transparent: true,
  },
};

function getRegionCode() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const region = locale.match(/-([A-Za-z]{2})\b/);

  return (region?.[1] || "US").toUpperCase();
}

function updateLocaleTime() {
  if (!localeTime) return;

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  localeTime.textContent = `${getRegionCode()}_${time}`;
}

updateLocaleTime();
window.setInterval(updateLocaleTime, 1000);

function setupRevealText(element) {
  const text = element.dataset.revealText || element.textContent.trim();
  const fragment = document.createDocumentFragment();

  element.textContent = "";

  if (element.dataset.revealIndent !== "false") {
    const indent = document.createElement("span");
    indent.className = "reveal__indent";
    fragment.appendChild(indent);
  }

  for (const character of text) {
    if (character === "\n") {
      fragment.appendChild(document.createElement("br"));
      continue;
    }

    if (character === " ") {
      fragment.appendChild(document.createTextNode(" "));
      continue;
    }

    const span = document.createElement("span");
    span.className = "reveal__char";
    span.textContent = character;
    fragment.appendChild(span);
  }

  element.appendChild(fragment);
}

function updateRevealText() {
  for (const element of revealTexts) {
    const chars = element.querySelectorAll(".reveal__char");
    const reveal = element.closest(".reveal") || element;
    const rect = reveal.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const rawProgress = reveal.classList.contains("reveal--os")
      ? (viewportHeight * 0.92 - rect.top) / (viewportHeight * 0.72)
      : (viewportHeight * 0.78 - rect.top) / (rect.height + viewportHeight * 0.16);
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    const activeCount = Math.round(chars.length * progress);

    chars.forEach((char, index) => {
      char.classList.toggle("is-active", index < activeCount);
    });
  }
}

function setupLetterDrop(element) {
  const text = element.textContent.trim();
  const fragment = document.createDocumentFragment();
  let index = 0;

  element.setAttribute("aria-label", text);
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "letter-space";
      span.textContent = "\u00a0";
      fragment.appendChild(span);
      continue;
    }

    span.className = "letter-drop";
    span.style.setProperty("--letter-index", index);
    span.textContent = character;
    fragment.appendChild(span);
    index += 1;
  }

  element.appendChild(fragment);
}

function setupTypewriterText(element) {
  const text = element.textContent.trim();
  const fragment = document.createDocumentFragment();
  let index = 0;

  element.setAttribute("aria-label", text);
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "typewriter-space";
      span.textContent = "\u00a0";
      fragment.appendChild(span);
      continue;
    }

    span.className = "typewriter-char";
    span.style.setProperty("--typewriter-index", index);
    span.textContent = character;
    fragment.appendChild(span);
    index += 1;
  }

  element.appendChild(fragment);
}

function setupHomeSymbols(layer) {
  const states = [];

  for (const symbol of layer.querySelectorAll("span")) {
    const text = symbol.textContent;
    const fragment = document.createDocumentFragment();

    for (const character of text) {
      if (character === "\n") {
        fragment.appendChild(document.createElement("br"));
        continue;
      }

      if (character === " ") {
        fragment.appendChild(document.createTextNode(" "));
        continue;
      }

      const cell = document.createElement("i");
      cell.textContent = character;
      cell.style.setProperty("--symbol-enter-x", `${(Math.random() - 0.5) * 0.9}rem`);
      cell.style.setProperty("--symbol-enter-y", `${0.35 + Math.random() * 0.9}rem`);
      fragment.appendChild(cell);
      states.push({
        cell,
        x: 0,
        y: 0,
        dx: 1,
        dy: 0,
        life: Math.floor(Math.random() * 4),
      });
    }

    symbol.textContent = "";
    symbol.appendChild(fragment);
  }

  const shuffled = [...states].sort(() => Math.random() - 0.5);
  const revealStart = 460;
  const revealStep = 22;

  shuffled.forEach(({ cell }, index) => {
    window.setTimeout(() => {
      cell.classList.add("is-symbol-active");
    }, revealStart + index * revealStep + Math.random() * 360);
  });

  window.setInterval(() => {
    for (const state of states) {
      if (!state.cell.classList.contains("is-symbol-active")) continue;

      if (state.life <= 0 || Math.random() > 0.62) {
        const turns = [
          [state.dy, -state.dx],
          [-state.dy, state.dx],
          [state.dx, state.dy],
        ];
        const [nextDx, nextDy] = turns[Math.floor(Math.random() * turns.length)];
        state.dx = nextDx;
        state.dy = nextDy;
        state.life = 1 + Math.floor(Math.random() * 3);
      }

      state.x += state.dx;
      state.y += state.dy;

      if (state.x > 4 || state.x < -4) {
        state.dx *= -1;
        state.x = Math.max(-4, Math.min(4, state.x));
      }

      if (state.y > 4 || state.y < -4) {
        state.dy *= -1;
        state.y = Math.max(-4, Math.min(4, state.y));
      }

      state.cell.style.setProperty("--symbol-tx", `${state.x * 0.28}rem`);
      state.cell.style.setProperty("--symbol-ty", `${state.y * 0.28}rem`);
      state.life -= 1;
    }
  }, 460);
}

function setupHomeLetters(element, startIndex = 0) {
  const text = element.textContent.replace(/\s+/g, " ");
  const fragment = document.createDocumentFragment();
  let index = startIndex;
  let visibleCharacterCount = 0;

  element.setAttribute("aria-label", text.trim());
  element.textContent = "";

  for (const character of text) {
    const span = document.createElement("span");
    span.setAttribute("aria-hidden", "true");

    if (character === " ") {
      span.className = "home-letter-space";
      span.textContent = "\u00a0";
      fragment.appendChild(span);
      continue;
    }

    span.className = "home-letter";
    span.style.setProperty("--home-letter-index", index);
    span.textContent = character;
    fragment.appendChild(span);
    index += 1;
    visibleCharacterCount += 1;
  }

  element.appendChild(fragment);

  return visibleCharacterCount;
}

function setupMaskRevealTitle(element) {
  const lines = Array.from(element.children);
  let globalLetterIndex = 0;

  for (const line of lines) {
    const text = line.textContent.replace(/\u00a0/g, " ");
    const fragment = document.createDocumentFragment();
    const chars = Array.from(text);

    line.classList.add("product-system__title-line");
    line.textContent = "";

    for (const character of chars) {
      if (character === " ") {
        const space = document.createElement("span");

        space.className = "product-system__title-space";
        space.setAttribute("aria-hidden", "true");
        fragment.appendChild(space);
        continue;
      }

      const span = document.createElement("span");
      span.className = "product-system__title-char";
      span.dataset.maskIndex = globalLetterIndex;
      span.textContent = character;
      fragment.appendChild(span);
      globalLetterIndex += 1;
    }

    line.appendChild(fragment);
  }
}

function updateMaskRevealTitles() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  for (const title of maskRevealTitles) {
    const section = title.closest(".product-system");
    const rect = section.getBoundingClientRect();
    const chars = title.querySelectorAll(".product-system__title-char");
    const totalChars = chars.length || 1;
    const raw = (viewportHeight * 0.68 - rect.top) / (viewportHeight * 0.46);
    const progress = Math.min(Math.max(raw, 0), 1);
    const stagger = Math.min(0.045, 0.68 / totalChars);

    chars.forEach((char) => {
      const index = Number(char.dataset.maskIndex) || 0;
      const reverseIndex = totalChars - index - 1;
      const local = Math.min(Math.max((progress - reverseIndex * stagger) / 0.24, 0), 1);
      const y = (1 - easeOutCubic(local)) * 105;

      char.style.transform = `translateY(${y}%)`;
    });
  }
}

for (const element of revealTexts) {
  setupRevealText(element);
}

updateRevealText();
window.addEventListener("scroll", updateRevealText, { passive: true });
window.addEventListener("resize", updateRevealText);

function updateWordRevealText() {
  for (const group of wordRevealGroups) {
    const items = group.querySelectorAll("li");
    const rect = group.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const rawProgress = (viewportHeight * 0.72 - rect.top) / (rect.height + viewportHeight * 0.08);
    const progress = Math.min(Math.max(rawProgress, 0), 1);
    const activeCount = Math.round(items.length * progress);

    items.forEach((item, index) => {
      item.classList.toggle("is-active", index < activeCount);
    });
  }
}

updateWordRevealText();
window.addEventListener("scroll", updateWordRevealText, { passive: true });
window.addEventListener("resize", updateWordRevealText);

for (const element of letterDropTexts) {
  setupLetterDrop(element);
}

for (const element of typewriterTexts) {
  setupTypewriterText(element);
}

let homeLetterOffset = 0;

for (const element of homeLetterTexts) {
  homeLetterOffset += setupHomeLetters(element, homeLetterOffset);
}

if (homeSymbolLayer) {
  setupHomeSymbols(homeSymbolLayer);
}

for (const card of textureCards) {
  setupTextureCardHover(card);
}

if (siteMenu && siteMenuButton) {
  siteMenuButton.setAttribute("aria-expanded", "false");

  siteMenuButton.addEventListener("click", () => {
    const isOpen = siteMenu.classList.toggle("is-menu-open");
    siteMenuButton.setAttribute("aria-expanded", String(isOpen));
    siteMenu.classList.remove("is-dot-swapping");
    void siteMenu.offsetWidth;
    siteMenu.classList.add("is-dot-swapping");
  });

  document.addEventListener("click", (event) => {
    if (!siteMenu.contains(event.target)) {
      siteMenu.classList.remove("is-menu-open");
      siteMenuButton.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      siteMenu.classList.remove("is-menu-open");
      siteMenuButton.setAttribute("aria-expanded", "false");
      siteMenuButton.focus();
    }
  });
}

for (const element of maskRevealTitles) {
  setupMaskRevealTitle(element);
}

updateMaskRevealTitles();
window.addEventListener("scroll", updateMaskRevealTitles, { passive: true });
window.addEventListener("resize", updateMaskRevealTitles);

function updateFooterCover() {
  if (!siteFooter) return;

  const rect = siteFooter.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const isActive = rect.top <= 0 && rect.bottom > viewportHeight * 0.08;

  siteFooter.classList.toggle("is-footer-cover-active", isActive);
}

updateFooterCover();
window.addEventListener("scroll", updateFooterCover, { passive: true });
window.addEventListener("resize", updateFooterCover);

function updateProductStepsFrame() {
  if (!productStepsFrame) return;

  const rect = productStepsFrame.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const isActive = rect.top <= 0 && rect.bottom > viewportHeight * 0.05;

  productStepsFrame.classList.toggle("is-product-steps-active", isActive);
}

updateProductStepsFrame();
window.addEventListener("scroll", updateProductStepsFrame, { passive: true });
window.addEventListener("resize", updateProductStepsFrame);

function updateOsRevealStack() {
  if (!osRevealStack) return;

  const rect = osRevealStack.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const isActive = rect.top <= 0 && rect.bottom > viewportHeight * 0.05;

  osRevealStack.classList.toggle("is-os-reveal-active", isActive);
}

updateOsRevealStack();
window.addEventListener("scroll", updateOsRevealStack, { passive: true });
window.addEventListener("resize", updateOsRevealStack);

function updateOsReturnStack() {
  if (!osReturnStack) return;

  const rect = osReturnStack.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const isActive = rect.top <= 0 && rect.bottom > viewportHeight * 0.05;

  osReturnStack.classList.toggle("is-os-return-active", isActive);
}

updateOsReturnStack();
window.addEventListener("scroll", updateOsReturnStack, { passive: true });
window.addEventListener("resize", updateOsReturnStack);

function updateHomeSystemIndexCover() {
  if (!homeSystemIndex) return;

  const rect = homeSystemIndex.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const coverProgress = Math.min(Math.max((viewportHeight - rect.top) / viewportHeight, 0), 1);
  const imageProgress = Math.min(Math.max(coverProgress / 0.5, 0), 1);
  const textProgress = Math.min(Math.max((coverProgress - 0.5) / 0.5, 0), 1);
  const isCovering = rect.top <= viewportHeight && rect.top > 0;

  homeSystemIndex.style.setProperty("--home-system-image-cover", imageProgress.toFixed(4));
  homeSystemIndex.style.setProperty("--home-system-text-cover", textProgress.toFixed(4));
  homeSystemIndex.classList.toggle("is-home-system-covering", isCovering);
  homeMemory?.classList.toggle("is-home-memory-underlay", isCovering);
}

updateHomeSystemIndexCover();
window.addEventListener("scroll", updateHomeSystemIndexCover, { passive: true });
window.addEventListener("resize", updateHomeSystemIndexCover);

if (memoryTabs.length > 0 && memoryPanes.length > 0) {
  for (const tab of memoryTabs) {
    tab.addEventListener("click", () => {
      const target = tab.dataset.memoryTab;

      for (const item of memoryTabs) {
        const isActive = item === tab;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      }

      for (const pane of memoryPanes) {
        pane.classList.toggle("is-active", pane.dataset.memoryPane === target);
      }
    });
  }
}

if (letterDropTexts.length > 0) {
  const letterDropObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-letter-drop-active", entry.isIntersecting);
      }
    },
    { threshold: 0.55 },
  );

  for (const element of letterDropTexts) {
    letterDropObserver.observe(element);
  }
}

if (typewriterTexts.length > 0) {
  const typewriterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-typewriter-active", entry.isIntersecting);
      }
    },
    { threshold: 0.58 },
  );

  for (const element of typewriterTexts) {
    typewriterObserver.observe(element);
  }
}

if (homeProcessItems.length > 0) {
  const homeProcessObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-process-active", entry.isIntersecting);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.42 },
  );

  for (const item of homeProcessItems) {
    homeProcessObserver.observe(item);
  }
}

const productScene = document.querySelector("[data-product-scene]");
const productCutoutScene = document.querySelector("[data-product-cutout-scene]");

if (productScene) {
  loadThree().then(() => setupProductScene(productScene));
}

if (productCutoutScene) {
  setupProductCutoutScene(productCutoutScene);
}

setupPartThumbnails();

async function loadThree() {
  if (THREE && GLTFLoader) return;

  const [threeModule, loaderModule] = await Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
  ]);

  THREE = threeModule;
  GLTFLoader = loaderModule.GLTFLoader;
}

function setupProductCutoutScene(figure) {
  const scene = figure.querySelector(".product-cutout-scene");
  const hotspots = figure.querySelectorAll("[data-part-hotspot]");
  const cards = new Map(
    Array.from(document.querySelectorAll("[data-part-card]")).map((card) => [
      card.dataset.partCard,
      card,
    ]),
  );
  const useScrollExplosion = !window.matchMedia("(max-width: 760px)").matches;

  function updateProgress() {
    if (!scene) return;

    const progress = useScrollExplosion ? getExplosionProgress(figure) : 1;
    scene.style.setProperty("--explode-progress", progress.toFixed(4));
  }

  for (const hotspot of hotspots) {
    hotspot.addEventListener("pointerenter", (event) => {
      setActivePart(hotspot.dataset.partHotspot, cards);
      movePartCardToPointer(hotspot.dataset.partHotspot, cards, figure, event);
    });
    hotspot.addEventListener("pointermove", (event) => {
      movePartCardToPointer(hotspot.dataset.partHotspot, cards, figure, event);
    });
    hotspot.addEventListener("focus", () => {
      setActivePart(hotspot.dataset.partHotspot, cards);
    });
    hotspot.addEventListener("pointerleave", () => {
      setActivePart(null, cards);
    });
    hotspot.addEventListener("blur", () => {
      setActivePart(null, cards);
      resetPartCardPosition(hotspot.dataset.partHotspot, cards);
    });
  }

  figure.classList.add("is-cutout-ready");
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function movePartCardToPointer(part, cards, figure, event) {
  const card = cards.get(part);
  const wrap = card?.closest(".part-card-wrap");

  if (!card || !wrap || !figure || !event) return;

  const figureRect = figure.getBoundingClientRect();
  const cardWidth = card.offsetWidth || 340;
  const cardHeight = card.offsetHeight || 141;
  const gutter = 12;
  const pointerOffset = 18;
  const rawX = event.clientX - figureRect.left + pointerOffset;
  const rawY = event.clientY - figureRect.top - cardHeight / 2;
  const x = Math.min(Math.max(rawX, gutter), figureRect.width - cardWidth - gutter);
  const y = Math.min(Math.max(rawY, gutter), figureRect.height - cardHeight - gutter);

  wrap.classList.add("is-following-pointer");
  wrap.style.left = `${x}px`;
  wrap.style.top = `${y}px`;
  wrap.style.right = "auto";
}

function resetPartCardPosition(part, cards) {
  const card = cards.get(part);
  const wrap = card?.closest(".part-card-wrap");

  if (!wrap) return;

  wrap.classList.remove("is-following-pointer");
  wrap.style.left = "";
  wrap.style.top = "";
  wrap.style.right = "";
}

function setupTextureCardHover(card) {
  const label = card.querySelector(".texture-card__label");
  const stack = card.closest(".texture-stack");

  if (!label || !stack) return;

  card.addEventListener("pointerenter", (event) => {
    moveTextureLabelToPointer(card, label, stack, event);
  });

  card.addEventListener("pointermove", (event) => {
    moveTextureLabelToPointer(card, label, stack, event);
  });

  card.addEventListener("focus", () => {
    label.classList.remove("is-following-pointer");
    label.style.left = "";
    label.style.top = "";
  });
}

function moveTextureLabelToPointer(card, label, stack, event) {
  const cardRect = card.getBoundingClientRect();
  const stackRect = stack.getBoundingClientRect();
  const labelWidth = label.offsetWidth || 150;
  const labelHeight = label.offsetHeight || 70;
  const gutter = 10;
  const pointerOffset = 16;
  const minX = stackRect.left - cardRect.left + gutter;
  const maxX = stackRect.right - cardRect.left - labelWidth - gutter;
  const minY = stackRect.top - cardRect.top + gutter;
  const maxY = stackRect.bottom - cardRect.top - labelHeight - gutter;
  const rawX = event.clientX - cardRect.left + pointerOffset;
  const rawY = event.clientY - cardRect.top - labelHeight / 2;
  const x = Math.min(Math.max(rawX, minX), maxX);
  const y = Math.min(Math.max(rawY, minY), maxY);

  label.classList.add("is-following-pointer");
  label.style.left = `${x}px`;
  label.style.top = `${y}px`;
}

function setupProductScene(canvas) {
  const figure = canvas.closest(".product-system__figure");
  const cards = new Map(
    Array.from(document.querySelectorAll("[data-part-card]")).map((card) => [
      card.dataset.partCard,
      card,
    ]),
  );
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
  });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 3.35, -3.35, 0.1, 100);
  const loader = new GLTFLoader();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(10, 10);
  const interactiveParts = [];
  const animatedParts = [];
  let activePart = null;
  const isCompactScene = window.matchMedia("(max-width: 760px)").matches;
  let cameraViewHeight = isCompactScene ? 5.2 : 6.7;
  const useScrollExplosion =
    figure?.dataset.showTuner !== "true" && !isCompactScene;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const lights = {
    ambient: new THREE.AmbientLight(0xffffff, 0),
    key: new THREE.DirectionalLight(0xffffff, 0),
    fill: new THREE.DirectionalLight(0xffffff, 0),
    front: new THREE.DirectionalLight(0xffffff, 3.7),
    rim: new THREE.DirectionalLight(0xc5ffae, 1.5),
  };

  scene.add(lights.ambient);

  lights.key.position.set(5.5, 4, 7.1);
  scene.add(lights.key);

  lights.fill.position.set(6.7, -1.6, 5);
  scene.add(lights.fill);

  lights.front.position.set(0, 0, 6);
  scene.add(lights.front);

  lights.rim.position.set(3, 1.5, 4);
  scene.add(lights.rim);

  const sceneParts = modelPartConfigs.map((part) => getResponsivePartConfig(part, isCompactScene));

  Promise.all(sceneParts.map((part) => loadPart(loader, part)))
    .then((loadedParts) => {
      for (const part of loadedParts) {
        scene.add(part.group);
        interactiveParts.push(...part.meshes);
        animatedParts.push(part);
      }

      figure?.classList.add("is-3d-ready");
      if (figure?.dataset.showTuner === "true") {
        createModelTuner(figure, loadedParts, lights, {
          getViewHeight: () => cameraViewHeight,
          setViewHeight: (value) => {
            cameraViewHeight = value;
            setRendererSize();
          },
        });
      }
      setRendererSize();
      animate();
    })
    .catch(() => {
      setRendererSize();
    });

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.set(10, 10);
    setActivePart(null, cards);
  });

  window.addEventListener("resize", setRendererSize);

  function setRendererSize() {
    const { width, height } = canvas.getBoundingClientRect();

    renderer.setSize(width, height, false);

    const aspect = width / Math.max(height, 1);
    const viewHeight = cameraViewHeight;
    const viewWidth = viewHeight * aspect;

    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
  }

  function animate() {
    requestAnimationFrame(animate);

    if (useScrollExplosion) {
      updateExplosionProgress(animatedParts, figure);
    }

    for (const mesh of interactiveParts) {
      mesh.parent.rotation.z += mesh.userData.spin || 0;
    }

    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactiveParts, true)[0];
    const nextPart = hit?.object.userData.part || null;

    if (nextPart !== activePart) {
      activePart = nextPart;
      setActivePart(activePart, cards);
      canvas.style.cursor = activePart ? "pointer" : "default";
    }

    renderer.render(scene, camera);
  }
}

function getResponsivePartConfig(part, isCompact) {
  if (!isCompact) return part;

  return {
    ...part,
    assembledPosition: part.compactAssembledPosition || part.assembledPosition,
    position: part.compactPosition || part.position,
    size: part.compactSize || part.size,
  };
}

async function loadPart(loader, part) {
  const gltf = await loader.loadAsync(part.path);
  const group = new THREE.Group();
  const model = gltf.scene;
  const meshes = [];
  const assembledPosition = new THREE.Vector3(...(part.assembledPosition || part.position));
  const explodedPosition = new THREE.Vector3(...part.position);

  group.add(model);
  normalizeModel(model, part.size);
  group.position.copy(explodedPosition);
  group.rotation.set(...part.rotation);

  model.traverse((child) => {
    if (!child.isMesh) return;

    child.userData.part = part.key;
    child.castShadow = false;
    child.receiveShadow = false;
    applySourceMaterial(part.key, child.material);
    meshes.push(child);
  });

  group.userData.part = part.key;

  return {
    key: part.key,
    group,
    meshes,
    initialSize: part.size,
    model,
    assembledPosition,
    explodedPosition,
  };
}

function updateExplosionProgress(parts, figure) {
  if (!figure) return;

  const progress = getExplosionProgress(figure);

  for (const part of parts) {
    part.group.position.lerpVectors(part.assembledPosition, part.explodedPosition, progress);
  }
}

function getExplosionProgress(figure) {
  if (!figure) return 1;

  const section = figure.closest(".product-system");
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const startOffset = viewportHeight * 0.02;
  const scrollDistance = viewportHeight * 0.18;
  const raw = (Math.max(-rect.top, 0) - startOffset) / scrollDistance;

  return smoothstep(Math.min(Math.max(raw, 0), 1));
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function normalizeModel(model, targetSize) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;

  model.position.sub(center);
  model.scale.setScalar(targetSize / maxAxis);
}

function setActivePart(part, cards) {
  for (const [key, card] of cards) {
    const isActive = key === part;
    const wasActive = card.classList.contains("is-active");

    card.classList.toggle("is-active", isActive);

    if (isActive && !wasActive) {
      activateProgressLine(card);
    }

    if (!isActive) {
      resetProgressLine(card);
    }
  }
}

function activateProgressLine(card) {
  const line = card.querySelector(".progress-line");

  if (!line) return;

  line.style.transition = "none";
  line.style.transform = "scaleX(0)";
  void line.offsetWidth;
  line.style.transition = "transform 5s linear, opacity 0.3s";
  line.style.transform = "scaleX(1)";
}

function resetProgressLine(card) {
  const line = card.querySelector(".progress-line");

  if (!line) return;

  line.style.transition = "none";
  line.style.transform = "scaleX(0)";
  void line.offsetWidth;
  line.style.transition = "transform 5s linear, opacity 0.3s";
}

function setupPartThumbnails() {
  const canvases = document.querySelectorAll("[data-part-thumb]");

  for (const canvas of canvases) {
    const config = modelPartConfigs.find((part) => part.key === canvas.dataset.partThumb);

    if (config) setupPartThumbnail(canvas, config);
  }
}

function setupPartThumbnail(canvas, config) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1.25, 1.25, 1.4, -1.4, 0.1, 100);
  const loader = new GLTFLoader();

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));

  const light = new THREE.DirectionalLight(0xffffff, 2.4);
  light.position.set(0, 0, 4);
  scene.add(light);

  loader.load(config.path, (gltf) => {
    const model = gltf.scene;

    normalizeModel(model, config.key === "outer" ? 1.7 : 1.3);
    model.rotation.set(...config.rotation);
    model.traverse((child) => {
      if (child.isMesh) applySourceMaterial(config.key, child.material);
    });
    scene.add(model);
    sizeThumbnailRenderer();
    renderer.render(scene, camera);
  });

  function sizeThumbnailRenderer() {
    const { width, height } = canvas.getBoundingClientRect();

    renderer.setSize(width, height, false);
  }
}

function softenMaterial(material) {
  const materials = Array.isArray(material) ? material : [material];

  for (const item of materials) {
    if (!item) continue;

    if ("roughness" in item) {
      item.roughness = Math.max(item.roughness ?? 0, 0.68);
    }

    if ("metalness" in item) {
      item.metalness = Math.min(item.metalness ?? 0, 0.55);
    }

    item.needsUpdate = true;
  }
}

function applySourceMaterial(partKey, material) {
  const profile = sourceMaterialProfiles[partKey];

  if (!profile) {
    softenMaterial(material);
    return;
  }

  const materials = Array.isArray(material) ? material : [material];

  for (const item of materials) {
    if (!item) continue;

    item.color?.setHex(profile.color);
    applyMaterialProperty(item, "roughness", profile.roughness);
    applyMaterialProperty(item, "metalness", profile.metalness);
    applyMaterialProperty(item, "specularIntensity", profile.specularIntensity);
    applyMaterialProperty(item, "envMapIntensity", profile.envMapIntensity);
    applyMaterialProperty(item, "opacity", profile.opacity);
    applyMaterialProperty(item, "transmission", profile.transmission);
    applyMaterialProperty(item, "thickness", profile.thickness);
    applyMaterialProperty(item, "ior", profile.ior);

    item.transparent = Boolean(profile.transparent);
    item.depthWrite = !profile.transparent;
    item.side = profile.transparent ? THREE.DoubleSide : THREE.FrontSide;
    item.needsUpdate = true;
  }
}

function applyMaterialProperty(material, key, value) {
  if (value === undefined || !(key in material)) return;

  material[key] = value;
}

function firstMaterial(part) {
  let material = null;

  if (part.mesh?.isMesh) {
    return Array.isArray(part.mesh.material) ? part.mesh.material[0] : part.mesh.material;
  }

  part.model.traverse((child) => {
    if (material || !child.isMesh) return;
    material = Array.isArray(child.material) ? child.material[0] : child.material;
  });

  return material;
}

function forEachMaterial(part, callback) {
  if (part.mesh?.isMesh) {
    const materials = Array.isArray(part.mesh.material) ? part.mesh.material : [part.mesh.material];

    for (const material of materials) {
      if (material) callback(material);
    }
    return;
  }

  part.model.traverse((child) => {
    if (!child.isMesh) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];

    for (const material of materials) {
      if (material) callback(material);
    }
  });
}

function applyMaterialValue(part, key, value) {
  forEachMaterial(part, (material) => {
    if (!(key in material)) return;

    material[key] = value;

    if (key === "opacity") {
      material.transparent = value < 1;
      material.depthWrite = value >= 0.5;
    }

    material.needsUpdate = true;
  });
}

function applyMaterialColor(part, value) {
  forEachMaterial(part, (material) => {
    if (!material.color) return;

    material.color.set(value);
    material.needsUpdate = true;
  });
}

function getMeshOptions(part) {
  const options = [new Option("All meshes", "all")];
  let index = 1;

  part.model.traverse((child) => {
    if (!child.isMesh) return;

    if (!child.userData.tunerMeshId) {
      child.userData.tunerMeshId = `mesh-${index}`;
    }

    options.push(new Option(child.name || `mesh ${index}`, child.userData.tunerMeshId));
    index += 1;
  });

  return options;
}

function getSelectedMaterialTarget(part, meshKey) {
  if (!meshKey || meshKey === "all") return part;

  let mesh = null;

  part.model.traverse((child) => {
    if (mesh || !child.isMesh) return;
    if (child.userData.tunerMeshId === meshKey) mesh = child;
  });

  return mesh ? { key: `${part.key}/${mesh.name || meshKey}`, mesh } : part;
}

function applyMaterialPreset(part, preset) {
  const leopardTexture = preset === "leopard" ? createLeopardTexture() : null;

  forEachMaterial(part, (material) => {
    material.map = leopardTexture || null;

    if (material.color) {
      material.color.set(getPresetColor(preset));
    }

    if ("roughness" in material) material.roughness = getPresetRoughness(preset);
    if ("metalness" in material) material.metalness = getPresetMetalness(preset);
    if ("opacity" in material) {
      material.opacity = getPresetOpacity(preset);
      material.transparent = material.opacity < 1;
      material.depthWrite = material.opacity >= 0.5;
    }

    material.needsUpdate = true;
  });
}

function getPresetColor(preset) {
  return {
    "brushed metal": "#c9c7c0",
    "dark glass": "#111111",
    "matte black": "#050505",
    "copper circuit": "#b87552",
    leopard: "#d8aa58",
  }[preset] || "#ffffff";
}

function getPresetRoughness(preset) {
  return {
    "brushed metal": 0.32,
    "dark glass": 0.18,
    "matte black": 0.86,
    "copper circuit": 0.58,
    leopard: 0.72,
  }[preset] ?? 0.68;
}

function getPresetMetalness(preset) {
  return {
    "brushed metal": 0.85,
    "dark glass": 0.08,
    "matte black": 0.12,
    "copper circuit": 0.45,
    leopard: 0.05,
  }[preset] ?? 0.2;
}

function getPresetOpacity(preset) {
  return preset === "dark glass" ? 0.42 : 1;
}

function createLeopardTexture() {
  const canvas = document.createElement("canvas");
  const size = 256;
  const context = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;
  context.fillStyle = "#d8aa58";
  context.fillRect(0, 0, size, size);

  for (let index = 0; index < 42; index += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 7 + Math.random() * 14;

    context.fillStyle = "#2b1b10";
    context.beginPath();
    context.ellipse(x, y, radius, radius * (0.55 + Math.random() * 0.35), Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#b87937";
    context.beginPath();
    context.ellipse(x, y, radius * 0.48, radius * 0.28, Math.random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  return texture;
}

function createModelTuner(figure, loadedParts, lights, cameraControls) {
  if (!figure) return;

  const state = new Map(loadedParts.map((part) => [part.key, part]));
  const panel = document.createElement("aside");
  const select = document.createElement("select");
  const output = document.createElement("pre");
  const controls = [
    { key: "rotX", label: "Rotate X", min: -180, max: 540, step: 1 },
    { key: "rotY", label: "Rotate Y", min: -180, max: 540, step: 1 },
    { key: "rotZ", label: "Rotate Z", min: -180, max: 540, step: 1 },
    { key: "posX", label: "Move X", min: -6, max: 6, step: 0.05 },
    { key: "posY", label: "Move Y", min: -4, max: 4, step: 0.05 },
    { key: "posZ", label: "Move Z", min: -3, max: 3, step: 0.05 },
    { key: "scale", label: "Scale", min: 0.2, max: 3, step: 0.02 },
  ];
  const inputs = new Map();

  panel.className = "model-tuner";
  panel.innerHTML = "<h3>3D tuner</h3>";

  for (const part of loadedParts) {
    const option = document.createElement("option");

    option.value = part.key;
    option.textContent = part.key;
    select.appendChild(option);
  }

  panel.appendChild(select);

  for (const control of controls) {
    const label = document.createElement("label");
    const value = document.createElement("span");
    const input = document.createElement("input");

    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    input.dataset.control = control.key;
    value.className = "model-tuner__value";
    label.textContent = control.label;
    label.appendChild(value);
    label.appendChild(input);
    panel.appendChild(label);
    inputs.set(control.key, { input, value });

    input.addEventListener("input", () => {
      applyTunerValues(state.get(select.value), inputs);
      updateTunerOutput(state.get(select.value), inputs, output);
    });
  }

  output.className = "model-tuner__output";
  panel.appendChild(output);
  panel.appendChild(createCameraTuner(cameraControls));
  panel.appendChild(createMaterialTuner(state, select));
  panel.appendChild(createLightingTuner(lights));
  figure.appendChild(panel);

  select.addEventListener("change", () => {
    syncTunerInputs(state.get(select.value), inputs);
    updateTunerOutput(state.get(select.value), inputs, output);
  });

  syncTunerInputs(state.get(select.value), inputs);
  updateTunerOutput(state.get(select.value), inputs, output);
}

function createMaterialTuner(state, select) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const output = document.createElement("pre");
  const meshLabel = document.createElement("label");
  const meshSelect = document.createElement("select");
  const presetLabel = document.createElement("label");
  const presetSelect = document.createElement("select");
  const controls = [
    { key: "roughness", label: "Roughness", min: 0, max: 1, step: 0.01 },
    { key: "metalness", label: "Metalness", min: 0, max: 1, step: 0.01 },
    { key: "opacity", label: "Opacity", min: 0.05, max: 1, step: 0.01 },
    { key: "envMapIntensity", label: "Env intensity", min: 0, max: 3, step: 0.05 },
  ];
  const colorLabel = document.createElement("label");
  const colorInput = document.createElement("input");

  details.className = "model-tuner__section";
  details.open = true;
  summary.textContent = "Material";
  details.appendChild(summary);

  meshLabel.textContent = "Mesh";
  meshLabel.appendChild(meshSelect);
  details.appendChild(meshLabel);

  presetLabel.textContent = "Preset";
  for (const preset of ["custom", "brushed metal", "dark glass", "matte black", "copper circuit", "leopard"]) {
    const option = document.createElement("option");

    option.value = preset;
    option.textContent = preset;
    presetSelect.appendChild(option);
  }
  presetLabel.appendChild(presetSelect);
  details.appendChild(presetLabel);

  for (const control of controls) {
    const label = document.createElement("label");
    const value = document.createElement("span");
    const input = document.createElement("input");

    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    value.className = "model-tuner__value";
    label.textContent = control.label;
    label.appendChild(value);
    label.appendChild(input);
    details.appendChild(label);

    input.addEventListener("input", () => {
      const part = state.get(select.value);
      const target = getSelectedMaterialTarget(part, meshSelect.value);

      applyMaterialValue(target, control.key, Number(input.value));
      value.textContent = input.value;
      updateMaterialOutput(part, meshSelect.value, output);
    });

    control.input = input;
    control.value = value;
  }

  colorInput.type = "color";
  colorLabel.textContent = "Tint";
  colorLabel.appendChild(colorInput);
  details.appendChild(colorLabel);

  colorInput.addEventListener("input", () => {
    const part = state.get(select.value);
    const target = getSelectedMaterialTarget(part, meshSelect.value);

    applyMaterialColor(target, colorInput.value);
    updateMaterialOutput(part, meshSelect.value, output);
  });

  output.className = "model-tuner__output";
  details.appendChild(output);

  meshSelect.addEventListener("change", syncMaterialValues);
  presetSelect.addEventListener("change", () => {
    const target = getSelectedMaterialTarget(state.get(select.value), meshSelect.value);

    applyMaterialPreset(target, presetSelect.value);
    syncMaterialValues();
  });

  function sync() {
    const part = state.get(select.value);

    meshSelect.textContent = "";
    for (const option of getMeshOptions(part)) {
      meshSelect.appendChild(option);
    }
    syncMaterialValues();
  }

  function syncMaterialValues() {
    const part = state.get(select.value);
    const target = getSelectedMaterialTarget(part, meshSelect.value);
    const material = firstMaterial(target);

    for (const control of controls) {
      const raw = material?.[control.key];
      const fallback = control.key === "opacity" ? 1 : 0;

      control.input.value = Number(raw ?? fallback).toFixed(2);
      control.value.textContent = control.input.value;
    }

    colorInput.value = material?.color ? `#${material.color.getHexString()}` : "#ffffff";
    updateMaterialOutput(part, meshSelect.value, output);
  }

  select.addEventListener("change", sync);
  window.setTimeout(sync, 0);

  return details;
}

function updateMaterialOutput(part, meshKey, output) {
  const target = getSelectedMaterialTarget(part, meshKey);
  const material = firstMaterial(target);
  const number = (value) => (value == null ? "n/a" : Number(value).toFixed(2));

  output.textContent = `${target.key}
roughness: ${number(material?.roughness)}
metalness: ${number(material?.metalness)}
opacity: ${number(material?.opacity)}
envMapIntensity: ${number(material?.envMapIntensity)}
tint: ${material?.color ? `#${material.color.getHexString()}` : "n/a"}`;
}

function createCameraTuner(cameraControls) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const label = document.createElement("label");
  const value = document.createElement("span");
  const input = document.createElement("input");
  const output = document.createElement("pre");

  details.className = "model-tuner__section";
  details.open = true;
  summary.textContent = "Camera";
  input.type = "range";
  input.min = "3";
  input.max = "12";
  input.step = "0.05";
  input.value = cameraControls.getViewHeight().toFixed(2);
  value.className = "model-tuner__value";
  value.textContent = input.value;
  label.textContent = "Ortho size";
  label.appendChild(value);
  label.appendChild(input);
  output.className = "model-tuner__output";

  input.addEventListener("input", () => {
    cameraControls.setViewHeight(Number(input.value));
    value.textContent = input.value;
    output.textContent = `cameraViewHeight: ${Number(input.value).toFixed(2)}`;
  });

  output.textContent = `cameraViewHeight: ${Number(input.value).toFixed(2)}`;
  details.appendChild(summary);
  details.appendChild(label);
  details.appendChild(output);

  return details;
}

function createLightingTuner(lights) {
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const controls = [
    { light: "ambient", prop: "intensity", label: "Ambient", min: 0, max: 8, step: 0.05 },
    { light: "key", prop: "intensity", label: "Key", min: 0, max: 5, step: 0.05 },
    { light: "fill", prop: "intensity", label: "Fill", min: 0, max: 5, step: 0.05 },
    { light: "front", prop: "intensity", label: "Front", min: 0, max: 5, step: 0.05 },
    { light: "rim", prop: "intensity", label: "Rim", min: 0, max: 5, step: 0.05 },
    { light: "key", prop: "x", label: "Key X", min: -8, max: 8, step: 0.1 },
    { light: "key", prop: "y", label: "Key Y", min: -8, max: 8, step: 0.1 },
    { light: "key", prop: "z", label: "Key Z", min: -2, max: 10, step: 0.1 },
    { light: "fill", prop: "x", label: "Fill X", min: -8, max: 8, step: 0.1 },
    { light: "fill", prop: "y", label: "Fill Y", min: -8, max: 8, step: 0.1 },
    { light: "fill", prop: "z", label: "Fill Z", min: -2, max: 10, step: 0.1 },
    { light: "front", prop: "z", label: "Front Z", min: 0, max: 12, step: 0.1 },
    { light: "rim", prop: "intensity", label: "Rim Glow", min: 0, max: 3, step: 0.05 },
  ];
  const output = document.createElement("pre");

  details.className = "model-tuner__section model-tuner__lights";
  details.open = true;
  summary.textContent = "Lighting";
  details.appendChild(summary);

  for (const control of controls) {
    const label = document.createElement("label");
    const value = document.createElement("span");
    const input = document.createElement("input");
    const light = lights[control.light];

    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    input.value = getLightValue(light, control.prop).toFixed(2);
    value.className = "model-tuner__value";
    value.textContent = input.value;
    label.textContent = control.label;
    label.appendChild(value);
    label.appendChild(input);
    details.appendChild(label);

    input.addEventListener("input", () => {
      setLightValue(light, control.prop, Number(input.value));
      value.textContent = input.value;
      updateLightingOutput(lights, output);
    });
  }

  output.className = "model-tuner__output";
  details.appendChild(output);
  updateLightingOutput(lights, output);

  return details;
}

function getLightValue(light, prop) {
  if (prop === "intensity") return light.intensity;

  return light.position[prop];
}

function setLightValue(light, prop, value) {
  if (prop === "intensity") {
    light.intensity = value;
    return;
  }

  light.position[prop] = value;
}

function updateLightingOutput(lights, output) {
  output.textContent = `ambient: ${lights.ambient.intensity.toFixed(2)}
key: ${lights.key.intensity.toFixed(2)} @ [${formatVector(lights.key.position)}]
fill: ${lights.fill.intensity.toFixed(2)} @ [${formatVector(lights.fill.position)}]
front: ${lights.front.intensity.toFixed(2)} @ [${formatVector(lights.front.position)}]
rim: ${lights.rim.intensity.toFixed(2)} @ [${formatVector(lights.rim.position)}]`;
}

function formatVector(vector) {
  return [vector.x, vector.y, vector.z].map((value) => value.toFixed(2)).join(", ");
}

function syncTunerInputs(part, inputs) {
  const values = {
    rotX: THREE.MathUtils.radToDeg(part.group.rotation.x),
    rotY: THREE.MathUtils.radToDeg(part.group.rotation.y),
    rotZ: THREE.MathUtils.radToDeg(part.group.rotation.z),
    posX: part.group.position.x,
    posY: part.group.position.y,
    posZ: part.group.position.z,
    scale: part.group.scale.x,
  };

  for (const [key, entry] of inputs) {
    entry.input.value = values[key].toFixed(key.startsWith("rot") ? 0 : 2);
    entry.value.textContent = entry.input.value;
  }
}

function applyTunerValues(part, inputs) {
  const value = (key) => Number(inputs.get(key).input.value);

  part.group.rotation.set(
    THREE.MathUtils.degToRad(value("rotX")),
    THREE.MathUtils.degToRad(value("rotY")),
    THREE.MathUtils.degToRad(value("rotZ")),
  );
  part.group.position.set(value("posX"), value("posY"), value("posZ"));
  part.group.scale.setScalar(value("scale"));

  for (const entry of inputs.values()) {
    entry.value.textContent = entry.input.value;
  }
}

function updateTunerOutput(part, inputs, output) {
  const value = (key) => Number(inputs.get(key).input.value);
  const rotation = ["rotX", "rotY", "rotZ"]
    .map((key) => THREE.MathUtils.degToRad(value(key)).toFixed(4))
    .join(", ");
  const position = ["posX", "posY", "posZ"]
    .map((key) => value(key).toFixed(2))
    .join(", ");

  output.textContent = `${part.key}
position: [${position}],
rotation: [${rotation}],
scale: ${value("scale").toFixed(2)}`;
}
