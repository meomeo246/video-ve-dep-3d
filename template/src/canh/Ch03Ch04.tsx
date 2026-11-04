import React, {useMemo} from 'react';
import * as THREE from 'three';
import {San} from '../three/Nen';
import {QuayQuanh} from './Ch01Ch02';
import {KhoiChu, Cth} from '../Chu';
import {em, emIO, mo, xung, nay, kep, O_NHIP as B, PHACH as P} from '../nhip';

const TAM_Y = 2.3;
const r01 = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

// ---------------- 03 TRÂN CHÂU · tinh bột ----------------
/** Chuỗi xoắn amylose: các mắt glucose (lăng trụ 6 cạnh) xếp theo đường xoắn. */
const XoanAmylose: React.FC<{f: number; hien: number; mau: string}> = ({f, hien, mau}) => {
	const n = 46;
	const mat = useMemo(() => new THREE.MeshPhysicalMaterial({color: mau, emissive: new THREE.Color(mau), emissiveIntensity: 0.15, roughness: 0.3, clearcoat: 1}), [mau]);
	const items = [];
	for (let i = 0; i < n; i++) {
		const k = kep(hien * (n + 4) - i, 0, 4) / 4;
		if (k <= 0) continue;
		const t = i / n;
		const g = t * Math.PI * 2 * 3.2 + f * 0.03;
		const y = -1.55 + t * 3.0;
		const r = 1.3;
		const p = new THREE.Vector3(Math.cos(g) * r, y, Math.sin(g) * r);
		const tg = new THREE.Vector3(-Math.sin(g) * r * 20.1, 3.0, Math.cos(g) * r * 20.1).normalize();
		const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
		items.push(
			<mesh key={i} position={p} quaternion={q} scale={nay(k) * 0.15} material={mat}>
				<cylinderGeometry args={[1, 1, 0.55, 6]} />
			</mesh>,
		);
	}
	const den = Math.max(0.001, kep(hien * (n + 4) / n));
	const duong = new THREE.CatmullRomCurve3(
		Array.from({length: 80}, (_, i) => {
			const t = (i / 79) * den;
			const g = t * Math.PI * 2 * 3.2 + f * 0.03;
			return new THREE.Vector3(Math.cos(g) * 1.3, -1.55 + t * 3.0, Math.sin(g) * 1.3);
		}),
	);
	return (
		<group>
			{items}
			<mesh>
				<tubeGeometry args={[duong, 200, 0.035, 8, false]} />
				<meshBasicMaterial color={new THREE.Color(mau).multiplyScalar(1.4)} toneMapped={false} />
			</mesh>
		</group>
	);
};

/** Phân tử nước bay vào hạt. */
const NuocBay: React.FC<{f: number; a: number; b: number}> = ({f, a, b}) => {
	const n = 26;
	const out = [];
	for (let i = 0; i < n; i++) {
		const s = a + (i / n) * (b - a);
		const t = (f - s) / 22;
		if (t < 0 || t > 1) continue;
		const g = r01(i) * Math.PI * 2;
		const e = r01(i + 50) * 1.6 - 0.8;
		const R = 4.2 - em(t) * 3.2;
		out.push(
			<group key={i} position={[Math.cos(g) * R, e * R * 0.4, Math.sin(g) * R]} rotation={[t * 6, g, 0]} scale={1 - t * 0.5}>
				<mesh>
					<sphereGeometry args={[0.13, 14, 10]} />
					<meshBasicMaterial color={new THREE.Color('#3da8ff').multiplyScalar(1.6)} toneMapped={false} />
				</mesh>
				<mesh position={[0.12, 0.08, 0]}>
					<sphereGeometry args={[0.075, 10, 8]} />
					<meshBasicMaterial color="#ffffff" />
				</mesh>
				<mesh position={[-0.12, 0.08, 0]}>
					<sphereGeometry args={[0.075, 10, 8]} />
					<meshBasicMaterial color="#ffffff" />
				</mesh>
			</group>,
		);
	}
	return <group>{out}</group>;
};

