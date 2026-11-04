import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {San} from '../three/Nen';
import {QuayQuanh} from './Ch01Ch02';
import {BANG} from '../three/duLieu';
import {KhoiChu, Cth} from '../Chu';
import {em, mo, xung, kep, O_NHIP as B, PHACH as P} from '../nhip';

const TAM_Y = 2.05;
const S = 0.24; // tỉ lệ mạng
const r01 = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const Y = new THREE.Vector3(0, 1, 0);

// O trung tâm có đủ 4 liên kết, gần tâm nhất -> để khoanh tứ diện
const TAM_O = (() => {
	const deg = new Array(BANG.O.length).fill(0);
	for (const [i, j] of BANG.bond) (deg[i]++, deg[j]++);
	let best = 0, d0 = 1e9;
	BANG.O.forEach((p, i) => {
		const d = Math.hypot(...p);
		if (deg[i] === 4 && d < d0) (d0 = d), (best = i);
	});
	return best;
})();

export const Ba06: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const mau = '#67e8f9';
	const ymin = Math.min(...BANG.O.map((p) => p[1]));
	const ymax = Math.max(...BANG.O.map((p) => p[1]));
	const lap = (y: number) => kep((em(mo(f, 0, 1.3 * B)) * 1.3 - (y - ymin) / (ymax - ymin + 1e-6) * 0.3) * 1.0); // lắp dần từ dưới lên
	const tan = em(mo(f, 2.9 * B, dai));
	const nhan = mo(f, 1.6 * B, 2.1 * B) * (1 - tan);

	const oRef = useRef<THREE.InstancedMesh>(null);
	const hRef = useRef<THREE.InstancedMesh>(null);
	const qRef = useRef<THREE.InstancedMesh>(null);
	const lRef = useRef<THREE.LineSegments>(null);
	const lnRef = useRef<THREE.LineSegments>(null);
	const lk = useMemo(() => BANG.H.filter((h) => h.q >= 0), []);
	const hbGeo = useMemo(() => new THREE.BufferGeometry(), []);
	const hbMat = useMemo(() => new THREE.LineDashedMaterial({color: new THREE.Color(mau).multiplyScalar(1.6), dashSize: 0.05, gapSize: 0.035, transparent: true, toneMapped: false, linewidth: 2}), []);
	const hbNhan = useMemo(() => new THREE.BufferGeometry(), []);

	// vị trí sau khi rung/tan
	const pO = BANG.O.map((p, i) => {
		const k = lap(p[1]);
		const j = tan * 1.6;
		const t = f * 0.05;
		return new THREE.Vector3(
			(p[0] + Math.sin(t * 3 + i) * 0.08 * tan + (r01(i) - 0.5) * j) * S,
			(p[1] + (1 - k) * 3 + Math.cos(t * 2.6 + i) * 0.08 * tan - j * r01(i + 9) * 0.6) * S,
			(p[2] + Math.sin(t * 2.1 + i * 2) * 0.08 * tan + (r01(i + 5) - 0.5) * j) * S,
		);
	});
	const pH = BANG.H.map((h) => {
		const o = BANG.O[h.o];
		return new THREE.Vector3(h.p[0] - o[0], h.p[1] - o[1], h.p[2] - o[2]).multiplyScalar(S).add(pO[h.o]);
	});

	useLayoutEffect(() => {
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const sc = new THREE.Vector3();
		BANG.O.forEach((p, i) => {
			const k = lap(p[1]);
			const s = 0.2 * S * 2 * kep(k * 1.5) * (i === TAM_O ? 1 + nhan * 0.35 : 1);
			m.compose(pO[i], q.identity(), sc.set(s, s, s));
			oRef.current!.setMatrixAt(i, m);
			oRef.current!.setColorAt(i, new THREE.Color(i === TAM_O && nhan > 0 ? '#ffd0d0' : '#ff3b4f'));
		});
		BANG.H.forEach((h, i) => {
			const k = lap(BANG.O[h.o][1]);
			const s = 0.11 * S * 2 * kep(k * 1.5);
			m.compose(pH[i], q.identity(), sc.set(s, s, s));
			hRef.current!.setMatrixAt(i, m);
			const a = pO[h.o], b = pH[i];
			const d = new THREE.Vector3().subVectors(b, a);
			q.setFromUnitVectors(Y, d.clone().normalize());
			const c = a.clone().addScaledVector(d, 0.5);
			m.compose(c, q, sc.set(0.05 * S * 2 * kep(k * 1.5), d.length(), 0.05 * S * 2 * kep(k * 1.5)));
			qRef.current!.setMatrixAt(i, m);
		});
		oRef.current!.instanceMatrix.needsUpdate = true;
		if (oRef.current!.instanceColor) oRef.current!.instanceColor.needsUpdate = true;
		hRef.current!.instanceMatrix.needsUpdate = true;
		qRef.current!.instanceMatrix.needsUpdate = true;
		// liên kết hydrogen: H -> O của phân tử bên cạnh
		const v: number[] = [];
		const vn: number[] = [];
		BANG.H.forEach((h, i) => {
			if (h.q < 0) return;
			const k = Math.min(lap(BANG.O[h.o][1]), lap(BANG.O[h.q][1]));
			if (k < 0.98) return;
			const a = pH[i], b = pO[h.q];
			const arr = h.o === TAM_O || h.q === TAM_O ? vn : v;
			arr.push(a.x, a.y, a.z, b.x, b.y, b.z);
		});
		hbGeo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
		hbNhan.setAttribute('position', new THREE.Float32BufferAttribute(vn, 3));
		hbGeo.computeBoundingSphere();
		hbNhan.computeBoundingSphere();
		lRef.current?.computeLineDistances();
		lnRef.current?.computeLineDistances();
	});
	hbMat.opacity = 0.9 * (1 - tan);
	return (
		<group>
			<QuayQuanh f={f} dai={dai} goc={[-0.15, 0.15]} xa={[15, 12]} cao={[3.4, 2.9]} />
			<San f={f} mau={mau} nhip={xung(f, B, 8)} banKinh={2.8} />
			<group position={[0, TAM_Y, 0]} rotation={[0.12 + Math.sin(f * 0.02) * 0.06, -0.25 + f * 0.004, 0]}>
			<group rotation={[Math.PI / 2 - 0.2, 0, f * 0.003]}>
				<instancedMesh ref={oRef} args={[undefined, undefined, BANG.O.length]} frustumCulled={false}>
					<sphereGeometry args={[1, 20, 14]} />
					<meshPhysicalMaterial roughness={0.25} clearcoat={1} emissive="#ff3b4f" emissiveIntensity={0.06} />
				</instancedMesh>
				<instancedMesh ref={hRef} args={[undefined, undefined, BANG.H.length]} frustumCulled={false}>
					<sphereGeometry args={[1, 14, 10]} />
					<meshPhysicalMaterial color="#dfe6ee" roughness={0.25} clearcoat={1} emissive="#ffffff" emissiveIntensity={0.04} />
				</instancedMesh>
				<instancedMesh ref={qRef} args={[undefined, undefined, BANG.H.length]} frustumCulled={false}>
					<cylinderGeometry args={[1, 1, 1, 8]} />
					<meshStandardMaterial color="#9eabba" emissive="#9eabba" emissiveIntensity={0.04} />
				</instancedMesh>
				<lineSegments ref={lRef} geometry={hbGeo} material={hbMat} frustumCulled={false} />
				<lineSegments ref={lnRef} geometry={hbNhan} frustumCulled={false}>
					<lineDashedMaterial color={new THREE.Color('#ffffff').multiplyScalar(2.5 * nhan + 0.0001)} dashSize={0.07} gapSize={0.04} transparent opacity={nhan} toneMapped={false} />
				</lineSegments>
			</group>
			</group>
		</group>
	);
};

export const Chu06: React.FC<{f: number}> = ({f}) => (
	<KhoiChu
		f={f}
		mau="#67e8f9"
		lon={<Cth s="H2O · ĐÁ Ih" />}
		coLon={118}
		dong={[
			{t: 'mạng tinh thể lục giác', at: 0.5 * B, mau: true},
			{t: 'mỗi phân tử: 4 liên kết hydrogen (tứ diện)', at: 1.6 * B, to: true},
			{t: 'tan ở 0 °C: ΔH ≈ +6,01 kJ/mol (thu nhiệt)', at: 2.9 * B},
			{t: 'khối lượng riêng 0,917 g/cm³ < nước → đá nổi', at: 3.3 * B},
		]}
		the={[
			{t: 'O', mau: '#ff4757', at: 0.8 * B},
			{t: 'H', mau: '#ffffff', at: 0.8 * B + P * 0.5},
			{t: '··· LIÊN KẾT HYDROGEN', mau: '#67e8f9', at: 1.2 * B},
		]}
	/>
);
