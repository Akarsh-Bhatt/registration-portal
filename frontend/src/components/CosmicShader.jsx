import React, { useEffect, useRef } from 'react';

export default function CosmicShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener('resize', syncSize);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

      float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
      }

      float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
                     mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }

      float fbm(vec2 p) {
          float v = 0.0, a = 0.5;
          for (int i = 0; i < 7; i++) {
              v += a * noise(p); p *= rot(0.5); p *= 2.1; a *= 0.5;
          }
          return v;
      }

      void main() {
          vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
          float t = u_time * 0.25;

          p *= rot(u_time * 0.15 * 0.05);

          float dist = length(p);

          float angleNoise = fbm(p * 3.0 + t * 0.5) * 0.3;
          float distortedDist = dist + angleNoise * smoothstep(0.5, 0.0, dist);

          vec2 nebP = p * 5.0;

          vec2 q = vec2(fbm(nebP + vec2(cos(t), sin(t))), fbm(nebP + 1.2));
          vec2 r = vec2(fbm(nebP + 4.0 * q + t), fbm(nebP + 4.0 * q + 2.8));
          float f = fbm(nebP + 4.0 * r);

          vec3 u_core = vec3(0.408, 0.137, 0.765); // #6823C3
          vec3 u_mid = vec3(0.0, 0.482, 1.0);      // #007BFF
          vec3 u_accent = vec3(0.6, 0.0, 1.0);     // #9900FF
          vec3 u_outer = vec3(0.976, 0.976, 0.976);// #F9F9F9

          float coreMask = smoothstep(0.8, 0.0, distortedDist) * (0.5 + 0.5 * smoothstep(0.1, 0.9, f));
          float coreGlow = exp(-3.0 * distortedDist);

          vec3 colCore = u_core * (coreMask * 2.0 + coreGlow * 1.5);

          float ring = smoothstep(0.05, 0.35, dist) * smoothstep(0.9, 0.3, dist);
          float filament = pow(f, 1.2);

          vec3 colMix = mix(u_mid, u_accent, smoothstep(0.2, 0.6, f));
          colMix = mix(colMix, u_outer, smoothstep(0.4, 0.9, f));
          vec3 colOuter = colMix * ring * filament * 2.0;

          float dust = smoothstep(0.3, 0.9, fbm(nebP * 1.5 + r));
          dust = mix(1.0, dust, smoothstep(0.0, 0.3, dist));

          vec3 finalCol = (colCore + colOuter) * dust * 1.2;
          finalCol += u_mid * coreMask * ring * 0.8;

          float lum = max(finalCol.r, max(finalCol.g, finalCol.b));
          gl_FragColor = vec4(finalCol, clamp(lum, 0.2, 1.0));
      }
    `;

    function cs(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId;
    function render(t) {
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100vw', height: '100vh', opacity: 0.85 }}
      />
    </div>
  );
}
