"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import { cn } from "@/libs/utils";
import {
  compositeFragmentShader,
  screenVertexShader,
  waveFragmentShader,
  waveVertexShader,
} from "./shaders";
import type {
  RippleQuality,
  RippleRevealConfig,
  RippleRevealProps,
} from "./types";

const MAX_WAVES = 100;
const QUALITY_SCALE: Record<RippleQuality, number> = {
  low: 0.4,
  medium: 0.7,
  high: 1,
};
const START_SCALE = 1.5;
const LIFE_CONSTANT = Math.log(500);
const MAX_DELTA = 1 / 30;

const DEFAULT_CONFIG: RippleRevealConfig = {
  brushSize: 240,
  spread: 4,
  fade: 3.5,
  spacing: 14,
  strength: 0.05,
  swirl: 0.35,
  rings: 2,
  dispersion: 0.12,
  glint: 0.3,
  revealGain: 2.4,
  revealEdge: [0.12, 0.6],
  revealMax: 0.95,
  tint: [1, 1, 1],
  tintAmount: 0,
  grayscale: 0.08,
};

interface Wave {
  x: number;
  y: number;
  scale: number;
  target: number;
  size: number;
  opacity: number;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

function createImageTexture(img: HTMLImageElement) {
  const texture = new THREE.Texture(img);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function supportsHalfFloatRenderTarget(gl: WebGL2RenderingContext) {
  return (
    gl.getExtension("EXT_color_buffer_half_float") !== null ||
    gl.getExtension("EXT_color_buffer_float") !== null
  );
}

function RippleRevealCanvas({
  pristineSrc,
  degradedSrc,
  alt,
  quality = "high",
  className,
  ...configOverrides
}: RippleRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readyRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<RippleRevealConfig>({
    ...DEFAULT_CONFIG,
    ...configOverrides,
  });

  useEffect(() => {
    configRef.current = { ...DEFAULT_CONFIG, ...configOverrides };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let disposed = false;
    let teardown: (() => void) | undefined;

    void start(container, canvas);

    async function start(container: HTMLDivElement, canvas: HTMLCanvasElement) {
      let pristineImg: HTMLImageElement;
      let degradedImg: HTMLImageElement;
      try {
        [pristineImg, degradedImg] = await Promise.all([
          loadImage(pristineSrc),
          loadImage(degradedSrc),
        ]);
      } catch {
        return;
      }
      if (disposed) return;

      if (process.env.NODE_ENV !== "production") {
        const pristineAspect =
          pristineImg.naturalWidth / pristineImg.naturalHeight;
        const degradedAspect =
          degradedImg.naturalWidth / degradedImg.naturalHeight;
        if (Math.abs(pristineAspect - degradedAspect) > 0.01) {
          console.warn(
            `[hero-ripple-reveal] aspect mismatch: pristine=${pristineAspect.toFixed(3)} degraded=${degradedAspect.toFixed(3)}`,
          );
        }
      }

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: false,
          antialias: false,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true,
          stencil: false,
          depth: false,
        });
      } catch {
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.sortObjects = false;
      renderer.debug.checkShaderErrors = process.env.NODE_ENV !== "production";

      const gl = renderer.getContext() as WebGL2RenderingContext;
      const halfFloatOk = supportsHalfFloatRenderTarget(gl);

      const camera = new THREE.Camera();

      const field = new THREE.WebGLRenderTarget(2, 2, {
        depthBuffer: false,
        stencilBuffer: false,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        format: THREE.RGBAFormat,
        type: halfFloatOk ? THREE.HalfFloatType : THREE.UnsignedByteType,
        colorSpace: THREE.NoColorSpace,
        generateMipmaps: false,
        samples: 0,
      });

      const quadPosition = new Float32Array([
        -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
      ]);
      const quadUv = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

      const waveGeometry = new THREE.InstancedBufferGeometry();
      waveGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(quadPosition, 2),
      );
      waveGeometry.setAttribute("uv", new THREE.BufferAttribute(quadUv, 2));

      const offsetData = new Float32Array(MAX_WAVES * 2);
      const scaleData = new Float32Array(MAX_WAVES * 2);
      const opacityData = new Float32Array(MAX_WAVES);

      const aOffset = new THREE.InstancedBufferAttribute(offsetData, 2);
      const aScale = new THREE.InstancedBufferAttribute(scaleData, 2);
      const aOpacity = new THREE.InstancedBufferAttribute(opacityData, 1);
      aOffset.setUsage(THREE.DynamicDrawUsage);
      aScale.setUsage(THREE.DynamicDrawUsage);
      aOpacity.setUsage(THREE.DynamicDrawUsage);

      waveGeometry.setAttribute("iOffset", aOffset);
      waveGeometry.setAttribute("iScale", aScale);
      waveGeometry.setAttribute("iOpacity", aOpacity);
      waveGeometry.instanceCount = MAX_WAVES;

      const waveMaterial = new THREE.RawShaderMaterial({
        vertexShader: waveVertexShader,
        fragmentShader: waveFragmentShader,
        uniforms: { uRings: { value: configRef.current.rings } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendEquationAlpha: THREE.AddEquation,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        toneMapped: false,
      });

      const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
      waveMesh.frustumCulled = false;
      waveMesh.matrixAutoUpdate = false;

      const screenGeometry = new THREE.BufferGeometry();
      screenGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2),
      );
      screenGeometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2),
      );

      const pristineTexture = createImageTexture(pristineImg);
      const degradedTexture = createImageTexture(degradedImg);

      const compositeUniforms = {
        uPristine: { value: pristineTexture },
        uDegraded: { value: degradedTexture },
        uField: { value: field.texture },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTextureSize: {
          value: new THREE.Vector2(
            pristineImg.naturalWidth,
            pristineImg.naturalHeight,
          ),
        },
        uTexel: { value: new THREE.Vector2(1, 1) },
        uStrength: { value: configRef.current.strength },
        uSwirl: { value: configRef.current.swirl },
        uDispersion: { value: configRef.current.dispersion },
        uGlint: { value: configRef.current.glint },
        uFieldClamp: { value: 1 },
        uRevealGain: { value: configRef.current.revealGain },
        uRevealEdge: {
          value: new THREE.Vector2(...configRef.current.revealEdge),
        },
        uRevealMax: { value: configRef.current.revealMax },
        uTint: { value: new THREE.Vector3(...configRef.current.tint) },
        uTintAmount: { value: configRef.current.tintAmount },
        uGrayscale: { value: configRef.current.grayscale },
        uEncodeSrgb: { value: 1 },
      };

      const compositeMaterial = new THREE.RawShaderMaterial({
        vertexShader: screenVertexShader,
        fragmentShader: compositeFragmentShader,
        uniforms: compositeUniforms,
        transparent: false,
        blending: THREE.NoBlending,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });

      const compositeMesh = new THREE.Mesh(screenGeometry, compositeMaterial);
      compositeMesh.frustumCulled = false;
      compositeMesh.matrixAutoUpdate = false;

      let width = 1;
      let height = 1;

      function resize() {
        width = Math.max(1, container?.clientWidth ?? 1);
        height = Math.max(1, container?.clientHeight ?? 1);
        renderer.setSize(width, height, false);

        const buffer = renderer.getDrawingBufferSize(new THREE.Vector2());
        compositeUniforms.uResolution.value.copy(buffer);

        const scale = QUALITY_SCALE[quality];
        const fieldWidth = Math.max(2, Math.round(buffer.x * scale));
        const fieldHeight = Math.max(2, Math.round(buffer.y * scale));
        field.setSize(fieldWidth, fieldHeight);
        compositeUniforms.uTexel.value.set(1 / fieldWidth, 1 / fieldHeight);
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      const waves: Wave[] = Array.from({ length: MAX_WAVES }, () => ({
        x: 0,
        y: 0,
        scale: START_SCALE,
        target: START_SCALE,
        size: 1,
        opacity: 0,
      }));
      let current = 0;

      function emitWave(x: number, y: number) {
        const cfg = configRef.current;
        const wave = waves[current];
        current = (current + 1) % MAX_WAVES;
        wave.x = x;
        wave.y = y;
        wave.scale = START_SCALE;
        wave.target = START_SCALE * Math.max(1, cfg.spread);
        wave.size = Math.max(1, cfg.brushSize);
        wave.opacity = 1;
      }

      let containerRect = container.getBoundingClientRect();
      const updateRect = () => {
        containerRect = container.getBoundingClientRect();
      };

      const pointer = { x: 0, y: 0, hasMoved: false };
      const lastEmit = { x: 0, y: 0, valid: false };

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reducedMotion = motionQuery.matches;
      const onMotionChange = (event: MediaQueryListEvent) => {
        reducedMotion = event.matches;
      };
      motionQuery.addEventListener("change", onMotionChange);

      const onPointerMove = (event: PointerEvent) => {
        if (
          event.clientX < containerRect.left ||
          event.clientX > containerRect.right ||
          event.clientY < containerRect.top ||
          event.clientY > containerRect.bottom
        ) {
          return;
        }
        pointer.x = (event.clientX - containerRect.left) / containerRect.width;
        pointer.y =
          1 - (event.clientY - containerRect.top) / containerRect.height;
        pointer.hasMoved = true;
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", updateRect, { passive: true });
      window.addEventListener("resize", updateRect, { passive: true });

      let last = performance.now();

      function frame(time: number) {
        const delta = Math.min((time - last) / 1000, MAX_DELTA);
        last = time;

        const cfg = configRef.current;
        const growth = reducedMotion ? 0 : 1 - Math.exp(-delta * 1.09);
        const decay = reducedMotion
          ? 1
          : Math.exp((-delta * LIFE_CONSTANT) / Math.max(0.15, cfg.fade));

        if (!reducedMotion && pointer.hasMoved) {
          const dx = (pointer.x - lastEmit.x) * width;
          const dy = (pointer.y - lastEmit.y) * height;
          if (
            !lastEmit.valid ||
            Math.hypot(dx, dy) > Math.max(1, cfg.spacing)
          ) {
            emitWave(pointer.x, pointer.y);
            lastEmit.x = pointer.x;
            lastEmit.y = pointer.y;
            lastEmit.valid = true;
          }
        }

        for (let i = 0; i < MAX_WAVES; i += 1) {
          const wave = waves[i];
          if (wave.opacity <= 0) {
            opacityData[i] = 0;
            continue;
          }

          wave.opacity *= decay;
          wave.scale += (wave.target - wave.scale) * growth;

          if (wave.opacity < 0.002) {
            wave.opacity = 0;
            opacityData[i] = 0;
            continue;
          }

          const half = (wave.scale * wave.size) / 2;
          offsetData[i * 2] = pointer ? wave.x * 2 - 1 : 0;
          offsetData[i * 2 + 1] = wave.y * 2 - 1;
          scaleData[i * 2] = (half / width) * 2;
          scaleData[i * 2 + 1] = (half / height) * 2;
          opacityData[i] = wave.opacity;
        }

        aOffset.needsUpdate = true;
        aScale.needsUpdate = true;
        aOpacity.needsUpdate = true;

        renderer.setRenderTarget(field);
        renderer.render(waveMesh, camera);
        renderer.setRenderTarget(null);
        renderer.render(compositeMesh, camera);
      }

      let running = false;
      function play() {
        if (running) return;
        running = true;
        last = performance.now();
        renderer.setAnimationLoop(frame);
      }
      function pause() {
        running = false;
        renderer.setAnimationLoop(null);
      }

      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) play();
          else pause();
        },
        { threshold: 0 },
      );
      visibilityObserver.observe(container);

      const onVisibilityChange = () => {
        if (document.hidden) pause();
        else if (visibilityObserver.takeRecords().length === 0) play();
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const onContextLost = (event: Event) => {
        event.preventDefault();
        pause();
        readyRef.current?.style.setProperty("opacity", "0");
      };
      canvas.addEventListener("webglcontextlost", onContextLost);

      readyRef.current?.style.setProperty("opacity", "1");
      play();

      teardown = () => {
        pause();
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", updateRect);
        window.removeEventListener("resize", updateRect);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        motionQuery.removeEventListener("change", onMotionChange);
        canvas.removeEventListener("webglcontextlost", onContextLost);

        waveGeometry.dispose();
        waveMaterial.dispose();
        screenGeometry.dispose();
        compositeMaterial.dispose();
        field.dispose();
        pristineTexture.dispose();
        degradedTexture.dispose();

        renderer.dispose();
        renderer.forceContextLoss();
      };
    }

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [pristineSrc, degradedSrc, quality]);

  return (
    <div
      ref={containerRef}
      data-slot="ripple-reveal"
      className={cn("relative isolate size-full overflow-hidden", className)}
    >
      <Image
        src={pristineSrc}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        ref={readyRef}
        className="absolute inset-0 opacity-0 transition-opacity duration-700"
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        />
      </div>
    </div>
  );
}

export { RippleRevealCanvas };
