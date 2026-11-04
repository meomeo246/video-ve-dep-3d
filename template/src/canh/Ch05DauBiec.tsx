import React, {useMemo} from 'react';
import * as THREE from 'three';
import {CocThuyTinh, NuocDoiMau, VienDa, COC} from '../three/Coc';
import {MayQuay} from '../three/MayQuay';
import {San} from '../three/Nen';
import {em, emIO, kep, mo, xung, PHACH, O_NHIP} from '../nhip';
const B = O_NHIP;
const P = PHACH;

// ---- Màu anthocyanin theo pH (đậu biếc) ----
export const MOC_PH: [number, string][] = [
	[1, '#ff2a6d'],
	[2.2, '#ff3d9a'],
	[3.2, '#c23dff'],
	[4.2, '#8f3dff'],
	[5.5, '#6a4dff'],
	[7, '#2f5bff'],
	[8.5, '#2aa7ff'],
	[10, '#19d39b'],
	[12, '#b7e83a'],
	[14, '#ffd84a'],
];
const _a = new THREE.Color();
const _b = new THREE.Color();
export const mauPH = (ph: number) => {
	for (let i = 0; i < MOC_PH.length - 1; i++) {
		const [p0, c0] = MOC_PH[i];
		const [p1, c1] = MOC_PH[i + 1];
		if (ph <= p1 || i === MOC_PH.length - 2) {
			const t = kep((ph - p0) / (p1 - p0));
			return '#' + _a.set(c0).lerp(_b.set(c1), t).getHexString();
		}
	}
	return MOC_PH[0][1];
};

// ---- Kịch bản 6 ô nhịp: 0–1 đoạn nghỉ (nước xanh), 2–3 build (nhỏ chanh), 4 drop (đổi màu bùng), 5 giữ ----
const MUC = 2.6; // mặt nước
const GIOT = [...Array.from({length: 8}, (_, k) => Math.round(2 * B + k * P)), ...Array.from({length: 6}, (_, k) => Math.round(4 * B + (k * P) / 2))];
const ROI = 12; // số frame 1 giọt rơi
export const phTai = (f: number) => {
	const a = em(mo(f, 2 * B + ROI, 4 * B));
	const b = emIO(mo(f, 4 * B, 5.2 * B));
	return 7 - a * 2.8 - b * 1.6; // 7 -> 4,2 -> 2,6
};
const frontTai = (f: number) => MUC + 0.2 - (MUC + 0.2 - 0.05) * emIO(mo(f, 2 * B + ROI, 5.3 * B));

const ngau = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const CHANH: [number, number, number] = [1.45, 3.8, 0.3];

const LatChanh: React.FC<{f: number}> = ({f}) => {
	const tex = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = c.height = 512;
		const x = c.getContext('2d')!;
		x.fillStyle = '#a6d41e';
		x.fillRect(0, 0, 512, 512);
		x.translate(256, 256);
		x.fillStyle = '#f4f8d0';
		x.beginPath();
		x.arc(0, 0, 236, 0, Math.PI * 2);
		x.fill();
		for (let i = 0; i < 10; i++) {
			const a0 = (i / 10) * Math.PI * 2 + 0.05;
			const a1 = ((i + 1) / 10) * Math.PI * 2 - 0.05;
			const g = x.createRadialGradient(0, 0, 20, 0, 0, 220);
			g.addColorStop(0, '#fff19a');
			g.addColorStop(1, '#f5c719');
			x.fillStyle = g;
			x.beginPath();
			x.moveTo(Math.cos((a0 + a1) / 2) * 22, Math.sin((a0 + a1) / 2) * 22);
			x.arc(0, 0, 218, a0, a1);
			x.closePath();
			x.fill();
		}
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, []);
	const vao = em(mo(f, 1.5 * B, 2 * B));
	const bop = xung(f - 2 * B, PHACH, 4) * (f >= 2 * B && f < 5 * B ? 1 : 0);
	const y = CHANH[1] + (1 - vao) * 8;
	return (
		<group position={[CHANH[0], y, CHANH[2]]} rotation={[0.9 + bop * 0.15, 0.3 + f * 0.004, -0.5]} scale={1 - bop * 0.08}>
			<mesh>
				<cylinderGeometry args={[0.7, 0.7, 0.18, 64]} />
				<meshBasicMaterial attach="material-0" color="#9fcf1f" />
				<meshBasicMaterial attach="material-1" map={tex} color="#d9d9d9" />
				<meshBasicMaterial attach="material-2" map={tex} color="#d9d9d9" />
			</mesh>
		</group>
	);
};

