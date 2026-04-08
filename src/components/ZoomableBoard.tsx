import { useRef, useEffect } from 'react';
import Board from './Board';
import type { Board as BoardType } from '../types';

interface ZoomableBoardProps {
  puzzle: BoardType;
  playerBoard: BoardType;
  notes: number[][][];
  selectedCell: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  onCellClick: (row: number, col: number) => void;
}

export default function ZoomableBoard(props: ZoomableBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    scale: 1,
    tx: 0,
    ty: 0,
    pinching: false,
    startDist: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    startCenterX: 0,
    startCenterY: 0,
    lastTap: 0,
  });

  const applyTransform = () => {
    if (!boardRef.current) return;
    const { scale, tx, ty } = stateRef.current;
    boardRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  const getMaxPan = () => {
    if (!containerRef.current) return { maxX: 0, maxY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const { scale } = stateRef.current;
    const maxX = Math.max(0, (rect.width * scale - rect.width) / 2);
    const maxY = Math.max(0, (rect.height * scale - rect.height) / 2);
    return { maxX, maxY };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dist = (t1: Touch, t2: Touch) =>
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const s = stateRef.current;
        s.pinching = true;
        s.startDist = dist(e.touches[0], e.touches[1]);
        s.startScale = s.scale;
        s.startTx = s.tx;
        s.startTy = s.ty;
        s.startCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        s.startCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        if (boardRef.current) boardRef.current.style.transition = 'none';
      }

      // Double-tap detection
      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - stateRef.current.lastTap < 300) {
          e.preventDefault();
          stateRef.current.scale = 1;
          stateRef.current.tx = 0;
          stateRef.current.ty = 0;
          if (boardRef.current) boardRef.current.style.transition = 'transform 0.25s ease-out';
          applyTransform();
        }
        stateRef.current.lastTap = now;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && stateRef.current.pinching) {
        e.preventDefault();
        const s = stateRef.current;
        const d = dist(e.touches[0], e.touches[1]);
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        // New scale from pinch ratio
        const newScale = clamp(s.startScale * (d / s.startDist), 1, 5);

        // Pan from center movement
        const dx = centerX - s.startCenterX;
        const dy = centerY - s.startCenterY;

        s.scale = newScale;

        const { maxX, maxY } = getMaxPan();
        s.tx = clamp(s.startTx + dx, -maxX, maxX);
        s.ty = clamp(s.startTy + dy, -maxY, maxY);

        applyTransform();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        stateRef.current.pinching = false;
        if (boardRef.current) boardRef.current.style.transition = 'transform 0.15s ease-out';

        // Snap back to 1 if close
        if (stateRef.current.scale < 1.1) {
          stateRef.current.scale = 1;
          stateRef.current.tx = 0;
          stateRef.current.ty = 0;
          applyTransform();
        }
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden w-full"
      style={{ touchAction: 'pan-y' }}
    >
      <div
        ref={boardRef}
        style={{
          transformOrigin: 'center center',
          width: '100%',
          willChange: 'transform',
        }}
      >
        <Board {...props} />
      </div>
    </div>
  );
}
