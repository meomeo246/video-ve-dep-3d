import React, {useMemo} from 'react';
import * as THREE from 'three';
import {MayQuay} from '../three/MayQuay';
import {San} from '../three/Nen';
import {PhanTuBiQue} from '../three/PhanTu';
import {CAFFEINE, SACCHAROSE} from '../three/duLieu';
import {KhoiChu, Cth} from '../Chu';
import {em, emIO, mo, xung, O_NHIP as B, PHACH as P, kep} from '../nhip';
import {MAU_NT} from '../three/PhanTu';

const TAM_Y = 2.3;

/** Máy quay xoay quanh tâm sân khấu. */
export const QuayQuanh: React.FC<{f: number; dai: number; xa?: [number, number]; goc?: [number, number]; cao?: [number, number]; nhin?: number; lac?: number}> = ({
	f,
	dai,
	xa = [17, 14],
	goc = [-0.5, 0.5],
	cao = [4.5, 3.4],
	nhin = TAM_Y - 0.2,
	lac = 0,
}) => {
	const p = emIO(f / dai);
	const g = goc[0] + (goc[1] - goc[0]) * p;
	const r = xa[0] + (xa[1] - xa[0]) * em(f / dai);
	const y = cao[0] + (cao[1] - cao[0]) * p;
	return <MayQuay pos={[Math.sin(g) * r, y, Math.cos(g) * r]} nhin={[0, nhin, 0]} fov={33} lac={lac + xung(f, B, 6) * 0.05} f={f} />;
};

/** Vòng sáng đánh dấu (khoanh vòng 6 / vòng 5). */
const Khoanh: React.FC<{c: THREE.Vector3; r: number; mau: string; k: number; n?: number}> = ({c, r, mau, k, n = 6}) =>
	k <= 0 ? null : (
		<mesh position={c} scale={0.6 + 0.4 * em(k)}>
			<torusGeometry args={[r, 0.035, 10, n === 6 ? 6 : 5]} />
			<meshBasicMaterial color={new THREE.Color(mau).multiplyScalar(1.8 * kep(k * 2))} toneMapped={false} transparent opacity={kep(k * 2)} />
		</mesh>
	);

const tamVong = (idx: number[]) => {
	const v = new THREE.Vector3();
	for (const i of idx) v.add(new THREE.Vector3(...CAFFEINE.a[i].p));
	return v.multiplyScalar(1 / idx.length);
};

// ---------------- 01 TRÀ · caffeine ----------------
export const Ba01: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const mau = '#fbbf24';
	const vong6 = useMemo(() => tamVong([0, 1, 2, 3, 4, 5]), []);
	const vong5 = useMemo(() => tamVong([3, 4, 6, 7, 8]), []);
	const quay = f * 0.012 + emIO(mo(f, 3 * B, 4 * B)) * 1.2;
	const dap = 1 + xung(f, P, 4) * 0.03;
	return (
		<group>
			<QuayQuanh f={f} dai={dai} goc={[-0.25, 0.35]} />
			<San f={f} mau={mau} nhip={xung(f, B, 8)} banKinh={2.6} />
			<group position={[0, TAM_Y, 0]} rotation={[0.35 + Math.sin(f * 0.02) * 0.1, quay, 0.15]} scale={0.62 * dap}>
				<PhanTuBiQue pt={CAFFEINE} hien={1} sang={0.05 + xung(f, B, 6) * 0.12} />
				<Khoanh c={vong6} r={1.0} mau={mau} k={mo(f, 2 * B, 2.5 * B)} n={6} />
				<Khoanh c={vong5} r={0.85} mau={mau} k={mo(f, 2.25 * B, 2.75 * B)} n={5} />
			</group>
		</group>
	);
};
export const Chu01: React.FC<{f: number}> = ({f}) => (
	<KhoiChu
		f={f}
		mau="#fbbf24"
		lon={<Cth s="C8H10N4O2" />}
		dong={[
			{t: 'CAFFEINE · M = 194,19 g/mol', at: 0.5 * B, mau: true},
			{t: 'có trong lá trà, hạt cà phê', at: 1.2 * B},
			{t: 'khung purine: vòng 6 + vòng 5 ngưng tụ', at: 2 * B},
		]}
		the={(['C', 'H', 'N', 'O'] as const).map((e, i) => ({t: e, mau: MAU_NT[e], at: 1 * B + i * P * 0.5}))}
	/>
);

