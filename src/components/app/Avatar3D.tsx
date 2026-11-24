'use client';
import { useEffect, useRef } from 'react';

export type AvatarCfg = {
  gender: 'boy' | 'girl';
  skin: number;
  hairColor: number;
  top: number;   // 0 moletom roxo, 1 camiseta branca, 2 camiseta verde
  bot: number;   // 0 calça, 1 bermuda
  cap: boolean;
  glasses: boolean;
};

export const SKINS = ['#F7D7C4', '#E8B88A', '#C68642', '#8D5524', '#5A3825'];
export const HAIRCOLORS = ['#2b2540', '#4a2f1b', '#8B4513', '#C98A2B', '#B0B0B0', '#6D28D9'];
export const TOPS = [
  { n: 'Moletom preto', c: '#17171c', sleeve: 'long' as const },
  { n: 'Camiseta branca', c: '#F2F2F5', sleeve: 'short' as const },
  { n: 'Camiseta verde', c: '#2FA84A', sleeve: 'short' as const },
];
export const BOTS = [
  { n: 'Calça', c: '#23232e', long: true },
  { n: 'Bermuda', c: '#23232e', long: false },
];
export const GENDERS = [
  { id: 'boy' as const, n: 'Menino' },
  { id: 'girl' as const, n: 'Menina' },
];

