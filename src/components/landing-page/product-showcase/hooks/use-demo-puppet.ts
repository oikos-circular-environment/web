"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

type DemoStepBase = { at: number; selector: string };
type DemoClickStep = DemoStepBase & { action: "click" };
type DemoTypeStep = DemoStepBase & { action: "type"; value: string };
type DemoStep = DemoClickStep | DemoTypeStep;

type CursorState =
  | { visible: false }
  | { visible: true; x: number; y: number; pressing: boolean };

const PRESS_DELAY_MS = 260;
const PRESS_DURATION_MS = 220;

function setNativeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

function runStep(container: HTMLElement, step: DemoStep) {
  const element = container.querySelector<HTMLElement>(step.selector);
  if (!element) return;

  if (step.action === "click") {
    element.click();
    return;
  }

  setNativeValue(element as HTMLInputElement | HTMLTextAreaElement, step.value);
}

function findActiveIndex(script: DemoStep[], progress: number) {
  let activeIndex = -1;
  for (let index = 0; index < script.length; index++) {
    if (script[index].at <= progress) activeIndex = index;
  }
  return activeIndex;
}

function useDemoPuppet(
  containerRef: RefObject<HTMLElement | null>,
  progress: number,
  script: DemoStep[],
): CursorState {
  const [cursor, setCursor] = useState<CursorState>({ visible: false });
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeIndex = findActiveIndex(script, progress);
    if (activeIndex === -1) return;

    for (let index = 0; index < activeIndex; index++) {
      if (firedRef.current.has(index)) continue;
      firedRef.current.add(index);
      runStep(container, script[index]);
    }

    const step = script[activeIndex];
    const element = container.querySelector<HTMLElement>(step.selector);
    if (!element) return;

    const containerRect = container.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;

    if (firedRef.current.has(activeIndex)) {
      setCursor({ visible: true, x, y, pressing: false });
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      firedRef.current.add(activeIndex);
      runStep(container, step);
      setCursor({ visible: false });
      return;
    }

    setCursor({ visible: true, x, y, pressing: false });

    const pressTimeout = setTimeout(() => {
      setCursor({ visible: true, x, y, pressing: true });
      firedRef.current.add(activeIndex);
      runStep(container, step);
    }, PRESS_DELAY_MS);

    const releaseTimeout = setTimeout(() => {
      setCursor({ visible: true, x, y, pressing: false });
    }, PRESS_DELAY_MS + PRESS_DURATION_MS);

    return () => {
      clearTimeout(pressTimeout);
      clearTimeout(releaseTimeout);
    };
  }, [containerRef, progress, script]);

  return cursor;
}

export type { CursorState, DemoStep };
export { useDemoPuppet };
