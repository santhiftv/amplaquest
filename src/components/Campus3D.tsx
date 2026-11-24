'use client';
import { useEffect, useRef } from 'react';

export default function Campus3D({ height = 360 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    let raf = 0;
    (async () => {
      const THREE = await import('three');
      const mount = ref.current;
      if (!mount) return;
      const w = mount.clientWidth || 480;
      const h = height;

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
      cam.position.set(7.5, 6.2, 9.5);
      cam.lookAt(0, 0.6, 0);

      const rn = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      rn.setPixelRatio(Math.min(2, window.devicePixelRatio));
      rn.setSize(w, h);
      mount.appendChild(rn.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 0.82));
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(6, 11, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x9a6cf5, 0.35);
      fill.position.set(-6, 4, -3);
      scene.add(fill);

      const g = new THREE.Group();
      scene.add(g);
      const M = (c: number, rough = 0.7) =>
        new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.05 });
      const box = (x: number, y: number, z: number, c: number) =>
        new THREE.Mesh(new THREE.BoxGeometry(x, y, z), M(c));

      // terreno
      const ground = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.5, 48), M(0x2fb85f));
      ground.position.y = -0.25;
      g.add(ground);
      const plaza = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.54, 40), M(0xece7f7));
      plaza.position.set(0, -0.22, 1.9);
      g.add(plaza);

      // prédio principal (roxo) com grade de janelas
      const main = box(3.4, 1.8, 2.3, 0x7c3aed);
      main.position.set(0, 0.7, -0.2);
      g.add(main);
      const roof = box(3.6, 0.2, 2.5, 0xfbbf24);
      roof.position.set(0, 1.7, -0.2);
      g.add(roof);
      for (let r = 0; r < 2; r++)
        for (let c = -1; c <= 1; c++) {
          const win = box(0.52, 0.5, 0.06, 0xbfe0ff);
          win.position.set(c * 0.95, 0.55 + r * 0.72, 0.96);
          g.add(win);
        }
      // entrada
      const canopy = box(1.2, 0.12, 0.7, 0x22c55e);
      canopy.position.set(0, 0.5, 1.15);
      g.add(canopy);
      const door = box(0.6, 0.7, 0.08, 0x4c1d95);
      door.position.set(0, 0.2, 1.0);
      g.add(door);

      // ala verde
      const greenW = box(1.7, 1.2, 2.5, 0x22c55e);
      greenW.position.set(-2.4, 0.4, 0.5);
      g.add(greenW);
      const greenR = box(1.8, 0.16, 2.6, 0xffffff);
      greenR.position.set(-2.4, 1.05, 0.5);
      g.add(greenR);

      // ala branca
      const whiteW = box(1.5, 1.0, 2.0, 0xf6f4fb);
      whiteW.position.set(2.3, 0.3, 0.2);
      g.add(whiteW);
      const whiteR = box(1.6, 0.16, 2.1, 0x7c3aed);
      whiteR.position.set(2.3, 0.86, 0.2);
      g.add(whiteR);

      // cúpula (minicidade)
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(0xfbbf24));
      dome.position.set(2.3, 0.86, 0.2);
      g.add(dome);

      // quadra
      const court = box(1.7, 0.06, 1.1, 0xf97316);
      court.position.set(1.8, 0.02, 2.6);
      g.add(court);

      // mastro + bandeira
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), M(0xbbbbbb));
      pole.position.set(1.4, 1.5, 1.6);
      g.add(pole);
      const flag = box(0.55, 0.34, 0.03, 0x7c3aed);
      flag.position.set(1.69, 2.1, 1.6);
      g.add(flag);

      // árvores
      const treeAt = (x: number, z: number) => {
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.0, 10), M(0x15803d));
        crown.position.set(x, 0.42, z);
        g.add(crown);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.35), M(0x8b5a2b));
        trunk.position.set(x, 0.07, z);
        g.add(trunk);
      };
      [[-3.3, -1.5], [3.3, 1.7], [-1.2, -2.0], [1.0, -2.1], [-3.4, 1.9]].forEach(([x, z]) => treeAt(x, z));

      // nuvens
      const clouds = new THREE.Group();
      const cloud = (x: number, y: number, z: number) => {
        const cl = new THREE.Group();
        [[0, 0, 0, 0.45], [0.4, -0.05, 0, 0.32], [-0.4, -0.05, 0, 0.3]].forEach(([dx, dy, dz, r]) => {
          const m = new THREE.Mesh(new THREE.SphereGeometry(r as number, 12, 12), M(0xffffff, 1));
          m.position.set(x + (dx as number), y + (dy as number), z + (dz as number));
          cl.add(m);
        });
        clouds.add(cl);
      };
      cloud(-2.6, 3.2, -1.5);
      cloud(2.8, 3.6, 0.5);
      g.add(clouds);

      // interação
      let drag = false,
        lastX = 0,
        rot = 0.6;
      const dom = rn.domElement;
      dom.style.cursor = 'grab';
      const down = (e: PointerEvent) => {
        drag = true;
        lastX = e.clientX;
        dom.style.cursor = 'grabbing';
      };
      const up = () => {
        drag = false;
        dom.style.cursor = 'grab';
      };
      const move = (e: PointerEvent) => {
        if (drag) {
          rot += (e.clientX - lastX) * 0.01;
          lastX = e.clientX;
        }
      };
      dom.addEventListener('pointerdown', down);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointermove', move);

      const onResize = () => {
        if (!ref.current) return;
        const nw = ref.current.clientWidth;
        rn.setSize(nw, h);
        cam.aspect = nw / h;
        cam.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      let t = 0;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        t += 0.01;
        if (!drag) rot += 0.0035;
        g.rotation.y = rot;
        clouds.children.forEach((c, i) => {
          c.position.x += Math.sin(t + i) * 0.002;
        });
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
  }, [height]);

  return <div ref={ref} style={{ width: '100%', height }} />;
}
