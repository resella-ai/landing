import * as THREE from "../dist/vendor/three/three.module.js";

(() => {
  "use strict";

  const canvas = document.querySelector(".particle-field");
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    console.warn("Resella particles: WebGL is unavailable; keeping the CSS fallback.", error);
    return;
  }

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 240);
  camera.position.set(0, 25, 12);
  camera.lookAt(0, 0, -10);

  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const raycaster = new THREE.Raycaster();
  const screenPoint = new THREE.Vector2();
  const worldPoint = new THREE.Vector3();
  const brandColor = new THREE.Color(0x6654f1);
  const pointer = { x: 0, depth: 0.4, active: false };
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointTexture = createPointTexture();
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    map: pointTexture,
    vertexColors: true,
    size: 2.2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.92,
    alphaTest: 0.025,
    depthWrite: false,
  });

  let points = null;
  let positions = null;
  let basePositions = null;
  let screenCoordinates = null;
  let elapsed = 0;

  function createPointTexture() {
    const sprite = document.createElement("canvas");
    sprite.width = 32;
    sprite.height = 32;
    const spriteContext = sprite.getContext("2d");
    if (!spriteContext) return null;

    const glow = spriteContext.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.28, "rgba(255,255,255,.96)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    spriteContext.fillStyle = glow;
    spriteContext.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(sprite);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  function rebuildParticles(width, height) {
    const columns = Math.max(48, Math.min(132, Math.round(width / 12)));
    const rows = Math.max(64, Math.min(144, Math.round(height / 12)));
    const count = columns * rows;
    positions = new Float32Array(count * 3);
    basePositions = new Float32Array(count * 3);
    screenCoordinates = new Float32Array(count * 2);
    const colors = new Float32Array(count * 3);
    let index = 0;

    camera.updateMatrixWorld(true);
    for (let row = 0; row < rows; row += 1) {
      const depth = row / (rows - 1);
      // Spread the particle waves from the top edge through the full viewport.
      const screenY = 1.04 - depth * 2.12;

      for (let column = 0; column < columns; column += 1) {
        const screenX = (column / (columns - 1)) * 2 - 1;
        screenPoint.set(screenX, screenY);
        raycaster.setFromCamera(screenPoint, camera);
        const offset = index * 3;
        if (!raycaster.ray.intersectPlane(ground, worldPoint)) {
          positions[offset + 2] = -1000;
          basePositions[offset + 2] = -1000;
          index += 1;
          continue;
        }

        positions[offset] = worldPoint.x;
        positions[offset + 1] = 0;
        positions[offset + 2] = worldPoint.z;
        basePositions[offset] = worldPoint.x;
        basePositions[offset + 1] = 0;
        basePositions[offset + 2] = worldPoint.z;
        screenCoordinates[index * 2] = screenX;
        screenCoordinates[index * 2 + 1] = depth;

        const seedWave = Math.sin(index * 127.1 + row * 311.7) * 43758.5453;
        const seed = seedWave - Math.floor(seedWave);
        const sparkle = seed > 0.982 ? 0.18 : 0;
        const brightness = (0.32 + depth * 0.52 + sparkle) * (0.82 + seed * 0.18);
        colors[offset] = brandColor.r * brightness;
        colors[offset + 1] = brandColor.g * brightness;
        colors[offset + 2] = brandColor.b * brightness;
        index += 1;
      }
    }

    if (points) {
      scene.remove(points);
      points.geometry.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
  }

  function render(time) {
    if (!points || !positions) return;
    elapsed = time;
    const count = screenCoordinates.length / 2;

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const screenX = screenCoordinates[index * 2];
      const depth = screenCoordinates[index * 2 + 1];
      const waveStrength = 0.75 + depth * 2.4;
      const firstWave = Math.sin(screenX * 3.5 + time * 0.7 + depth * 5.2) * waveStrength;
      const secondWave = Math.sin(screenX * 7.8 - time * 0.95 - depth * 12) * (0.2 + depth * 0.48);
      const thirdWave = Math.cos(screenX * 1.6 - time * 0.46 + depth * 8.5) * (0.18 + depth * 0.62);
      const pointerX = screenX - pointer.x;
      const pointerDepth = depth - pointer.depth;
      const ripple = pointer.active
        ? Math.exp(-(pointerX * pointerX / 0.08 + pointerDepth * pointerDepth / 0.018)) * 0.85
        : 0;

      positions[offset] = basePositions[offset] + Math.sin(depth * 6 - time * 0.42) * (0.12 + depth * 0.22);
      positions[offset + 1] = firstWave + secondWave + thirdWave + ripple;
      positions[offset + 2] = basePositions[offset + 2] + Math.sin(screenX * 2.1 + depth * 8 - time * 0.55) * (0.22 + depth * 0.56);
    }

    points.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
    rebuildParticles(bounds.width, bounds.height);
    render(motionPreference.matches ? 0 : elapsed);
    canvas.classList.add("particle-field-active");
  }

  function animate(timestamp) {
    if (document.hidden || motionPreference.matches) return;
    render(timestamp * 0.0007);
  }

  function startAnimation() {
    if (motionPreference.matches || document.hidden) {
      renderer.setAnimationLoop(null);
      render(motionPreference.matches ? 0 : elapsed);
      return;
    }
    renderer.setAnimationLoop(animate);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.depth = (event.clientY - bounds.top) / bounds.height;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  document.addEventListener("visibilitychange", startAnimation);
  motionPreference.addEventListener("change", startAnimation);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    canvas.classList.remove("particle-field-active");
    renderer.setAnimationLoop(null);
  });

  try {
    resize();
    startAnimation();
  } catch (error) {
    console.error("Resella particles: Three.js could not initialize the wave field.", error);
    canvas.classList.remove("particle-field-active");
    renderer.setAnimationLoop(null);
    renderer.dispose();
    material.dispose();
    pointTexture?.dispose();
  }
})();
