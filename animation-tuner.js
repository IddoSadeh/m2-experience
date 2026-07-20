const scenes = {
  detection: {
    ascii: "assets/home-process-detection-ascii-figma.svg",
    photo: "assets/home-process-detection-color.png",
    alt: "m.2 sensor worn behind an ear.",
  },
  encoding: {
    ascii: "assets/home-process-encoding-ascii-figma.svg",
    photo: "assets/home-process-encoding-color.png",
    alt: "m.2 sensor held between fingers.",
  },
  capture: {
    ascii: "assets/home-process-capture-ascii-figma.svg",
    photo: "assets/home-process-capture-color.png",
    alt: "m.2 sensor held near a person's eye.",
  },
};

const defaults = {
  write: 200,
  pause: 120,
  fade: 1200,
};

const stage = document.querySelector("#animation-stage");
const asciiImage = document.querySelector("#animation-ascii");
const photo = document.querySelector("#animation-photo");
const sceneSelect = document.querySelector("#animation-scene");
const status = document.querySelector("#animation-status");
const total = document.querySelector("#animation-total");
const autoReplay = document.querySelector("#animation-auto-replay");
const replayButton = document.querySelector("#animation-replay");
const copyButton = document.querySelector("#animation-copy");
const resetButton = document.querySelector("#animation-reset");
const controlElements = {};

let characterPaths = [];
let runId = 0;
let replayTimer = 0;

for (const name of Object.keys(defaults)) {
  const range = document.querySelector(`#${name}-duration`);
  const number = document.querySelector(`#${name}-duration-number`);
  const output = document.querySelector(`[data-control="${name}"] output`);
  controlElements[name] = { range, number, output };
}

function getValues() {
  return Object.fromEntries(
    Object.entries(controlElements).map(([name, control]) => [name, Number(control.range.value)]),
  );
}

function updateSummary() {
  const values = getValues();
  const totalSeconds = (values.write + values.pause + values.fade) / 1000;
  total.textContent = `${totalSeconds.toFixed(2)} s`;

  for (const [name, control] of Object.entries(controlElements)) {
    control.output.textContent = `${values[name]} ms`;
  }
}

function scheduleReplay() {
  updateSummary();
  if (!autoReplay.checked) return;
  window.clearTimeout(replayTimer);
  replayTimer = window.setTimeout(playAnimation, 120);
}

function bindTimingControl(name) {
  const control = controlElements[name];

  control.range.addEventListener("input", () => {
    control.number.value = control.range.value;
    scheduleReplay();
  });

  control.number.addEventListener("input", () => {
    const minimum = Number(control.number.min);
    const maximum = Number(control.number.max);
    const value = Math.min(Math.max(Number(control.number.value) || minimum, minimum), maximum);
    control.range.value = String(value);
    scheduleReplay();
  });

  control.number.addEventListener("change", () => {
    control.number.value = control.range.value;
  });
}

async function loadScene() {
  const scene = scenes[sceneSelect.value];
  const currentRun = ++runId;
  status.textContent = "Loading";
  photo.src = scene.photo;
  photo.alt = scene.alt;
  photo.style.opacity = "0";
  stage.querySelector(".animation-tuner__ascii-svg")?.remove();
  asciiImage.hidden = false;
  asciiImage.src = scene.ascii;

  try {
    const response = await fetch(scene.ascii);
    if (!response.ok) throw new Error("Could not load ASCII artwork");
    const markup = await response.text();
    if (currentRun !== runId) return;

    const documentNode = new DOMParser().parseFromString(markup, "image/svg+xml");
    const svg = documentNode.documentElement;
    if (svg.nodeName.toLowerCase() !== "svg") throw new Error("Invalid ASCII artwork");

    svg.classList.add("animation-tuner__ascii-svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("preserveAspectRatio", "none");
    stage.appendChild(document.importNode(svg, true));
    asciiImage.hidden = true;
    characterPaths = [...stage.querySelectorAll(".animation-tuner__ascii-svg path")];
    status.textContent = "Ready";
    playAnimation();
  } catch (error) {
    characterPaths = [];
    asciiImage.hidden = false;
    status.textContent = "Preview unavailable";
  }
}

function playAnimation() {
  window.clearTimeout(replayTimer);
  const currentRun = ++runId;
  const values = getValues();
  const characters = [...characterPaths];

  photo.style.transition = "none";
  photo.style.opacity = "0";
  for (const character of characters) character.style.opacity = "0";

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  status.textContent = "Writing ASCII";
  const startedAt = performance.now();
  let revealed = 0;

  const draw = (now) => {
    if (currentRun !== runId) return;
    const progress = Math.min((now - startedAt) / values.write, 1);
    const target = Math.ceil(progress * characters.length);

    for (; revealed < target; revealed += 1) {
      characters[revealed].style.opacity = "1";
    }

    if (progress < 1) {
      requestAnimationFrame(draw);
      return;
    }

    status.textContent = values.pause > 0 ? "Pause" : "Crossfading";
    window.setTimeout(() => {
      if (currentRun !== runId) return;
      status.textContent = "Crossfading";
      photo.style.transition = `opacity ${values.fade}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      photo.style.opacity = "1";
      window.setTimeout(() => {
        if (currentRun === runId) status.textContent = "Complete";
      }, values.fade);
    }, values.pause);
  };

  requestAnimationFrame(draw);
}

async function copyParameters() {
  const values = getValues();
  const settings = [
    "ASCII animation parameters",
    `Character writing: ${values.write} ms`,
    `Pause after writing: ${values.pause} ms`,
    `Image crossfade: ${values.fade} ms`,
  ].join("\n");

  try {
    await navigator.clipboard.writeText(settings);
    copyButton.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.textContent = "Copy parameters";
    }, 1400);
  } catch (error) {
    window.prompt("Send these parameters:", settings);
  }
}

function resetValues() {
  for (const [name, value] of Object.entries(defaults)) {
    const control = controlElements[name];
    control.range.value = String(value);
    control.number.value = String(value);
  }
  updateSummary();
  playAnimation();
}

for (const name of Object.keys(controlElements)) bindTimingControl(name);
sceneSelect.addEventListener("change", loadScene);
replayButton.addEventListener("click", playAnimation);
copyButton.addEventListener("click", copyParameters);
resetButton.addEventListener("click", resetValues);

updateSummary();
loadScene();
