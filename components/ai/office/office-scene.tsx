"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";

export type OfficeAgent = {
  id: string;
  name: string;
  enabled: boolean;
  /** Ran within the last minutes: sits at the desk and types. */
  working: boolean;
  alert: boolean;
  href: string;
};

export type OfficeRoom = {
  key: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  href: string;
  active: boolean;
  agents: OfficeAgent[];
};

export type OfficeFlow = { from: string; to: string; active: boolean };

const PALETTE: Record<string, { body: string; dark: string; eye: string }> = {
  "email-intelligence": { body: "#3b82f6", dark: "#1e3a8a", eye: "#7df9ff" },
  "crm-matching": { body: "#8b5cf6", dark: "#4c1d95", eye: "#c4f1ff" },
  "project-notes": { body: "#f59e0b", dark: "#92400e", eye: "#fff7c2" },
  estimation: { body: "#10b981", dark: "#065f46", eye: "#d6fff1" },
  "reply-drafter": { body: "#f43f5e", dark: "#881337", eye: "#ffe4ea" },
  "follow-up": { body: "#6366f1", dark: "#312e81", eye: "#e0e7ff" },
  "support-triage": { body: "#f97316", dark: "#7c2d12", eye: "#fff1df" },
  "website-monitor": { body: "#06b6d4", dark: "#164e63", eye: "#e0fdff" },
  "lead-check": { body: "#84cc16", dark: "#365314", eye: "#f7fee7" },
  "customer-report": { body: "#d946ef", dark: "#701a75", eye: "#fdf4ff" },
  "voice-notes": { body: "#0ea5e9", dark: "#0c4a6e", eye: "#e0f2fe" },
  "daily-briefing": { body: "#eab308", dark: "#713f12", eye: "#fefce8" },
  "draft-review": { body: "#14b8a6", dark: "#134e4a", eye: "#f0fdfa" },
};

const ROOM_W = 9;
const ROOM_D = 7;
const WALL_H = 2.2;
/** Staggered layout like an isometric office floor. */
const ROOM_POSITIONS: [number, number][] = [
  [-6.5, -5.5],
  [5.5, -6.5],
  [-5.5, 5.5],
  [6.5, 4.5],
];
const WAYPOINTS: [number, number][] = [
  [-3.2, 2.3],
  [3.2, 2.3],
  [0, 1.2],
  [2.6, -0.2],
  [-2.6, -0.2],
];

type Vec2 = [number, number];

/** Labels are plain DOM nodes over the canvas, moved every frame to their 3D anchor. */
type Register = (id: string, object: THREE.Object3D | null) => void;

const PROJECTED = new THREE.Vector3();

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Isometric camera whose zoom keeps the whole floor in view on any screen size. */
function IsoCamera() {
  const size = useThree((state) => state.size);
  const zoom = Math.max(12, Math.min(size.width / 25, size.height / 19));
  return <OrthographicCamera makeDefault position={[22, 20, 22]} zoom={zoom} near={0.1} far={200} />;
}

function LabelProjector({
  anchors,
  elements,
}: {
  anchors: React.RefObject<Map<string, THREE.Object3D>>;
  elements: React.RefObject<Map<string, HTMLElement>>;
}) {
  useFrame(({ camera, size }) => {
    anchors.current.forEach((object, id) => {
      const element = elements.current.get(id);
      if (!element) return;
      object.getWorldPosition(PROJECTED);
      PROJECTED.project(camera);
      const x = (PROJECTED.x * 0.5 + 0.5) * size.width;
      const y = (-PROJECTED.y * 0.5 + 0.5) * size.height;
      element.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      element.style.visibility = "visible";
    });
  });
  return null;
}

function GlowStrip({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
    </mesh>
  );
}

function Desk({ position, color, bright }: { position: [number, number, number]; color: string; bright: boolean }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.8, 0.08, 0.9]} />
        <meshStandardMaterial color="#2a3354" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.27, 0]}>
        <boxGeometry args={[1.6, 0.54, 0.08]} />
        <meshStandardMaterial color="#1c2440" />
      </mesh>
      <mesh position={[0, 0.95, -0.3]} castShadow>
        <boxGeometry args={[0.95, 0.6, 0.05]} />
        <meshStandardMaterial color="#0b1022" />
      </mesh>
      <mesh position={[0, 0.95, -0.27]}>
        <planeGeometry args={[0.85, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={bright ? 2.4 : 0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.66, -0.3]}>
        <boxGeometry args={[0.08, 0.2, 0.08]} />
        <meshStandardMaterial color="#0b1022" />
      </mesh>
      <mesh castShadow position={[0, 0.35, 0.75]}>
        <boxGeometry args={[0.55, 0.08, 0.55]} />
        <meshStandardMaterial color="#111729" />
      </mesh>
      <mesh castShadow position={[0, 0.65, 1.0]}>
        <boxGeometry args={[0.55, 0.6, 0.08]} />
        <meshStandardMaterial color="#111729" />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.5, 16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshStandardMaterial color="#16a34a" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.15, 1.15, 0.05]}>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** A small robot that wanders around its room and sits down at its desk while working. */
