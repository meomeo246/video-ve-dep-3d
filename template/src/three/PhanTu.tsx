import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import type {PhanTu as TPhanTu} from './duLieu';
import {kep, nay} from '../nhip';

export const MAU_NT: Record<string, string> = {C: '#7d8a99', H: '#e6ecf2', N: '#3d6bff', O: '#ff3b4f'};
const BK: Record<string, number> = {C: 0.34, H: 0.22, N: 0.33, O: 0.33};

/** Bản đồ phản chiếu cho vật liệu bóng (gọi 1 lần trong canvas). */
export const MoiTruong: React.FC = () => {
	const {gl, scene} = useThree();
	useLayoutEffect(() => {
		const pm = new THREE.PMREMGenerator(gl);
		const t = pm.fromScene(new RoomEnvironment(), 0.04);
		scene.environment = t.texture;
		scene.environmentIntensity = 0.3;
		pm.dispose();
		return () => {
			scene.environment = null;
			t.dispose();
		};
	}, [gl, scene]);
	return (
		<>
			<directionalLight position={[6, 10, 8]} intensity={1.1} />
			<directionalLight position={[-8, 3, -6]} intensity={0.5} color="#7fa7ff" />
		</>
	);
};

export const useVatLieuBong = (mau: string, sang = 0.18) =>
	useMemo(() => {
		const c = new THREE.Color(mau);
		return new THREE.MeshPhysicalMaterial({color: c, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.15, emissive: c, emissiveIntensity: sang});
	}, [mau, sang]);

const Y = new THREE.Vector3(0, 1, 0);
const Que: React.FC<{a: THREE.Vector3; b: THREE.Vector3; r: number; mat: THREE.Material; lech?: THREE.Vector3; s?: number}> = ({a, b, r, mat, lech, s = 1}) => {
	const d = new THREE.Vector3().subVectors(b, a);
	const len = d.length() * s;
	const q = new THREE.Quaternion().setFromUnitVectors(Y, d.clone().normalize());
	const m = a.clone().addScaledVector(d.normalize(), len / 2);
	if (lech) m.add(lech);
	return (
		<mesh position={m} quaternion={q} material={mat}>
			<cylinderGeometry args={[r, r, len, 14]} />
		</mesh>
	);
};

/**
 * Phân tử bi–que. `hien` 0..1: nguyên tử lần lượt bật ra theo thứ tự; `rung` lắc nhiệt; `ep` đè màu (vd caramel hoá).
 */
export const PhanTuBiQue: React.FC<{
	pt: TPhanTu;
	hien?: number;
	tiLe?: number;
	sang?: number;
	rung?: number;
	t?: number;
	ep?: {mau: string; k: number};
}> = ({pt, hien = 1, tiLe = 1, sang = 0.06, rung = 0, t = 0, ep}) => {
	const mats = useMemo(() => {
		const r: Record<string, THREE.MeshPhysicalMaterial> = {};
		for (const e of Object.keys(MAU_NT)) {
			const c = new THREE.Color(MAU_NT[e]);
			r[e] = new THREE.MeshPhysicalMaterial({color: c, roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, emissive: c.clone(), emissiveIntensity: 0.18});
		}
		r.que = new THREE.MeshPhysicalMaterial({color: '#9eabba', roughness: 0.35, clearcoat: 0.6, emissive: new THREE.Color('#9eabba'), emissiveIntensity: 0.05});
		return r;
	}, []);
	for (const e of Object.keys(MAU_NT)) {
		const c = new THREE.Color(MAU_NT[e]);
		if (ep) c.lerp(new THREE.Color(ep.mau), ep.k);
		mats[e].color.copy(c);
		mats[e].emissive.copy(c);
		mats[e].emissiveIntensity = sang;
	}
	const N = pt.a.length;
	const pos = pt.a.map((x, i) => {
		const j = rung * (Math.sin(t * 23 + i * 7.1) * 0.5 + Math.sin(t * 31 + i * 3.3) * 0.5);
		return new THREE.Vector3(x.p[0] + j * 0.08, x.p[1] + j * 0.06 * Math.cos(i), x.p[2] + j * 0.07).multiplyScalar(tiLe);
	});
	const kAt = (i: number) => kep(hien * (N + 3) - i, 0, 3) / 3; // mỗi nguyên tử bật trong 3 "bước"
	return (
		<group>
			{pt.a.map((x, i) => {
				const k = kAt(i);
				if (k <= 0) return null;
				const s = nay(k) * BK[x.e] * tiLe;
				return (
					<mesh key={i} position={pos[i]} scale={s} material={mats[x.e]}>
						<sphereGeometry args={[1, 28, 20]} />
					</mesh>
				);
			})}
			{pt.b.map(([i, j, o = 1], k) => {
				const s = Math.min(kAt(i), kAt(j));
				if (s <= 0) return null;
				const a = pos[i], b = pos[j];
				if (o === 1) return <Que key={k} a={a} b={b} r={0.075 * tiLe} mat={mats.que} s={s} />;
				const d = new THREE.Vector3().subVectors(b, a).normalize();
				const n = new THREE.Vector3(0, 0, 1).cross(d).normalize().multiplyScalar(0.085 * tiLe);
				return (
					<group key={k}>
						<Que a={a} b={b} r={0.055 * tiLe} mat={mats.que} lech={n} s={s} />
						<Que a={a} b={b} r={0.055 * tiLe} mat={mats.que} lech={n.clone().negate()} s={s} />
					</group>
				);
			})}
		</group>
	);
};