// ---------------- 02 ĐƯỜNG ĐEN · saccharose -> caramel ----------------
const TanLua: React.FC<{f: number; k: number}> = ({f, k}) => {
	const n = 90;
	const seeds = useMemo(() => Array.from({length: n}, (_, i) => [Math.sin(i * 12.9898) * 43758.5453 % 1, Math.sin(i * 78.233) * 12345.678 % 1, Math.sin(i * 3.1) * 999.1 % 1].map((v) => Math.abs(v))), []);
	if (k <= 0) return null;
	return (
		<group>
			{seeds.map(([a, b, c], i) => {
				const y = ((c * 6 + f * (0.02 + b * 0.03)) % 6) + 0.1;
				const r = 0.6 + a * 2.6;
				const g = a * 40 + f * 0.01;
				const s = (0.025 + b * 0.04) * (1 - y / 6.5);
				return (
					<mesh key={i} position={[Math.cos(g) * r, y, Math.sin(g) * r]} scale={s * k}>
						<sphereGeometry args={[1, 8, 8]} />
						<meshBasicMaterial color={new THREE.Color(b > 0.6 ? '#ffd27a' : '#ff6a1f').multiplyScalar(2.2)} toneMapped={false} />
					</mesh>
				);
			})}
		</group>
	);
};
export const Ba02: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const nong = mo(f, 2 * B, 3.2 * B);
	const caramel = em(mo(f, 2.6 * B, 4 * B));
	const mau = '#' + new THREE.Color('#fb7a3c').lerp(new THREE.Color('#ff3b1f'), nong).getHexString();
	return (
		<group>
			<QuayQuanh f={f} dai={dai} goc={[0.4, -0.3]} />
			<San f={f} mau={mau} nhip={xung(f, B, 8) + nong * 0.6} banKinh={2.8} />
			<TanLua f={f} k={nong} />
			<group position={[0, TAM_Y, 0]} rotation={[0.5, f * 0.01, -0.1]} scale={0.6 * (1 + xung(f, P, 4) * 0.03)}>
				<PhanTuBiQue pt={SACCHAROSE} hien={em(mo(f, 0, 1.4 * B))} rung={nong} t={f / 30} sang={0.05 + nong * 0.22} ep={{mau: '#8a3d10', k: caramel * 0.85}} />
			</group>
		</group>
	);
};
export const Chu02: React.FC<{f: number}> = ({f}) => {
	const nong = mo(f, 2 * B, 3.2 * B);
	return (
		<>
			<KhoiChu
				f={f}
				mau="#fb7a3c"
				lon={<Cth s="C12H22O11" />}
				dong={[
					{t: 'SACCHAROSE · đường mía', at: 0.5 * B, mau: true},
					{t: 'gồm 1 gốc glucose + 1 gốc fructose', at: 1.2 * B},
					{t: 'đun nóng → CARAMEL HOÁ', at: 2 * B, to: true},
					{t: 'hỗn hợp nhiều chất màu nâu, thơm', at: 2.8 * B},
				]}
				the={[
					{t: 'GLUCOSE · VÒNG 6', mau: '#ffd36b', at: 1.2 * B},
					{t: 'FRUCTOSE · VÒNG 5', mau: '#ff9b6b', at: 1.2 * B + P},
				]}
			/>
			<NhietKe k={nong} at={2 * B} f={f} />
		</>
	);
};

/** Thanh nhiệt độ dọc bên phải (không ghi số cứng). */
const NhietKe: React.FC<{k: number; at: number; f: number}> = ({k, at, f}) => {
	const v = em(mo(f, at - 6, at + 8));
	return (
		<div style={{position: 'absolute', right: 96, top: 700, height: 560, width: 40, opacity: v, fontFamily: 'Bahnschrift, Barlow, sans-serif'}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: 20, border: '2px solid rgba(255,255,255,0.35)'}} />
			<div
				style={{
					position: 'absolute',
					left: 6,
					right: 6,
					bottom: 6,
					height: `${6 + k * 88}%`,
					borderRadius: 14,
					background: 'linear-gradient(0deg, #ff2d1f, #ffb347)',
					boxShadow: '0 0 24px #ff5a1f',
				}}
			/>
			<div style={{position: 'absolute', top: -46, left: -20, width: 80, textAlign: 'center', color: '#ffb347', fontSize: 30, fontWeight: 700}}>t°↑</div>
		</div>
	);
};