function Robot({
  agent,
  desk,
  reducedMotion,
  hovered,
  onHover,
  onOpen,
  register,
}: {
  agent: OfficeAgent;
  desk: Vec2;
  reducedMotion: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onOpen: (href: string) => void;
  register: Register;
}) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const palette = PALETTE[agent.id] ?? { body: "#64748b", dark: "#1e293b", eye: "#e2e8f0" };
  const eye = agent.alert ? "#ff5a5a" : palette.eye;
  const seat: Vec2 = [desk[0], desk[1] + 0.75];
  const state = useRef({ pos: [...seat] as Vec2, target: [...seat] as Vec2, waitUntil: 0, walking: false });

  useFrame(({ clock }, delta) => {
    const g = group.current;
    const b = body.current;
    if (!g || !b) return;
    const t = clock.getElapsedTime();
    const s = state.current;

    if (!agent.enabled || reducedMotion) {
      s.pos = [...seat];
      s.walking = false;
    } else if (agent.working) {
      s.target = seat;
    } else if (!s.walking && t > s.waitUntil) {
      const options = [seat, ...WAYPOINTS];
      s.target = options[Math.floor(Math.random() * options.length)];
    }

    const dx = s.target[0] - s.pos[0];
    const dz = s.target[1] - s.pos[1];
    const distance = Math.hypot(dx, dz);
    if (distance > 0.05 && agent.enabled && !reducedMotion) {
      const step = Math.min(distance, delta * 1.3);
      s.pos = [s.pos[0] + (dx / distance) * step, s.pos[1] + (dz / distance) * step];
      s.walking = true;
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, Math.atan2(dx, dz), 0.15);
    } else if (s.walking) {
      s.walking = false;
      s.waitUntil = t + 3 + Math.random() * 5;
    }

    const atDesk = Math.hypot(s.pos[0] - seat[0], s.pos[1] - seat[1]) < 0.1;
    if (atDesk && !s.walking) {
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, Math.PI, 0.12);
    }

    g.position.set(s.pos[0], 0, s.pos[1]);
    const typing = atDesk && agent.working && !reducedMotion ? Math.abs(Math.sin(t * 14)) * 0.03 : 0;
    const walkBob = s.walking ? Math.abs(Math.sin(t * 9)) * 0.08 : 0;
    const idle = reducedMotion ? 0 : Math.sin(t * 2 + desk[0]) * 0.02;
    b.position.y = (atDesk && !s.walking ? 0.1 : 0) + walkBob + typing + idle;
    b.rotation.z = s.walking ? Math.sin(t * 9) * 0.06 : 0;
  });

  return (
    <group ref={group}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.38, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} />
      </mesh>
      <group
        ref={body}
        scale={hovered ? 1.12 : 1}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(agent.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          onOpen(agent.href);
        }}
      >
        <mesh castShadow position={[0, 0.62, 0]}>
          <capsuleGeometry args={[0.26, 0.38, 8, 16]} />
          <meshStandardMaterial color={palette.body} roughness={0.35} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.66, 0.24]}>
          <circleGeometry args={[0.11, 20]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
        </mesh>
        <mesh castShadow position={[0, 1.22, 0]} scale={[1.15, 0.92, 1]}>
          <sphereGeometry args={[0.34, 24, 18]} />
          <meshStandardMaterial color={palette.body} roughness={0.3} metalness={0.15} />
        </mesh>
        <mesh position={[0, 1.22, 0.27]}>
          <boxGeometry args={[0.52, 0.24, 0.08]} />
          <meshStandardMaterial color="#070b16" roughness={0.2} metalness={0.6} />
        </mesh>
        {[-0.11, 0.11].map((x) => (
          <mesh key={x} position={[x, 1.22, 0.32]}>
            <sphereGeometry args={[0.045, 12, 10]} />
            <meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={agent.working || agent.alert ? 3 : 1.6} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
          <meshStandardMaterial color={palette.dark} />
        </mesh>
        <mesh position={[0, 1.74, 0]}>
          <sphereGeometry args={[0.07, 12, 10]} />
          <meshStandardMaterial color={eye} emissive={eye} emissiveIntensity={agent.working ? 3.5 : 1.4} toneMapped={false} />
        </mesh>
        <group ref={(object) => register(`agent:${agent.id}`, object)} position={[0, 2.05, 0]} />
      </group>
    </group>
  );
}

function Room({
  room,
  position,
  reducedMotion,
  hoveredAgent,
  onHover,
  onOpen,
  register,
}: {
  room: OfficeRoom;
  position: Vec2;
  reducedMotion: boolean;
  hoveredAgent: string | null;
  onHover: (id: string | null) => void;
  onOpen: (href: string) => void;
  register: Register;
}) {
  const [x, z] = position;
  const spacing = room.agents.length > 3 ? 2.1 : room.agents.length > 2 ? 2.9 : 4;
  const desks: Vec2[] = room.agents.map((_, index) => [(index - (room.agents.length - 1) / 2) * spacing, -1.7]);

  return (
    <group position={[x, 0, z]}>
      <mesh receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[ROOM_W, 0.3, ROOM_D]} />
        <meshStandardMaterial color="#171e36" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0.9]} receiveShadow>
        <circleGeometry args={[2.3, 48]} />
        <meshStandardMaterial color={room.color} transparent opacity={0.28} />
      </mesh>

      <mesh receiveShadow position={[0, WALL_H / 2, -ROOM_D / 2]}>
        <boxGeometry args={[ROOM_W, WALL_H, 0.14]} />
        <meshStandardMaterial color="#1d2647" roughness={0.8} />
      </mesh>
      <mesh position={[-ROOM_W / 2, WALL_H / 2, 0]}>
        <boxGeometry args={[0.1, WALL_H, ROOM_D]} />
        <meshStandardMaterial color={room.color} transparent opacity={0.16} roughness={0.1} />
      </mesh>
      <mesh position={[2.4, 1.3, -ROOM_D / 2 + 0.09]}>
        <planeGeometry args={[2.2, 1]} />
        <meshStandardMaterial color={room.color} emissive={room.color} emissiveIntensity={room.active ? 1.6 : 0.5} toneMapped={false} />
      </mesh>

      <GlowStrip position={[0, WALL_H, -ROOM_D / 2]} size={[ROOM_W, 0.05, 0.05]} color={room.color} />
      <GlowStrip position={[-ROOM_W / 2, WALL_H, 0]} size={[0.05, 0.05, ROOM_D]} color={room.color} />
      <GlowStrip position={[0, 0.02, ROOM_D / 2]} size={[ROOM_W, 0.04, 0.04]} color={room.color} />
      <GlowStrip position={[ROOM_W / 2, 0.02, 0]} size={[0.04, 0.04, ROOM_D]} color={room.color} />

      <pointLight position={[0, 3.2, 0.5]} intensity={room.active ? 14 : 8} distance={9} color={room.color} />

      {desks.map((desk, index) => (
        <Desk key={index} position={[desk[0], 0, desk[1]]} color={room.color} bright={room.agents[index]?.working ?? false} />
      ))}
      <Plant position={[-ROOM_W / 2 + 0.7, 0, -ROOM_D / 2 + 0.7]} />
      <Plant position={[ROOM_W / 2 - 0.7, 0, ROOM_D / 2 - 0.8]} />

      {room.agents.map((agent, index) => (
        <Robot
          key={agent.id}
          agent={agent}
          desk={desks[index]}
          reducedMotion={reducedMotion}
          hovered={hoveredAgent === agent.id}
          onHover={onHover}
          onOpen={onOpen}
          register={register}
        />
      ))}

      <group ref={(object) => register(`room:${room.key}`, object)} position={[-1.2, WALL_H + 0.6, -1.4]} />
    </group>
  );
}

