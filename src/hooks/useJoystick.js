import { useState, useRef } from 'react';

export function useJoystick(radius = 60) {
  const [active, setActive] = useState(false);
  const [basePos, setBasePos] = useState({ x: 0, y: 0 });
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const directionRef = useRef({ x: 0, y: 0 });
  const pressed = useRef(false);  
  
  const start = (x, y) => {
    pressed.current = true;
    setBasePos({ x, y });
    setStickPos({ x, y });
    setActive(true);
  };

  const move = (x, y) => {
    if (!pressed.current) return; 
    let dx = x - basePos.x;
    let dy = y - basePos.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }

    setStickPos({ x: basePos.x + dx, y: basePos.y + dy });
    directionRef.current = { x: dx / radius, y: dy / radius };
  };

  const end = () => {
    pressed.current = false;
    directionRef.current = { x: 0, y: 0 };
    setActive(false);
  };

  const handlers = {
    onTouchStart: e => {
      const touch = e.touches[0];
      start(touch.clientX, touch.clientY);
    },
    onTouchMove: e => {
      const touch = e.touches[0];
      move(touch.clientX, touch.clientY);
    },
    onTouchEnd: e => {
      end();
    },
    onMouseDown: e => {
      e.preventDefault();
      start(e.clientX, e.clientY);
    },
    onMouseMove: e => {
      e.preventDefault();
      move(e.clientX, e.clientY);
    },
    onMouseUp: e => {
      e.preventDefault();
      end();
    },
    onMouseLeave: e => {
      e.preventDefault();
      end();
    },
  };

  return { active, basePos, stickPos, directionRef, handlers, radius };
}