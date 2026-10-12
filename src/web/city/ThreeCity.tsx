import React, { useEffect, useRef, useState } from "react";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { CityDistrict } from "../../application/city-types.ts";

// Authored campus plans: positions and footprints never depend on current quantities.
export const CAMPUS_PLANS = [
  {
    x: -65,
    z: -35,
    angle: -0.16,
    kind: "都会塔群",
    lots: [
      [-13, -8],
      [5, -11],
      [14, 8],
      [-12, 12],
    ],
  },
  {
    x: -8,
    z: -57,
    angle: 0.14,
    kind: "庭院总部",
    lots: [
      [-13, 0],
      [12, -8],
      [10, 12],
      [-12, 15],
    ],
  },
  {
    x: 59,
    z: -38,
    angle: -0.32,
    kind: "林间退台",
    lots: [
      [-10, -7],
      [12, 7],
      [-12, 13],
      [12, -13],
    ],
  },
  {
    x: -61,
    z: 33,
    angle: 0.3,
    kind: "创意街坊",
    lots: [
      [-13, -10],
      [9, 8],
      [10, -12],
      [-12, 12],
    ],
  },
  {
    x: 0,
    z: 49,
    angle: -0.2,
    kind: "花园环廊",
    lots: [
      [0, -6],
      [-17, 13],
      [15, 14],
      [17, -11],
    ],
  },
  {
    x: 66,
    z: 35,
    angle: 0.12,
    kind: "滨水园区",
    lots: [
      [-12, -9],
      [10, 9],
      [12, -13],
      [-13, 14],
    ],
  },
] as const;
export function threeCampusLots(
  plan: (typeof CAMPUS_PLANS)[number],
  count: number,
): Array<{ x: number; z: number; scale: number }> {
  if (count <= plan.lots.length) {
    return plan.lots.map(([x, z]) => ({ x, z, scale: 1 }));
  }
  const columns = Math.ceil(Math.sqrt(count * 1.15));
  const rows = Math.ceil(count / columns);
  const stepX = columns <= 1 ? 0 : 39 / (columns - 1);
  const stepZ = rows <= 1 ? 0 : 31 / (rows - 1);
  const scale = Math.min(0.72, 2.15 / Math.max(columns, rows));
  return Array.from({ length: count }, (_, index) => ({
    x: -19.5 + (index % columns) * stepX,
    z: -15.5 + Math.floor(index / columns) * stepZ,
    scale,
  }));
}
interface Props {
  districts: CityDistrict[];
  scope: string;
  selected: string | null;
  zoom: number;
  moving: boolean;
  reset: number;
  onSelect(account: string, holding?: string): void;
}
interface Tower {
  group: T.Group;
  floors: T.Group[];
  roof: T.Mesh;
  garden: T.Group;
  district: string;
  key: string;
  selection: T.Mesh;
  heightScale: number;
}
const COLORS: Record<string, number> = {
  glass: 0x548b99,
  stone: 0xd4c7aa,
  dark: 0x3f6972,
  copper: 0xbf855d,
  green: 0x819c80,
};
export function ThreeCity(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const [error, setError] = useState("");
  useEffect(() => {
    const element = host.current!;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setError(
        "当前设备无法启用 WebGL 2。持仓与时间轴仍可查看，请使用支持硬件加速的浏览器。",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFShadowMap;
    renderer.setClearColor(0xebece0, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "三维账户城市，可拖动旋转、滚轮缩放",
    );
    renderer.domElement.setAttribute("role", "img");
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, 0.1, 1500);
    camera.position.set(173, 180, 221);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 85;
    controls.maxDistance = 480;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = 1.32;
    controls.enablePan = true;
    controls.update();
    scene.add(new T.HemisphereLight(0xdff0ff, 0x8d8a61, 2.1));
    const sun = new T.DirectionalLight(0xffe6bb, 2.8);
    sun.position.set(-100, 170, 75);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -145,
      right: 145,
      top: 145,
      bottom: -145,
      near: 1,
      far: 400,
    });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.12;
    scene.add(sun);
    const geometries = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>();
    const material = (color: number, roughness = 0.75) => {
      const m = new T.MeshStandardMaterial({ color, roughness });
      materials.add(m);
      return m;
    };
    const stone = material(0xe5ddc9),
      asphalt = material(0x515b60),
      grass = material(0xa6bb87),
      water = material(0x6ba5ac, 0.28),
      wood = material(0xb99160);
    const white = material(0xf6efdc),
      dark = material(0x455b5a),
      leaf = [material(0x5d8754), material(0x7c9b60), material(0x91ad6b)];
    const cube = new T.BoxGeometry(1, 1, 1);
    geometries.add(cube);
    const ball = new T.IcosahedronGeometry(1, 1);
    geometries.add(ball);
    const mesh = (
      g: T.BufferGeometry,
      m: T.Material,
      parent: T.Object3D,
      x: number,
      y: number,
      z: number,
    ) => {
      geometries.add(g);
      const o = new T.Mesh(g, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    const box = (
      parent: T.Object3D,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      m: T.Material,
    ) => {
      const o = mesh(cube, m, parent, x, y, z);
      o.scale.set(w, h, d);
      return o;
    };
    const disc = (
      parent: T.Object3D,
      x: number,
      z: number,
      r: number,
      m: T.Material,
      y = 0.2,
    ) => mesh(new T.CylinderGeometry(r, r, 0.3, 48), m, parent, x, y, z);
    const tree = (
      parent: T.Object3D,
      x: number,
      z: number,
      size = 1,
      variant = 0,
    ) => {
      box(parent, x, 1.5 * size, z, 0.55 * size, 3 * size, 0.55 * size, wood);
      const o = mesh(ball, leaf[variant % 3]!, parent, x, 4 * size, z);
      o.scale.set(2.1 * size, 2.6 * size, 2.1 * size);
    };
    const ribbon = (
      points: number[][],
      width: number,
      mat: T.Material,
      y = 0.15,
      closed = false,
    ) => {
      const curve = new T.CatmullRomCurve3(
        points.map((p) => new T.Vector3(p[0]!, y, p[1]!)),
        closed,
        "centripetal",
      );
      const positions: number[] = [],
        indices: number[] = [];
      for (let i = 0; i <= 160; i++) {
        const p = curve.getPoint(i / 160),
          t = curve.getTangent(i / 160);
        const n = new T.Vector3(-t.z, 0, t.x)
          .normalize()
          .multiplyScalar(width / 2);
        positions.push(p.x + n.x, y, p.z + n.z, p.x - n.x, y, p.z - n.z);
        if (i < 160) {
          const a = i * 2;
          indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
      g.setIndex(indices);
      g.computeVertexNormals();
      // Ribbon winding is downward; ground paths should be visible from either side.
      mat.side = T.DoubleSide;
      mesh(g, mat, scene, 0, 0, 0);
      return curve;
    };
    const outline = new T.Shape();
    [
      [-117, -69],
      [-92, -91],
      [14, -93],
      [100, -70],
      [117, -18],
      [109, 72],
      [45, 92],
      [-63, 86],
      [-116, 42],
    ].forEach(([x, z], i) =>
      i ? outline.lineTo(x!, z!) : outline.moveTo(x!, z!),
    );
    outline.closePath();
    const base = mesh(
      new T.ExtrudeGeometry(outline, {
        depth: 3,
        bevelEnabled: true,
        bevelSize: 2,
        bevelThickness: 1,
        bevelSegments: 2,
        steps: 1,
      }),
      stone,
      scene,
      0,
      -4.5,
      0,
    );
    base.rotation.x = -Math.PI / 2;
    const ground = mesh(new T.ShapeGeometry(outline), grass, scene, 0, 0.04, 0);
    ground.rotation.x = -Math.PI / 2;
    const ring = [
      [-100, -55],
      [-74, -77],
      [15, -79],
      [89, -56],
      [101, -8],
      [91, 61],
      [32, 76],
      [-63, 68],
      [-102, 31],
    ];
    ribbon(ring, 11, stone, 0.11, true);
    const road = ribbon(ring, 7, asphalt, 0.18, true);
    ribbon(
      [
        [-107, 1],
        [-66, -1],
        [-23, 5],
        [23, 1],
        [69, -6],
        [104, -14],
      ],
      12,
      stone,
      0.19,
    );
    const cross = ribbon(
      [
        [-107, 1],
        [-66, -1],
        [-23, 5],
        [23, 1],
        [69, -6],
        [104, -14],
      ],
      7,
      asphalt,
      0.23,
    );
    for (const curve of [road, cross])
      for (let i = 0; i < 100; i++) {
        const p = curve.getPoint(i / 100),
          t = curve.getTangent(i / 100);
        const dash = box(scene, p.x, 0.27, p.z, 0.22, 0.035, 1.4, white);
        dash.rotation.y = Math.atan2(t.x, t.z);
      }
    // Shared green heart, meandering water and boardwalk join the otherwise distinct campuses.
    ribbon(
      [
        [-32, -22],
        [-17, -29],
        [8, -24],
        [27, -17],
        [42, -19],
      ],
      11,
      stone,
      0.2,
    );
    ribbon(
      [
        [-32, -22],
        [-17, -29],
        [8, -24],
        [27, -17],
        [42, -19],
      ],
      8,
      water,
      0.24,
    );
    box(scene, 0, 0.65, -24, 4, 0.6, 15, wood);
    ribbon(
      [
        [-37, 21],
        [-17, 26],
        [5, 23],
        [28, 19],
        [48, 20],
      ],
      3,
      stone,
      0.2,
    );
    for (let i = 0; i < 23; i++) {
      const x = -37 + i * 3.8;
      tree(scene, x, 19 + Math.sin(i * 0.8) * 3, 0.65, i);
    }
    for (let i = 0; i < 58; i++) {
      const p = road.getPoint(i / 58);
      const n = road.getTangent(i / 58);
      tree(scene, p.x - n.z * 7, p.z + n.x * 7, 0.65 + (i % 3) * 0.1, i);
    }
    const towers: Tower[] = [],
      campuses: T.Group[] = [],
      pickables: T.Object3D[] = [];
    latest.current.districts.forEach((district, index) => {
      const plan = CAMPUS_PLANS[index % CAMPUS_PLANS.length]!;
      const campus = new T.Group();
      campus.position.set(plan.x, 0.35, plan.z);
      campus.rotation.y = plan.angle;
      scene.add(campus);
      campuses.push(campus);
      const shape = new T.Shape();
      const perimeter =
        index % 2
          ? [
              [-25, -19],
              [-12, -25],
              [22, -19],
              [26, 10],
              [12, 23],
              [-24, 17],
            ]
          : [
              [-26, -18],
              [12, -23],
              [27, -6],
              [22, 23],
              [-16, 25],
              [-27, 7],
            ];
      perimeter.forEach(([x, z], i) =>
        i ? shape.lineTo(x!, z!) : shape.moveTo(x!, z!),
      );
      shape.closePath();
      const pad = mesh(
        new T.ShapeGeometry(shape),
        material(index % 2 ? 0xd8dcc4 : 0xe1dccb),
        campus,
        0,
        0,
        0,
      );
      pad.rotation.x = -Math.PI / 2;
      pad.userData = { account: district.id };
      pickables.push(pad);
      // Pedestrian entrance joins the common boulevard; each campus has a different courtyard.
      box(campus, 0, 0.06, index < 3 ? 18 : -18, 4, 0.1, 14, stone);
      if (index === 4) {
        disc(campus, 0, 0, 17, grass);
        disc(campus, 0, 0, 6, water, 0.3);
      } else if (index === 1) {
        box(campus, 0, 0.12, 7, 14, 0.2, 14, grass);
        disc(campus, 0, 7, 4, water, 0.35);
      } else {
        disc(campus, index % 2 ? -8 : 7, index % 2 ? 8 : -3, 5, grass);
      }
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        tree(
          campus,
          Math.cos(a) * 23,
          Math.sin(a) * 20,
          0.55 + (i % 3) * 0.15,
          i + index,
        );
      }
      const slots = district.assetSlots ?? district.assets.map((a) => a.key);
      const towerLots = threeCampusLots(plan, slots.length);
      slots.forEach((key, i) => {
        const lot = towerLots[i]!;
        const group = new T.Group();
        group.position.set(lot.x, 0.2, lot.z);
        group.scale.set(lot.scale, 1, lot.scale);
        campus.add(group);
        const garden = new T.Group();
        garden.position.copy(group.position);
        garden.scale.set(lot.scale, 1, lot.scale);
        campus.add(garden);
        disc(garden, 0, 0, 5, grass);
        tree(garden, 0, 0, 0.85, index + i);
        tree(garden, 3, -2, 0.5, index);
        const h = district.assets.find((a) => a.key === key);
        const facade = material(
          COLORS[h?.tone ?? "glass"] ?? COLORS.glass!,
          0.32,
        );
        facade.metalness = 0.18;
        const type = index === 4 ? 3 : (index + i) % 3;
        group.userData.stepped = type === 2;
        const floors: T.Group[] = [];
        for (let f = 0; f < 24; f++) {
          const floor = new T.Group();
          floor.position.y = f * 2;
          group.add(floor);
          floors.push(floor);
          const step =
            type === 2 ? Math.max(0.55, 1 - Math.floor(f / 4) * 0.12) : 1;
          if (type === 3) {
            const shape = new T.Shape();
            shape.absarc(0, 0, 10, 0, Math.PI * 2, false);
            const hole = new T.Path();
            hole.absarc(0, 0, 6.5, 0, Math.PI * 2, true);
            shape.holes.push(hole);
            const o = mesh(
              new T.ExtrudeGeometry(shape, {
                depth: 1.9,
                bevelEnabled: false,
                curveSegments: 24,
              }),
              f % 3 === 0 ? stone : facade,
              floor,
              0,
              0,
              0,
            );
            o.rotation.x = -Math.PI / 2;
          } else {
            box(
              floor,
              0,
              0.85,
              0,
              (type === 1 ? 14 : 10) * step,
              1.7,
              (type === 1 ? 7 : 10) * step,
              facade,
            );
            box(
              floor,
              0,
              1.8,
              0,
              (type === 1 ? 14.5 : 10.5) * step,
              0.24,
              (type === 1 ? 7.5 : 10.5) * step,
              stone,
            );
            for (let k = -1; k <= 1; k++)
              box(
                floor,
                k * 2.8 * step,
                0.8,
                (type === 1 ? 3.52 : 5.02) * step,
                0.16,
                1.55,
                0.08,
                white,
              );
          }
          if (type === 1 && f < 3) {
            box(floor, 8, 0.85, 5, 7, 1.7, 12, facade);
            box(floor, 8, 1.8, 5, 7.4, 0.24, 12.4, stone);
            box(floor, -7, 0.85, -4, 6, 1.7, 9, facade);
            box(floor, -7, 1.8, -4, 6.4, 0.24, 9.4, stone);
          }
          floor.traverse((o) => {
            o.userData = { account: district.id, holding: key };
            if (o instanceof T.Mesh) pickables.push(o);
          });
        }
        const roof = box(
          group,
          0,
          1,
          0,
          type === 1 ? 14.5 : 10.5,
          0.7,
          type === 1 ? 7.5 : 10.5,
          stone,
        );
        if (type === 3) roof.visible = false;
        roof.userData = { account: district.id, holding: key };
        pickables.push(roof);
        const selection = mesh(
          new T.RingGeometry(7, 7.5, 48),
          material(0xd9ab54),
          campus,
          lot.x,
          0.4,
          lot.z,
        );
        selection.rotation.x = -Math.PI / 2;
        selection.scale.set(lot.scale, lot.scale, 1);
        selection.visible = false;
        towers.push({
          group,
          floors,
          roof,
          garden,
          district: district.id,
          key,
          selection,
          heightScale: type === 3 ? 0.09 : type === 1 ? 0.16 : 0.25,
        });
      });
      // Low pavilion + shaded seating at the campus edge, not another asset.
      const pavilion = new T.Group();
      pavilion.position.set(index % 2 ? 17 : -17, 0, index < 3 ? 18 : -18);
      campus.add(pavilion);
      box(pavilion, 0, 1.3, 0, 7, 2.6, 4, dark);
      box(pavilion, 0, 2.9, 0, 9, 0.45, 6, wood);
      for (let i = 0; i < 3; i++)
        box(campus, -6 + i * 4, 0.6, index < 3 ? 22 : -22, 2.5, 0.5, 1, wood);
      // Deliberate low-rise commons: a court, greenhouse or shaded terrace.
      if (index === 3) {
        const court = box(
          campus,
          10,
          0.16,
          -12,
          13,
          0.2,
          10,
          material(0x668e80),
        );
        for (const z of [-16, -12, -8])
          box(campus, 10, 0.3, z, 12, 0.03, 0.12, white);
        box(campus, 10, 0.7, -12, 13, 1, 0.1, white);
      } else if (index === 2) {
        box(campus, -9, 1, 13, 10, 2, 6, material(0x9cbcaf, 0.35));
        box(campus, -9, 2.2, 13, 11, 0.35, 7, stone);
      } else if (index === 5) {
        for (let j = 0; j < 4; j++) {
          box(campus, -12 + j * 2.5, 1.5, 15, 0.25, 3, 0.25, wood);
          box(campus, -12 + j * 2.5, 3, 15, 0.6, 0.3, 9, wood);
        }
      }
    });
    // Small transit shelters, plaza furniture, vehicles and pedestrians add human scale.
    for (const x of [-37, 38]) {
      box(scene, x, 2, 9, 9, 0.6, 4, wood);
      for (const dx of [-4, 4]) box(scene, x + dx, 1, 9, 0.25, 2, 0.25, dark);
    }
    // Civic lawn with terraced seating and a pavilion beside the water.
    for (let i = 3; i > 0; i--)
      disc(scene, 26, -24, 4 + i * 1.2, stone, 0.25 + (3 - i) * 0.35);
    disc(scene, 26, -24, 3.5, wood, 1.4);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      tree(scene, -15 + Math.cos(a) * 7, -24 + Math.sin(a) * 5, 0.8, i);
    }
    box(scene, 43, -0.0, -28, 12, 0.5, 7, stone);
    box(scene, 43, 1.8, -28, 10, 3.4, 5, dark);
    box(scene, 43, 3.8, -28, 13, 0.5, 8, wood);
    for (const x of [-40, 39])
      for (let k = 0; k < 5; k++)
        box(scene, x + k * 0.8, 0.3, 3, 0.45, 0.03, 6, white);
    for (let i = 0; i < 18; i++) {
      const p = road.getPoint(i / 18);
      box(scene, p.x, 2.7, p.z + 5, 0.18, 5.4, 0.18, dark);
      box(scene, p.x + 0.7, 5.4, p.z + 5, 1.6, 0.25, 0.6, white);
    }
    const cars: T.Group[] = [];
    for (let i = 0; i < 9; i++) {
      const car = new T.Group();
      box(
        car,
        0,
        0.6,
        0,
        1.7,
        1,
        3.5,
        material([0xd2a064, 0xf1e7d1, 0x648b90][i % 3]!),
      );
      box(car, 0, 1.35, 0, 1.3, 0.65, 1.8, dark);
      scene.add(car);
      cars.push(car);
    }
    for (let i = 0; i < 22; i++) {
      const p = cross.getPoint((i + 0.3) / 23);
      box(scene, p.x, 1, p.z + 5, 0.45, 1.5, 0.45, i % 3 ? wood : dark);
    }
    let dirty = true,
      frame = 0,
      lastZoom = 1,
      lastScope = "all",
      lastReset = 0,
      lastProps: Props | null = null,
      travelTime = 0,
      lastNow = 0,
      focusFrames = 0,
      targetDistance = 333;
    const target = new T.Vector3(),
      ray = new T.Raycaster(),
      pointer = new T.Vector2();
    let start = { x: 0, y: 0 };
    const down = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) return;
      const r = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(pickables, false).find((h) => {
        let p: T.Object3D | null = h.object;
        while (p) {
          if (!p.visible) return false;
          p = p.parent;
        }
        return true;
      });
      if (hit)
        latest.current.onSelect(
          hit.object.userData.account,
          hit.object.userData.holding,
        );
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    const change = () => {
      dirty = true;
    };
    controls.addEventListener("change", change);
    controls.addEventListener("start", () => {
      focusFrames = 0;
    });
    const resize = () => {
      const w = element.clientWidth,
        h = element.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.zoom = latest.current.zoom * Math.min(1, camera.aspect / 1.5);
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const lost = (e: Event) => {
      e.preventDefault();
      setError("三维画面暂时失去图形上下文，请刷新页面恢复。");
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const p = latest.current;
      if (lastProps !== p) {
        for (const tower of towers) {
          const d = p.districts.find((d) => d.id === tower.district);
          const asset = d?.assets.find((a) => a.key === tower.key);
          const presence = asset?.presence ?? (asset ? 1 : 0);
          const height = asset
            ? asset.height * tower.heightScale * presence
            : 0;
          tower.group.visible = height > 0.01;
          tower.garden.visible = presence < 0.4;
          const units = height / 2;
          tower.floors.forEach((floor, i) => {
            floor.visible = units > i;
            floor.scale.y = Math.min(1, Math.max(0.001, units - i));
          });
          tower.roof.position.y = height + 0.3;
          const topStep = Math.max(
            0.55,
            1 - Math.floor(Math.max(0, units - 1) / 4) * 0.12,
          );
          if (tower.group.userData.stepped)
            tower.roof.scale.set(10.5 * topStep, 0.7, 10.5 * topStep);
          tower.selection.visible =
            p.selected === tower.key && tower.group.visible;
        }
        lastProps = p;
        dirty = true;
      }
      if (p.scope !== lastScope) {
        const matches = p.districts.flatMap((d, i) =>
          d.id === p.scope || d.scope === p.scope
            ? [CAMPUS_PLANS[i % CAMPUS_PLANS.length]!]
            : [],
        );
        target.set(
          matches.length
            ? matches.reduce((s, m) => s + m.x, 0) / matches.length
            : 0,
          2,
          matches.length
            ? matches.reduce((s, m) => s + m.z, 0) / matches.length
            : 0,
        );
        targetDistance =
          matches.length === 1 ? 165 : matches.length > 1 ? 245 : 333;
        lastScope = p.scope;
        focusFrames = 45;
        if (reducedMotion.matches) {
          const offset = camera.position
            .clone()
            .sub(controls.target)
            .setLength(targetDistance);
          controls.target.copy(target);
          camera.position.copy(target).add(offset);
          focusFrames = 0;
        }
        dirty = true;
      }
      if (p.reset !== lastReset) {
        camera.position.set(173, 180, 221);
        target.set(0, 2, 0);
        lastReset = p.reset;
        controls.target.set(0, 2, 0);
        focusFrames = 0;
        dirty = true;
      }
      if (p.zoom !== lastZoom) {
        camera.zoom = p.zoom * Math.min(1, camera.aspect / 1.5);
        camera.updateProjectionMatrix();
        lastZoom = p.zoom;
        dirty = true;
      }
      if (focusFrames > 0) {
        focusFrames--;
        const delta = target.clone().sub(controls.target).multiplyScalar(0.08);
        camera.position.add(delta);
        controls.target.add(delta);
        const offset = camera.position.clone().sub(controls.target);
        offset.setLength(
          T.MathUtils.lerp(offset.length(), targetDistance, 0.08),
        );
        camera.position.copy(controls.target).add(offset);
        dirty = true;
      }
      if (p.moving && !reducedMotion.matches && !document.hidden)
        travelTime += Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      cars.forEach((car, i) => {
        const t = (i / 9 + travelTime * 0.012) % 1;
        const pos = road.getPoint(t),
          tangent = road.getTangent(t);
        car.position.copy(pos);
        car.rotation.y = Math.atan2(tangent.x, tangent.z);
      });
      controls.update();
      if (dirty || (p.moving && !reducedMotion.matches)) {
        renderer.render(scene, camera);
        dirty = false;
      }
      element.dataset.renderer = "three";
      element.dataset.buildings = String(
        towers.filter((t) => t.group.visible).length,
      );
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      sun.shadow.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div className="three-city" ref={host}>
      {error && (
        <p className="three-error" role="alert">
          {error}
        </p>
      )}
      <span className="three-help">拖动旋转 · 右键平移 · 滚轮缩放</span>
    </div>
  );
}