/** Light beam between two rooms with data packets travelling along it. */
function Flow({ from, to, color, active, reducedMotion }: { from: Vec2; to: Vec2; color: string; active: boolean; reducedMotion: boolean }) {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(from[0], 0.2, from[1]);
    const b = new THREE.Vector3(to[0], 0.2, to[1]);
    const mid = a.clone().lerp(b, 0.5);
    mid.y = 2.4;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [from, to]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.03, 6, false), [curve]);
  const packets = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    packets.current.forEach((mesh, index) => {
      if (!mesh) return;
      const progress = reducedMotion ? (index + 1) / 4 : (t * (active ? 0.28 : 0.1) + index / 3) % 1;
      mesh.position.copy(curve.getPoint(progress));
    });
  });

  return (
    <group>
      <mesh geometry={tube}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.8 : 0.6} transparent opacity={active ? 0.85 : 0.35} toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            packets.current[index] = mesh;
          }}
        >
          <sphereGeometry args={[active ? 0.12 : 0.08, 12, 10]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function OfficeScene({ rooms, flows }: { rooms: OfficeRoom[]; flows: OfficeFlow[] }) {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const anchors = useRef(new Map<string, THREE.Object3D>());
  const elements = useRef(new Map<string, HTMLElement>());
  const positions = new Map(rooms.map((room, index) => [room.key, ROOM_POSITIONS[index % ROOM_POSITIONS.length]]));
  const colors = new Map(rooms.map((room) => [room.key, room.color]));
  const agents = rooms.flatMap((room) => room.agents);

  const register: Register = (id, object) => {
    if (object) anchors.current.set(id, object);
    else anchors.current.delete(id);
  };
  const bindLabel = (id: string) => (element: HTMLElement | null) => {
    if (element) elements.current.set(id, element);
    else elements.current.delete(id);
  };
  const open = (href: string) => router.push(href);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onPointerMissed={() => (document.body.style.cursor = "")}
      >
        <IsoCamera />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#9fb4ff", "#0b1020", 0.5]} />
        <directionalLight
          position={[12, 22, 8]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.31, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#0a0f1f" roughness={1} />
        </mesh>
        <gridHelper args={[60, 30, "#1b2647", "#121a33"]} position={[0, -0.3, 0]} />

        {rooms.map((room) => (
          <Room
            key={room.key}
            room={room}
            position={positions.get(room.key)!}
            reducedMotion={reducedMotion}
            hoveredAgent={hoveredAgent}
            onHover={setHoveredAgent}
            onOpen={open}
            register={register}
          />
        ))}

        {flows.map((flow) => {
          const from = positions.get(flow.from);
          const to = positions.get(flow.to);
          if (!from || !to) return null;
          return (
            <Flow
              key={`${flow.from}-${flow.to}`}
              from={from}
              to={to}
              color={colors.get(flow.from) ?? "#38bdf8"}
              active={flow.active}
              reducedMotion={reducedMotion}
            />
          );
        })}

        <LabelProjector anchors={anchors} elements={elements} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          target={[0, 0, 0]}
          minPolarAngle={0.75}
          maxPolarAngle={1.05}
          minAzimuthAngle={Math.PI / 4 - 0.7}
          maxAzimuthAngle={Math.PI / 4 + 0.7}
          rotateSpeed={0.5}
        />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {rooms.map((room) => (
          <div key={room.key} ref={bindLabel(`room:${room.key}`)} className="absolute left-0 top-0" style={{ visibility: "hidden" }}>
            <button
              type="button"
              onClick={() => open(room.href)}
              className="pointer-events-auto flex items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-[#0b1022]/85 py-1 pl-1 pr-2 text-left shadow-xl ring-1 backdrop-blur transition hover:bg-[#121a33] sm:gap-2 sm:rounded-[10px] sm:py-1.5 sm:pl-1.5 sm:pr-3"
              style={{ ["--tw-ring-color" as string]: `${room.color}66` }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-[6px] text-[11px] sm:h-7 sm:w-7 sm:rounded-[7px] sm:text-[14px]" style={{ background: room.color }}>
                {room.icon}
              </span>
              <span>
                <span className="block text-[10.5px] font-semibold text-white sm:text-[12px]">{room.title}</span>
                <span className="hidden text-[10px] text-white/60 sm:block">{room.subtitle}</span>
              </span>
            </button>
          </div>
        ))}
        {agents.map((agent) => (
          <div key={agent.id} ref={bindLabel(`agent:${agent.id}`)} className="absolute left-0 top-0" style={{ visibility: "hidden" }}>
            <div
              className="whitespace-nowrap rounded-full bg-[#0b1022]/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg ring-1 ring-white/15 transition-opacity"
              style={{ opacity: hoveredAgent === agent.id || agent.alert ? 1 : 0 }}
            >
              {agent.name}
              {agent.working ? " · arbeitet" : !agent.enabled ? " · aus" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
