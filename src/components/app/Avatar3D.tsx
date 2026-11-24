'use client';
import { useEffect, useRef } from 'react';

export type AvatarCfg = {
  skin: number;
  hairStyle: number;
  hairColor: number;
  top: number;
  bot: number;
  cap: boolean;
  beard: boolean;
};

export const SKINS = ['#F7D7C4', '#E8B88A', '#C68642', '#8D5524', '#5A3825'];
export const HAIRCOLORS = ['#2b2540', '#5A3825', '#8B4513', '#D9A441', '#B0B0B0', '#7C3AED'];
export const HAIRSTYLES = ['Curto', 'Médio', 'Moicano', 'Careca'];
export const TOPS = [
  { n: 'Moletom', c: '#7C3AED' },
  { n: 'Camiseta verde', c: '#22C55E' },
  { n: 'Camiseta branca', c: '#f1f1f6' },
];
export const BOTS = [
  { n: 'Calça', c: '#2b2540' },
  { n: 'Bermuda', c: '#16A34A' },
];

export default function Avatar3D({ cfg, height = 300 }: { cfg: AvatarCfg; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rebuildRef = useRef<((c: AvatarCfg) => void) | null>(null);

  useEffect(() => {
    let cleanup = () => {};
    let raf = 0;
    (async () => {
      const THREE = await import('three');
      const mount = ref.current;
      if (!mount) return;
      const w = mount.clientWidth || 360;

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(40, w / height, 0.1, 100);
      cam.position.set(0, 1.1, 6.2);
      const rn = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rn.setPixelRatio(Math.min(2, window.devicePixelRatio));
      rn.setSize(w, height);
      mount.appendChild(rn.domElement);
      scene.add(new THREE.AmbientLight(0xffffff, 0.78));
      const d = new THREE.DirectionalLight(0xffffff, 0.9);
      d.position.set(3, 6, 5);
      scene.add(d);
      const d2 = new THREE.DirectionalLight(0x8b5cf6, 0.4);
      d2.position.set(-4, 2, 2);
      scene.add(d2);

      const group = new THREE.Group();
      scene.add(group);

      const mat = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.05 });
      const shade = (hex: string, p: number) => {
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map((x) => x + x).join('');
        const r = Math.max(0, Math.min(255, parseInt(c.slice(0, 2), 16) + p));
        const g = Math.max(0, Math.min(255, parseInt(c.slice(2, 4), 16) + p));
        const b = Math.max(0, Math.min(255, parseInt(c.slice(4, 6), 16) + p));
        return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
      };

      function build(c: AvatarCfg) {
        while (group.children.length) group.remove(group.children[0]);
        const skin = SKINS[c.skin] ?? SKINS[0];
        const topC = TOPS[c.top]?.c ?? TOPS[0].c;
        const botC = BOTS[c.bot]?.c ?? BOTS[0].c;
        const hairC = HAIRCOLORS[c.hairColor] ?? HAIRCOLORS[0];

        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 0.7, 6, 14), mat(topC));
        torso.position.y = 0.55;
        group.add(torso);
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.08, 8, 20), mat(shade(topC, -30)));
        collar.position.y = 1.0;
        collar.rotation.x = Math.PI / 2;
        group.add(collar);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 24, 24), mat(skin));
        head.position.y = 1.72;
        head.scale.set(1, 1.05, 0.95);
        group.add(head);
        const eyeG = new THREE.SphereGeometry(0.1, 12, 12);
        const eyeM = mat('#2b2540');
        [-0.24, 0.24].forEach((x) => {
          const e = new THREE.Mesh(eyeG, eyeM);
          e.position.set(x, 1.78, 0.63);
          group.add(e);
        });
        const smile = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 16, Math.PI), mat('#9b3b5a'));
        smile.position.set(0, 1.55, 0.62);
        smile.rotation.x = Math.PI;
        group.add(smile);
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mat(shade(skin, -18)));
        nose.position.set(0, 1.66, 0.7);
        group.add(nose);

        const hs = HAIRSTYLES[c.hairStyle];
        if (hs !== 'Careca') {
          if (hs === 'Moicano') {
            const mo = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.9), mat(hairC));
            mo.position.set(0, 2.25, 0);
            group.add(mo);
          } else {
            const capH = new THREE.Mesh(
              new THREE.SphereGeometry(0.76, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
              mat(hairC)
            );
            capH.position.y = 1.8;
            capH.scale.set(1, 1.05, 0.97);
            group.add(capH);
            if (hs === 'Médio') {
              const back = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.5, 0.3), mat(hairC));
              back.position.set(0, 1.55, -0.55);
              group.add(back);
            }
          }
        }
        if (c.beard) {
          const beard = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 18, 18, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45),
            mat(hairC)
          );
          beard.position.set(0, 1.55, 0.12);
          beard.scale.set(1, 1, 0.9);
          group.add(beard);
        }
        if (c.cap) {
          const capCol = '#7C3AED';
          const dome = new THREE.Mesh(
            new THREE.SphereGeometry(0.78, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5),
            mat(capCol)
          );
          dome.position.y = 1.92;
          group.add(dome);
          const brim = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.4), mat(capCol));
          brim.position.set(0, 1.86, 0.55);
          group.add(brim);
        }

        const armG = new THREE.CapsuleGeometry(0.17, 0.55, 6, 10);
        const aL = new THREE.Mesh(armG, mat(topC));
        aL.position.set(-0.78, 0.6, 0);
        aL.rotation.z = 0.25;
        group.add(aL);
        const aR = new THREE.Mesh(armG, mat(topC));
        aR.position.set(0.78, 0.6, 0);
        aR.rotation.z = -0.25;
        group.add(aR);
        const handG = new THREE.SphereGeometry(0.17, 12, 12);
        [-0.93, 0.93].forEach((x) => {
          const hnd = new THREE.Mesh(handG, mat(skin));
          hnd.position.set(x, 0.28, 0);
          group.add(hnd);
        });

        const short = BOTS[c.bot]?.n === 'Bermuda';
        const legG = new THREE.CapsuleGeometry(0.22, short ? 0.32 : 0.62, 6, 10);
        [-0.28, 0.28].forEach((x) => {
          const l = new THREE.Mesh(legG, mat(botC));
          l.position.set(x, short ? 0.0 : -0.15, 0);
          group.add(l);
          if (short) {
            const k = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.3, 6, 10), mat(skin));
            k.position.set(x, -0.42, 0);
            group.add(k);
          }
          const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.5), mat('#f1f1f6'));
          shoe.position.set(x, -0.62, 0.1);
          group.add(shoe);
        });

        const logo = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), mat('#FBBF24'));
        logo.position.set(-0.3, 0.7, 0.6);
        group.add(logo);
        group.position.y = -0.2;
      }
      build(cfg);
      rebuildRef.current = build;

      let drag = false,
        lastX = 0,
        rotY = 0.4;
      const dom = rn.domElement;
      dom.style.cursor = 'grab';
      const down = (e: PointerEvent) => {
        drag = true;
        lastX = e.clientX;
      };
      const up = () => (drag = false);
      const move = (e: PointerEvent) => {
        if (drag) {
          rotY += (e.clientX - lastX) * 0.01;
          lastX = e.clientX;
        }
      };
      dom.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointermove', move);
      const onResize = () => {
        if (!ref.current) return;
        const nw = ref.current.clientWidth;
        rn.setSize(nw, height);
        cam.aspect = nw / height;
        cam.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!drag) rotY += 0.006;
        group.rotation.y = rotY;
        rn.render(scene, cam);
      };
      loop();
      cleanup = () => {
        cancelAnimationFrame(raf);
        dom.removeEventListener('pointerdown', down);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('resize', onResize);
        rn.dispose();
        if (dom.parentNode) dom.parentNode.removeChild(dom);
      };
    })();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    rebuildRef.current?.(cfg);
  }, [cfg]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