export const Ba03: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const mau = '#34d399';
	const ho = em(mo(f, 2.2 * B, 3.6 * B));
	const matHat = useMemo(() => new THREE.MeshPhysicalMaterial({roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, envMapIntensity: 0.5}), []);
	matHat.color.set(new THREE.Color('#1a0f0b').lerp(new THREE.Color('#5a3420'), ho));
	matHat.emissive.set(new THREE.Color('#000000').lerp(new THREE.Color('#ff9a4a'), ho * 0.35));
	matHat.opacity = 1 - ho * 0.25;
	const phinh = 1 + ho * 0.32 + xung(f, P, 4) * 0.015;
	return (
		<group>
			<QuayQuanh f={f} dai={dai} goc={[-0.3, 0.4]} xa={[17, 13.5]} />
			<San f={f} mau={mau} nhip={xung(f, B, 8)} banKinh={2.6} />
			<group position={[0, TAM_Y - 0.25, 0]}>
				<mesh scale={0.82 * phinh} material={matHat}>
					<sphereGeometry args={[1, 64, 48]} />
				</mesh>
				<mesh scale={0.5 * phinh}>
					<sphereGeometry args={[1, 32, 24]} />
					<meshBasicMaterial color={new THREE.Color('#ffb066').multiplyScalar(ho * 0.8)} transparent opacity={ho * 0.5} toneMapped={false} />
				</mesh>
				<XoanAmylose f={f} hien={em(mo(f, 0, 1.6 * B))} mau={mau} />
				<NuocBay f={f} a={1.8 * B} b={3.2 * B} />
			</group>
		</group>
	);
};
export const Chu03: React.FC<{f: number}> = ({f}) => (
	<KhoiChu
		f={f}
		mau="#34d399"
		lon={<Cth s="(C6H10O5)_n" />}
		dong={[
			{t: 'trân châu bột năng = tinh bột sắn', at: 0.5 * B, mau: true},
			{t: '+ H₂O, đun nóng → hạt trương nở, dẻo', at: 2 * B, to: true},
			{t: 'đó là HỒ HOÁ tinh bột', at: 2.9 * B},
		]}
		the={[
			{t: 'AMYLOSE · MẠCH XOẮN', mau: '#34d399', at: 1.1 * B},
			{t: 'AMYLOPECTIN · PHÂN NHÁNH', mau: '#a7f3d0', at: 1.1 * B + P},
		]}
	/>
);

// ---------------- 04 SỮA · nhũ tương ----------------
const Micelle: React.FC<{p: [number, number, number]; s: number; sang: number}> = ({p, s, sang}) => {
	const pts = useMemo(() => Array.from({length: 14}, (_, i) => {
		const u = r01(i * 3) * 2 - 1, g = r01(i * 3 + 1) * Math.PI * 2, rr = 0.55 + r01(i * 3 + 2) * 0.3;
		const q = Math.sqrt(1 - u * u);
		return [Math.cos(g) * q * rr, u * rr, Math.sin(g) * q * rr] as [number, number, number];
	}), []);
	return (
		<group position={p} scale={s}>
			{pts.map((q, i) => (
				<mesh key={i} position={q}>
					<sphereGeometry args={[0.42, 14, 10]} />
					<meshPhysicalMaterial color="#e8b986" emissive="#ff9e4a" emissiveIntensity={0.06 + sang * 0.3} roughness={0.4} clearcoat={0.6} />
				</mesh>
			))}
		</group>
	);
};

