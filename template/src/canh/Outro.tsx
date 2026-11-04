import React, {useMemo} from 'react';
import * as THREE from 'three';
import {MayQuay} from '../three/MayQuay';
import {San} from '../three/Nen';
import {CocThuyTinh, NuocDoiMau, COC, rTrong} from '../three/Coc';
import {FONT, LE, glow} from '../Hud';
import {CHUONG, em, emIO, mo, nay, xung, PHACH as P, O_NHIP as B} from '../nhip';

const r01 = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const MUC = 2.75;

export const BaOutro: React.FC<{f: number; dai: number}> = ({f, dai}) => {
	const tc = useMemo(() => {
		const a: [number, number, number][] = [];
		let i = 0;
		for (let lop = 0; lop < 3; lop++)
			for (let k = 0; k < 11 - lop * 2; k++, i++) {
				const g = (k / (11 - lop * 2)) * Math.PI * 2 + lop * 0.4;
				const r = (rTrong(COC.day + 0.2 + lop * 0.3) - 0.22) * (0.35 + 0.65 * r01(i));
				a.push([Math.cos(g) * r, COC.day + 0.2 + lop * 0.3, Math.sin(g) * r]);
			}
		return a;
	}, []);
	const matTc = useMemo(() => new THREE.MeshPhysicalMaterial({color: '#140a06', roughness: 0.1, clearcoat: 1, emissive: new THREE.Color('#3a1c0c'), emissiveIntensity: 0.3}), []);
	const p = emIO(f / dai);
	const g = -0.4 + 0.8 * p;
	const r = 19 - 2 * p;
	const hien = em(mo(f, 0, 0.8 * B));
	return (
		<group>
			<MayQuay pos={[Math.sin(g) * r, 4.8, Math.cos(g) * r]} nhin={[0, 0.9, 0]} fov={33} lac={xung(f, B, 6) * 0.04} f={f} />
			<San f={f} mau="#e6b07a" nhip={xung(f, B, 8)} banKinh={2.4} />
			<group position={[0, 1.15, 0]} scale={0.62 * (0.7 + 0.3 * hien)}>
				<NuocDoiMau muc={MUC} front={0} mauTren="#c99063" mauDuoi="#c99063" t={f / 30} vach={0} />
				{tc.map((q, i) => (
					<mesh key={i} position={q} material={matTc}>
						<sphereGeometry args={[0.2, 24, 18]} />
					</mesh>
				))}
				<CocThuyTinh />
				{/* ống hút */}
				<mesh position={[0.35, 3.0, 0.1]} rotation={[0.1, 0, -0.2]}>
					<cylinderGeometry args={[0.13, 0.13, 4.2, 24, 1, true]} />
					<meshBasicMaterial color={new THREE.Color('#ff7ab6').multiplyScalar(1.2)} transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} />
				</mesh>
				{/* 6 quỹ đạo màu chương */}
				{CHUONG.map((c, i) => {
					const k = mo(f, i * (P / 2), i * (P / 2) + 10);
					if (k <= 0) return null;
					const nghieng: [number, number, number] = [Math.PI / 2 + (i - 2.5) * 0.28, (i * Math.PI) / 6, 0];
					const R = 2.9 + i * 0.12;
					const a = f * (0.035 + i * 0.004) + i;
					const mau = new THREE.Color(c.mau);
					return (
						<group key={i} rotation={nghieng} position={[0, 1.7, 0]} scale={nay(k)}>
							<mesh>
								<torusGeometry args={[R, 0.012, 8, 160]} />
								<meshBasicMaterial color={mau.clone().multiplyScalar(1.2)} toneMapped={false} transparent opacity={0.75} />
							</mesh>
							<mesh position={[Math.cos(a) * R, Math.sin(a) * R, 0]}>
								<sphereGeometry args={[0.13, 16, 12]} />
								<meshBasicMaterial color={mau.clone().multiplyScalar(2.4)} toneMapped={false} />
							</mesh>
						</group>
					);
				})}
			</group>
		</group>
	);
};

const SGK: [string, string][] = [
	['Trà · caffeine', 'Hoá 11 · Bài 12'],
	['Đường đen · saccharose', 'Hoá 12 · Bài 5'],
	['Trân châu · tinh bột', 'Hoá 12 · Bài 6'],
	['Sữa · lipid, protein', 'Hoá 12 · Bài 1, 10'],
	['Đậu biếc · pH', 'Hoá 11 · Bài 2'],
	['Đá · liên kết hydrogen', 'Hoá 10 · Bài 13'],
];

export const ChuOutro: React.FC<{f: number}> = ({f}) => {
	const v = (a: number) => em(mo(f, a, a + 10));
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: '#fff'}}>
			<div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', opacity: v(0), transform: `scale(${0.9 + 0.1 * v(0)})`}}>
				<div style={{fontSize: 104, fontWeight: 700, lineHeight: '110px', textShadow: glow('#e6b07a', 22)}}>6 GÓC HOÁ HỌC</div>
				<div
					style={{
						fontSize: 50,
						fontWeight: 700,
						letterSpacing: 10,
						marginTop: 10,
						background: `linear-gradient(90deg, ${CHUONG.map((c) => c.mau).join(', ')})`,
						WebkitBackgroundClip: 'text',
						color: 'transparent',
					}}
				>
					TRONG 1 CỐC TRÀ SỮA
				</div>
			</div>
			<div style={{position: 'absolute', top: 1010, left: LE, right: LE}}>
				{SGK.map(([a, b], i) => {
					const k = v(0.6 * B + i * P * 0.75);
					const c = CHUONG[i].mau;
					return (
						<div
							key={i}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 18,
								height: 62,
								borderBottom: '1px solid rgba(255,255,255,0.1)',
								opacity: k,
								transform: `translateX(${(1 - k) * -40}px)`,
							}}
						>
							<div style={{width: 46, fontSize: 24, fontWeight: 700, color: '#05070f', background: c, borderRadius: 20, textAlign: 'center', boxShadow: glow(c, 6)}}>{CHUONG[i].so}</div>
							<div style={{flex: 1, fontSize: 31, fontWeight: 700}}>{a}</div>
							<div style={{fontSize: 27, color: c, textShadow: glow(c, 6)}}>{b}</div>
						</div>
					);
				})}
				<div style={{marginTop: 14, fontSize: 21, letterSpacing: 2, opacity: v(2.6 * B) * 0.55}}>SGK Hoá học · Kết nối tri thức với cuộc sống</div>
			</div>
		</div>
	);
};
