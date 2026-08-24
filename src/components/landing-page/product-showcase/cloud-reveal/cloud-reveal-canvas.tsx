"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { cloudFragmentShader, screenVertexShader } from "./shaders";

function CloudRevealCanvas({ progress }: { progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.RawShaderMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const contextLostRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: "low-power",
        stencil: false,
        depth: false,
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.sortObjects = false;
    renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";

    const camera = new THREE.Camera();
    const scene = new THREE.Scene();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2),
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2),
    );

    const material = new THREE.RawShaderMaterial({
      vertexShader: screenVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uProgress: { value: 0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);

    function resize() {
      const width = Math.max(1, container?.clientWidth ?? 1);
      const height = Math.max(1, container?.clientHeight ?? 1);
      renderer.setSize(width, height, false);
      const buffer = renderer.getDrawingBufferSize(new THREE.Vector2());
      material.uniforms.uResolution.value.copy(buffer);
      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLostRef.current = true;
      canvas.style.setProperty("opacity", "0");
    };
    const onContextRestored = () => {
      contextLostRef.current = false;
      canvas.style.removeProperty("opacity");
      resize();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    rendererRef.current = renderer;
    materialRef.current = material;
    sceneRef.current = scene;
    cameraRef.current = camera;

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    const material = materialRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !material || !scene || !camera) return;
    if (contextLostRef.current) return;

    material.uniforms.uProgress.value = progress;
    renderer.render(scene, camera);
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

export { CloudRevealCanvas };