export const Ba04: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const mau = '#f5e6c8';
	const mang = em(mo(f, 1.2 * B, 2.4 * B));
	const nhanMic = mo(f, 2.5 * B, 3 * B);
	const giot = useMemo(
		() =>
			Array.from({length: 16}, (_, i) => {
				const g = r01(i) * Math.PI * 2, R = 2.6 + r01(i + 20) * 3.2;
				return {p: [Math.cos(g) * R, r01(i + 40) * 4.4 - 2.2, Math.sin(g) * R - 1] as [number, number, number], s: 0.18 + r01(i + 60) * 0.4};
			}),
		[],
	);
	const mic = useMemo(
		() =>
			Array.from({length: 12}, (_, i) => {
				const g = r01(i + 7) * Math.PI * 2, R = 1.65 + r01(i + 90) * 1.4;
				return [Math.cos(g) * R, r01(i + 70) * 3 - 1.5, Math.sin(g) * R] as [number, number, number];
			}),
		[],
	);
	const vo = useMemo(
		() =>
			Array.from({length: 150}, (_, i) => {
				const u = 1 - (2 * (i + 0.5)) / 150, g = i * 2.39996;
				const q = Math.sqrt(1 - u * u);
				return {d: [Math.cos(g) * q, u, Math.sin(g) * q] as [number, number, number], pr: r01(i + 300) > 0.62};
			}),
		[],
	);
	const R = 0.9;
	return (
		<group>
			<QuayQuanh f={f} dai={dai} goc={[0.3, -0.35]} xa={[18, 12.5]} />
			<San f={f} mau={mau} nhip={xung(f, B, 8)} banKinh={2.5} />
			<group position={[0, TAM_Y, 0]} rotation={[0, f * 0.006, 0]}>
				{giot.map((g, i) => (
					<mesh key={i} position={[g.p[0], g.p[1] + Math.sin(f * 0.03 + i) * 0.12, g.p[2]]} scale={g.s}>
						<sphereGeometry args={[1, 32, 24]} />
						<meshPhysicalMaterial color="#e6d3ae" emissive="#f5e6c8" emissiveIntensity={0.02} roughness={0.15} clearcoat={1} transparent opacity={0.8} />
					</mesh>
				))}
				{/* giọt béo chính */}
				<mesh scale={R * (1 + xung(f, P, 4) * 0.02)}>
					<sphereGeometry args={[1, 64, 48]} />
					<meshPhysicalMaterial color="#e9cf9c" emissive="#ffcf70" emissiveIntensity={0.04} roughness={0.1} clearcoat={1} />
				</mesh>
				{vo.map((v, i) => {
					const k = kep(mang * 1.4 - (i / vo.length) * 0.4);
					if (k <= 0) return null;
					const rr = R + 0.06 + (1 - em(k)) * 2.5;
					return (
						<mesh key={'v' + i} position={[v.d[0] * rr, v.d[1] * rr, v.d[2] * rr]} scale={v.pr ? 0.1 : 0.065}>
							<sphereGeometry args={[1, 10, 8]} />
							<meshBasicMaterial color={new THREE.Color(v.pr ? '#ff9e4a' : '#fff1c9').multiplyScalar(0.95)} toneMapped={false} />
						</mesh>
					);
				})}
				{mic.map((p, i) => (
					<Micelle key={'m' + i} p={[p[0], p[1] + Math.sin(f * 0.04 + i * 2) * 0.1, p[2]]} s={0.22 * (1 + nhanMic * 0.25 * xung(f, P, 5))} sang={nhanMic * 0.5} />
				))}
			</group>
		</group>
	);
};
export const Chu04: React.FC<{f: number}> = ({f}) => (
	<KhoiChu
		f={f}
		mau="#f5e6c8"
		coLon={112}
		lon="DẦU / NƯỚC"
		dong={[
			{t: 'sữa = nhũ tương dầu trong nước', at: 0.5 * B, mau: true},
			{t: 'giọt béo có màng lipid–protein bao quanh', at: 1.3 * B},
			{t: 'micelle casein: Ø ~100–200 nm', at: 2.5 * B, to: true},
		]}
		the={[
			{t: 'GIỌT BÉO', mau: '#ffe9b8', at: 0.9 * B},
			{t: 'MÀNG LIPID–PROTEIN', mau: '#ff9e4a', at: 1.4 * B},
			{t: 'MICELLE CASEIN', mau: '#ffd9a8', at: 2.6 * B},
		]}
	/>
);