const Giot: React.FC<{f: number; i: number; s: number}> = ({f, i, s}) => {
	const t = (f - s) / ROI;
	if (t < 0 || t > 1) return null;
	const dx = (ngau(i) - 0.5) * 0.9;
	const dz = (ngau(i + 9) - 0.5) * 0.7;
	const x = CHANH[0] - 0.1 + (dx - CHANH[0] + 0.1) * t;
	const z = CHANH[2] + (dz - CHANH[2]) * t;
	const y = CHANH[1] - 0.25 - (CHANH[1] - 0.25 - MUC) * t * t;
	return (
		<group position={[x, y, z]}>
			<mesh scale={[1, 1.5 + t, 1]}>
				<sphereGeometry args={[0.075, 20, 20]} />
				<meshBasicMaterial color={new THREE.Color('#ffe45c').multiplyScalar(2)} toneMapped={false} />
			</mesh>
		</group>
	);
};

const Gon: React.FC<{f: number; i: number; s: number; mau: string}> = ({f, i, s, mau}) => {
	const t = (f - s - ROI) / 24;
	if (t < 0 || t > 1) return null;
	const dx = (ngau(i) - 0.5) * 0.9;
	const dz = (ngau(i + 9) - 0.5) * 0.7;
	const r = 0.08 + em(t) * 0.75;
	const c = new THREE.Color('#fff3a0').lerp(new THREE.Color(mau), t).multiplyScalar(1.8 * (1 - t));
	return (
		<mesh position={[dx, MUC + 0.012, dz]} rotation={[-Math.PI / 2, 0, 0]}>
			<ringGeometry args={[r, r + 0.035, 64]} />
			<meshBasicMaterial color={c} toneMapped={false} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
		</mesh>
	);
};

/** Bọt li ti nổi lên trong nước. */
const BotNuoc: React.FC<{f: number; mau: string}> = ({f, mau}) => {
	const n = 70;
	const pts = useMemo(() => {
		const a: [number, number, number, number][] = [];
		for (let i = 0; i < n; i++) a.push([ngau(i * 3) * Math.PI * 2, Math.sqrt(ngau(i * 3 + 1)) * 0.68, ngau(i * 3 + 2), 0.008 + ngau(i * 7) * 0.02]);
		return a;
	}, []);
	const c = new THREE.Color(mau).lerp(new THREE.Color('#ffffff'), 0.5).multiplyScalar(1.6);
	return (
		<group>
			{pts.map(([g, r, k, s], i) => {
				const y = COC.day + 0.1 + ((k * (MUC - 0.4) + f * (0.004 + s * 0.15)) % (MUC - 0.4));
				return (
					<mesh key={i} position={[Math.cos(g + f * 0.01) * r, y, Math.sin(g + f * 0.01) * r]}>
						<sphereGeometry args={[s, 8, 8]} />
						<meshBasicMaterial color={c} toneMapped={false} transparent opacity={0.7} />
					</mesh>
				);
			})}
		</group>
	);
};

export const Ba05: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const ph = phTai(f);
	const mauTren = mauPH(ph);
	const mauDuoi = mauPH(7);
	const p = f / dai;
	const goc = -0.55 + 0.95 * emIO(p);
	const xa = 20.5 - 2.5 * em(p);
	const cao = 5.6 - 1.4 * em(p);
	const lac = (f >= 4 * B ? xung(f, O_NHIP, 6) * 0.06 : 0) + (f >= 4 * B ? xung(f - 4 * B, 9999, 5) * 0.2 : 0);
	const nhipBe = Math.max(...GIOT.map((s) => (f >= s + ROI ? Math.exp(-(f - s - ROI) / 8) : 0)));
	return (
		<group>
			<MayQuay pos={[Math.sin(goc) * xa, cao, Math.cos(goc) * xa]} nhin={[0.15, 1.85, 0]} fov={33} lac={lac} f={f} />
			<San f={f} mau={mauTren} nhip={nhipBe} banKinh={2.2} />
			<pointLight position={[0, 2, 0]} intensity={6} color={mauTren} distance={8} />
			<NuocDoiMau muc={MUC} front={frontTai(f)} mauTren={mauTren} mauDuoi={mauDuoi} t={f / 30} vach={f > 2 * B + ROI && f < 5.3 * B ? 1 : 0} />
			<BotNuoc f={f} mau={mauTren} />
			<VienDa position={[-0.38, MUC + 0.08 + Math.sin(f * 0.08) * 0.03, 0.22]} rotation={[0.4, f * 0.01, 0.2]} size={0.52} />
			<VienDa position={[0.36, MUC + 0.05 + Math.cos(f * 0.07) * 0.03, -0.3]} rotation={[0.1, 0.8 - f * 0.008, 0.5]} size={0.46} />
			<CocThuyTinh sang={1 + (f >= 4 * B ? xung(f, O_NHIP, 8) * 0.3 : 0)} />
			<LatChanh f={f} />
			{GIOT.map((s, i) => (
				<Giot key={'g' + i} f={f} i={i} s={s} />
			))}
			{GIOT.map((s, i) => (
				<Gon key={'r' + i} f={f} i={i} s={s} mau={mauTren} />
			))}
		</group>
	);
};