export default function Avatar3D({ cfg, height = 340 }: { cfg: AvatarCfg; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rebuild = useRef<((c: AvatarCfg) => void) | null>(null);

  useEffect(() => {
    let cleanup = () => {};
    let raf = 0;
    (async () => {
      const THREE = await import('three');
      const mount = ref.current;
      if (!mount) return;
      const w = mount.clientWidth || 360;

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(38, w / height, 0.1, 100);
      cam.position.set(0, 0.25, 6.4);
      cam.lookAt(0, 0.05, 0);
      const rn = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rn.setPixelRatio(Math.min(2, window.devicePixelRatio));
      rn.setSize(w, height);
      mount.appendChild(rn.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 0.85); key.position.set(3, 6, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0x9a6cf5, 0.35); rim.position.set(-4, 3, -2); scene.add(rim);

      const group = new THREE.Group();
      scene.add(group);

      const mat = (c: string, rough = 0.72) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.03 });
      const shade = (hex: string, d: number) => {
        let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map((x) => x + x).join('');
        const f = (i: number) => Math.max(0, Math.min(255, parseInt(c.slice(i, i + 2), 16) + d));
        return '#' + [f(0), f(2), f(4)].map((x) => x.toString(16).padStart(2, '0')).join('');
      };
      const add = (geo: any, m: any, x: number, y: number, z: number) => { const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); group.add(mesh); return mesh; };

      const logoTex = new THREE.TextureLoader().load('/logo.png');
      // logo em branco (para o moletom preto)
      const whiteLogo = (() => {
        const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
        const g = cv.getContext('2d');
        if (g) {
          g.translate(128, 128); g.fillStyle = '#ffffff';
          const bar = () => { const r = 24, x = -24, y = -92, w = 48, h = 184;
            g.beginPath(); g.moveTo(x + r, y);
            g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
            g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill(); };
          for (let k = 0; k < 3; k++) { g.rotate(Math.PI / 3); bar(); }
        }
        const t = new THREE.CanvasTexture(cv); t.needsUpdate = true; return t;
      })();

      function build(c: AvatarCfg) {
        while (group.children.length) group.remove(group.children[0]);
        const girl = c.gender === 'girl';
        const skin = SKINS[c.skin] ?? SKINS[0];
        const hair = HAIRCOLORS[c.hairColor] ?? HAIRCOLORS[0];
        const top = TOPS[c.top] ?? TOPS[0];
        const bot = BOTS[c.bot] ?? BOTS[0];
        const shirt = top.c;
        const pants = bot.c;
        const tR = girl ? 0.38 : 0.43;         // torso radius
        const skinM = mat(skin);

        // ---- pernas ----
        const legX = 0.17;
        if (bot.long) {
          [-legX, legX].forEach((x) => add(new THREE.CapsuleGeometry(0.165, 0.95, 6, 14), mat(pants), x, -0.82, 0));
        } else {
          [-legX, legX].forEach((x) => {
            add(new THREE.CapsuleGeometry(0.18, 0.34, 6, 14), mat(pants), x, -0.5, 0);
            add(new THREE.CapsuleGeometry(0.145, 0.52, 6, 14), skinM, x, -1.02, 0);
          });
        }
        // tênis
        [-legX, legX].forEach((x) => {
          add(new THREE.BoxGeometry(0.28, 0.17, 0.46), mat('#f3f3f6'), x, -1.42, 0.08);
          add(new THREE.BoxGeometry(0.3, 0.07, 0.48), mat(shade(shirt, -10)), x, -1.5, 0.08);
        });
        // quadril
        add(new THREE.CapsuleGeometry(tR * 0.82, 0.16, 6, 14), mat(pants), 0, -0.28, 0);

        // ---- tronco (camiseta/moletom) ----
        const torso = add(new THREE.CylinderGeometry(tR, tR * 0.9, 0.95, 24), mat(shirt), 0, 0.28, 0);
        torso.scale.z = 0.72;
        // ombros
        add(new THREE.CapsuleGeometry(0.17, girl ? 0.42 : 0.5, 6, 12), mat(shirt), 0, 0.72, 0).rotation.z = Math.PI / 2;
        // gola
        add(new THREE.TorusGeometry(0.17, 0.05, 10, 20), mat(shade(shirt, -26)), 0, 0.78, 0).rotation.x = Math.PI / 2;

        // moletom: capuz + bolso + cordões
        if (top.sleeve === 'long') {
          const hood = add(new THREE.SphereGeometry(0.26, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.6), mat(shade(shirt, -18)), 0, 0.82, -0.12);
          hood.scale.set(1.1, 1, 0.8); hood.rotation.x = -0.3;
          const pocket = add(new THREE.BoxGeometry(0.42, 0.22, 0.08), mat(shade(shirt, -14)), 0, 0.02, tR * 0.72 + 0.01);
          pocket.scale.z = 1;
          [-0.05, 0.05].forEach((x) => add(new THREE.CylinderGeometry(0.012, 0.012, 0.22), mat('#e9e4f5'), x, 0.52, tR * 0.72 - 0.02));
        }

        // logo no peito (branca no moletom preto, colorida nas camisetas)
        const decal = c.top === 0 ? whiteLogo : logoTex;
        const logo = add(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshBasicMaterial({ map: decal, transparent: true }), c.top === 0 ? 0 : -0.13, 0.44, tR * 0.72 + 0.02);
        logo.renderOrder = 2;

        // ---- braços ----
        const armX = girl ? 0.44 : 0.5;
        [-1, 1].forEach((s) => {
          const x = s * armX;
          add(new THREE.SphereGeometry(0.15, 14, 14), mat(shirt), x, 0.68, 0); // ombro
          if (top.sleeve === 'long') {
            add(new THREE.CapsuleGeometry(0.115, 0.72, 6, 12), mat(shirt), x, 0.26, 0);
            add(new THREE.SphereGeometry(0.12, 12, 12), skinM, x, -0.18, 0); // mão
          } else {
            add(new THREE.CapsuleGeometry(0.12, 0.26, 6, 12), mat(shirt), x, 0.5, 0); // manga curta
            add(new THREE.CapsuleGeometry(0.1, 0.42, 6, 12), skinM, x, 0.12, 0);     // antebraço
            add(new THREE.SphereGeometry(0.11, 12, 12), skinM, x, -0.16, 0);
          }
        });

        // ---- pescoço + cabeça ----
        add(new THREE.CylinderGeometry(0.12, 0.13, 0.2, 14), skinM, 0, 0.9, 0);
        const head = add(new THREE.SphereGeometry(0.5, 32, 32), skinM, 0, 1.38, 0);
        head.scale.set(1, 1.1, 0.96);
        // orelhas
        [-0.48, 0.48].forEach((x) => add(new THREE.SphereGeometry(0.08, 10, 10), skinM, x, 1.36, 0));
        // olhos
        [-0.17, 0.17].forEach((x) => {
          add(new THREE.SphereGeometry(0.06, 12, 12), mat('#f7f7fa'), x, 1.4, 0.44);
          add(new THREE.SphereGeometry(0.032, 10, 10), mat('#2a2030'), x, 1.4, 0.49);
        });
        // sobrancelhas
        [-0.17, 0.17].forEach((x) => add(new THREE.BoxGeometry(0.12, 0.02, 0.02), mat(shade(hair, -10)), x, 1.5, 0.46));
        // nariz
        add(new THREE.SphereGeometry(0.045, 8, 8), mat(shade(skin, -14)), 0, 1.33, 0.49);
        // boca
        const mouth = add(new THREE.TorusGeometry(0.09, 0.022, 8, 16, Math.PI), mat('#b5566b'), 0, 1.22, 0.44);
        mouth.rotation.x = Math.PI;

        // óculos
        if (c.glasses) {
          [-0.17, 0.17].forEach((x) => add(new THREE.TorusGeometry(0.095, 0.02, 8, 20), mat('#2b2b33'), x, 1.4, 0.48).rotation.x = Math.PI / 2);
          add(new THREE.BoxGeometry(0.1, 0.02, 0.02), mat('#2b2b33'), 0, 1.4, 0.49);
        }

        // ---- cabelo ----
        const hairM = mat(hair);
        const cap = add(new THREE.SphereGeometry(0.53, 26, 26, 0, Math.PI * 2, 0, Math.PI * 0.62), hairM, 0, 1.42, 0);
        cap.scale.set(1.03, 1.05, 1);
        add(new THREE.BoxGeometry(0.72, 0.14, 0.2), hairM, 0, 1.64, 0.4); // franja
        if (girl) {
          // cabelo longo: painel atrás + laterais
          const back = add(new THREE.CapsuleGeometry(0.34, 0.6, 8, 16), hairM, 0, 1.0, -0.22);
          back.scale.set(1.1, 1, 0.55);
          [-0.44, 0.44].forEach((x) => { const s = add(new THREE.CapsuleGeometry(0.1, 0.5, 6, 12), hairM, x, 1.1, 0.02); s.scale.z = 0.7; });
        }

        // boné (por cima do cabelo)
        if (c.cap) {
          const capCol = '#6D28D9';
          const dome = add(new THREE.SphereGeometry(0.56, 22, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(capCol), 0, 1.5, 0);
          dome.scale.set(1.04, 0.9, 1.04);
          add(new THREE.BoxGeometry(0.64, 0.05, 0.4), mat(capCol), 0, 1.46, 0.42);
          add(new THREE.CircleGeometry(0.07, 16), mat('#FBBF24'), 0, 1.62, 0.5);
        }

        group.position.y = 0.35;
        group.rotation.y = 0;
      }

      build(cfg);
      rebuild.current = build;

      // arrastar para girar (sem animação/giro automático)
      let drag = false, lastX = 0, rotY = 0;
      const dom = rn.domElement; dom.style.cursor = 'grab';
      const down = (e: PointerEvent) => { drag = true; lastX = e.clientX; dom.style.cursor = 'grabbing'; };
      const up = () => { drag = false; dom.style.cursor = 'grab'; };
      const move = (e: PointerEvent) => { if (drag) { rotY += (e.clientX - lastX) * 0.01; lastX = e.clientX; } };
      dom.addEventListener('pointerdown', down); window.addEventListener('pointerup', up); window.addEventListener('pointermove', move);
      const onResize = () => { if (!ref.current) return; const nw = ref.current.clientWidth; rn.setSize(nw, height); cam.aspect = nw / height; cam.updateProjectionMatrix(); };
      window.addEventListener('resize', onResize);

      const loop = () => { raf = requestAnimationFrame(loop); group.rotation.y = rotY; rn.render(scene, cam); };
      loop();
      cleanup = () => {
        cancelAnimationFrame(raf);
        dom.removeEventListener('pointerdown', down); window.removeEventListener('pointerup', up); window.removeEventListener('pointermove', move); window.removeEventListener('resize', onResize);
        rn.dispose(); if (dom.parentNode) dom.parentNode.removeChild(dom);
      };
    })();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => { rebuild.current?.(cfg); }, [cfg]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
