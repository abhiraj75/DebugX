"use client";

import { useEffect, useRef, useState } from "react";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Domain-warped fbm in lime/violet; the field bulges away from the cursor.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntensity;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 r=mat2(.8,.6,-.6,.8);
  for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.02;a*=.5;}
  return v;
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 m=(uMouse-.5*uRes)/uRes.y;
  float d=length(uv-m);
  uv+=(uv-m)*.22*exp(-d*3.5);
  float t=uTime*.07;
  vec2 q=vec2(fbm(uv*1.5+t),fbm(uv*1.5-t+5.2));
  vec2 r=vec2(fbm(uv*1.5+3.*q+vec2(1.7,9.2)+t*1.4),fbm(uv*1.5+3.*q+vec2(8.3,2.8)-t));
  float f=fbm(uv*1.5+3.2*r);
  vec3 col=vec3(.02,.02,.03);
  col=mix(col,vec3(.545,.361,.965)*.6,smoothstep(.35,.85,f));
  col=mix(col,vec3(.776,1.,.239),smoothstep(.6,.98,f)*clamp(length(q),0.,1.));
  col+=vec3(.776,1.,.239)*.1*exp(-d*5.);
  col*=1.-.7*length(gl_FragCoord.xy/uRes-.5);
  gl_FragColor=vec4(col*uIntensity,1.);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
}

/** Full-bleed animated shader. Falls back to a static gradient without WebGL or under reduced motion. */
export default function ShaderCanvas({ intensity = 1, className = "" }: { intensity?: number; className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const [fallback, setFallback] = useState(false);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setFallback(true);
        const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" });
        if (!gl) return setFallback(true);

        const prog = gl.createProgram()!;
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return setFallback(true);
        gl.useProgram(prog);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, "uRes");
        const uTime = gl.getUniformLocation(prog, "uTime");
        const uMouse = gl.getUniformLocation(prog, "uMouse");
        gl.uniform1f(gl.getUniformLocation(prog, "uIntensity"), intensity);

        // ponytail: DPR capped at 1.5 and fbm at 5 octaves; drop to 4 if low-end GPUs stutter
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const resize = () => {
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener("resize", resize);

        const target = { x: canvas.width / 2, y: canvas.height / 2 };
        const mouse = { ...target };
        const onMove = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            target.x = (e.clientX - r.left) * dpr;
            target.y = (r.bottom - e.clientY) * dpr;
        };
        window.addEventListener("pointermove", onMove);

        let visible = true;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(canvas);

        let raf = 0;
        const t0 = performance.now();
        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            if (!visible) return;
            mouse.x += (target.x - mouse.x) * 0.06;
            mouse.y += (target.y - mouse.y) * 0.06;
            gl.uniform2f(uMouse, mouse.x, mouse.y);
            gl.uniform1f(uTime, (now - t0) / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
    }, [intensity]);

    if (fallback) {
        return (
            <div
                aria-hidden
                className={className}
                style={{
                    opacity: intensity,
                    background:
                        "radial-gradient(60% 50% at 30% 40%, rgba(139,92,246,0.35), transparent 70%), radial-gradient(40% 40% at 70% 60%, rgba(198,255,61,0.18), transparent 70%), #050507",
                }}
            />
        );
    }
    return <canvas ref={ref} aria-hidden className={className} />;
}
