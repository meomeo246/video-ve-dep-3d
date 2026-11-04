import React, {useMemo} from 'react';
import * as THREE from 'three';
import {MayQuay} from '../three/MayQuay';
import {San} from '../three/Nen';
import {PhanTuBiQue} from '../three/PhanTu';
import {CAFFEINE} from '../three/duLieu';
import {FONT, glow} from '../Hud';
import {CHUONG, em, emIO, mo, nay, oNhip, xung, PHACH as P, O_NHIP as B, kep} from '../nhip';

const MAU = '#38bdf8';
const TAM_Y = 2.6;
const N = 2600;
const CHAM = oNhip(0) + Math.round(P); // hạt rơi chạm sàn đúng phách 2
const r01 = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};
const TL = 0.85; // tỉ lệ phân tử intro

/** Đám hạt: phun ra từ tâm, xoáy trên sàn, rồi bay về đúng vị trí nguyên tử caffeine. */
const DamHat: React.FC<{f: number}> = ({f}) => {
	const geo = useMemo(() => {
		const a = new Float32Array(N * 3);
		const b = new Float32Array(N * 3);
		const k = new Float32Array(N);
		const c = new Float32Array(N * 3);
		const R: Record<string, number> = {C: 0.34, H: 0.22, N: 0.33, O: 0.33};
		const mau: Record<string, THREE.Color> = {C: new THREE.Color('#9fe7ff'), H: new THREE.Color('#ffffff'), N: new THREE.Color('#5b8cff'), O: new THREE.Color('#ff5a6a')};
		for (let i = 0; i < N; i++) {
			const g = r01(i) * Math.PI * 2;
			const r = Math.pow(r01(i + 1), 0.6) * 3.6;
			a[i * 3] = Math.cos(g) * r;
			a[i * 3 + 1] = r01(i + 2);
			a[i * 3 + 2] = Math.sin(g) * r;
			const at = CAFFEINE.a[i % CAFFEINE.a.length];
			const u = r01(i + 3) * 2 - 1, v = r01(i + 4) * Math.PI * 2, q = Math.sqrt(1 - u * u);
			const rr = R[at.e] * TL * 0.95;
			b[i * 3] = at.p[0] * TL + Math.cos(v) * q * rr;
			b[i * 3 + 1] = at.p[1] * TL + u * rr + TAM_Y;
			b[i * 3 + 2] = at.p[2] * TL + Math.sin(v) * q * rr;
			k[i] = r01(i + 5);
			const cc = r01(i + 6) > 0.8 ? new THREE.Color('#fbbf24') : mau[at.e];
			c.set([cc.r, cc.g, cc.b], i * 3);
		}
		const gg = new THREE.BufferGeometry();
		gg.setAttribute('position', new THREE.BufferAttribute(a, 3));
		gg.setAttribute('aB', new THREE.BufferAttribute(b, 3));
		gg.setAttribute('aK', new THREE.BufferAttribute(k, 1));
		gg.setAttribute('aC', new THREE.BufferAttribute(c, 3));
		return gg;
	}, []);
	const mat = useMemo(
		() =>
			new THREE.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				uniforms: {uT: {value: 0}, uN: {value: 0}, uM: {value: 0}, uA: {value: 1}, uX: {value: 0}},
				vertexShader: /* glsl */ `
				attribute vec3 aB; attribute float aK; attribute vec3 aC;
				uniform float uT; uniform float uN; uniform float uM; uniform float uX;
				varying vec3 vC; varying float vA;
				void main(){
					float r = length(position.xz) * uN;
					float g = atan(position.z, position.x) + uT * (0.5 + 1.6 / (r + 0.6)) + uX * aK * 2.0;
					float h = position.y * (0.2 + 2.4 * uN * (1.0 - r / 4.5)) * (0.4 + 0.6 * sin(uT * 1.7 + aK * 9.0) * 0.5 + 0.3);
					vec3 xo = vec3(cos(g) * r, 0.05 + h + uX * aK * 1.5, sin(g) * r);
					float m = smoothstep(aK * 0.45, aK * 0.45 + 0.55, uM);
					vec3 p = mix(xo, aB, m);
					vec4 mv = modelViewMatrix * vec4(p, 1.0);
					gl_Position = projectionMatrix * mv;
					gl_PointSize = (2.0 + aK * 3.5) * 22.0 / -mv.z * (1.0 + m * 0.6);
					vC = aC; vA = 0.6 + 0.4 * sin(uT * 3.0 + aK * 40.0);
				}`,
				fragmentShader: /* glsl */ `
				uniform float uA; varying vec3 vC; varying float vA;
				void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.2, d);
					gl_FragColor = vec4(vC * a * vA * uA * 1.4, 1.0); }`,
			}),
		[],
	);
	mat.uniforms.uT.value = f / 30;
	mat.uniforms.uN.value = em(mo(f, CHAM, oNhip(2)));
	mat.uniforms.uM.value = emIO(mo(f, oNhip(4), oNhip(5.5)));
	mat.uniforms.uX.value = em(mo(f, oNhip(3.5), oNhip(4.5))) * (1 - mo(f, oNhip(4.5), oNhip(5.5)));
	mat.uniforms.uA.value = (f >= CHAM ? 1 : 0) * (1 - mo(f, oNhip(6), oNhip(6.8)) * 0.85);
	return <points geometry={geo} material={mat} frustumCulled={false} />;
};

export const BaIntro: React.FC<{f: number}> = ({f}) => {
	const roi = mo(f, 0, CHAM);
	const sau = mo(f, oNhip(4), oNhip(6));
	const goc = 0.25 - 0.5 * emIO(mo(f, 0, oNhip(8)));
	const r = 12 + 5 * (1 - emIO(sau));
	const cao = 8.5 - 5.2 * emIO(sau);
	const sanSang = f >= CHAM ? Math.exp(-(f - CHAM) / 10) : 0;
	const lac = xung(f - oNhip(4), B, 6) * (f >= oNhip(4) ? 0.06 : 0) + sanSang * 0.12;
	return (
		<group>
			<MayQuay pos={[Math.sin(goc) * r, cao, Math.cos(goc) * r]} nhin={[0, TAM_Y * 0.55 + sau * 0.8, 0]} fov={36} lac={lac} f={f} />
			<San f={f} mau={MAU} nhip={sanSang + (f >= oNhip(4) ? xung(f - oNhip(4), B, 8) * 0.7 : 0)} banKinh={3.2} />
			{f < CHAM + 2 ? (
				<mesh position={[0, 9 - 9 * roi * roi + 0.1, 0]}>
					<sphereGeometry args={[0.12, 20, 16]} />
					<meshBasicMaterial color={new THREE.Color('#bff4ff').multiplyScalar(3)} toneMapped={false} />
				</mesh>
			) : null}
			<DamHat f={f} />
			<group position={[0, TAM_Y, 0]} rotation={[0, f * 0.01 - 0.6, 0]}>
				<PhanTuBiQue pt={CAFFEINE} hien={em(mo(f, oNhip(5.5), oNhip(6.5)))} tiLe={TL} sang={0.08 + xung(f, B, 6) * 0.12} ep={{mau: '#38bdf8', k: 0.45}} />
			</group>
		</group>
	);
};

/** Chữ "O" thành vòng sáng (kiểu mẫu), có chấm của Ọ. */
const VongO: React.FC<{k: number}> = ({k}) => (
	<span style={{display: 'inline-block', position: 'relative', width: '0.78em', height: '0.78em', margin: '0 0.04em', verticalAlign: '-0.02em'}}>
		<span
			style={{
				position: 'absolute',
				inset: 0,
				borderRadius: '50%',
				border: '0.14em solid #ffcf5a',
				boxShadow: `${glow('#ffb020', 22)}, inset 0 0 20px #ffb02088`,
				transform: `rotate(${k * 200}deg) scale(${nay(k)})`,
				borderTopColor: '#fff3c4',
			}}
		/>
		<span style={{position: 'absolute', left: '50%', bottom: '-0.3em', width: '0.16em', height: '0.16em', marginLeft: '-0.08em', borderRadius: '50%', background: '#fff', boxShadow: glow('#ffb020', 10)}} />
	</span>
);

const Chu: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) =>
	k <= 0 ? null : (
		<span style={{display: 'inline-block', transform: `scale(${nay(k)}) translateY(${(1 - kep(k * 1.5)) * 30}px)`, filter: `blur(${(1 - kep(k * 2)) * 10}px)`, opacity: kep(k * 3)}}>{children}</span>
	);

export const ChuIntro: React.FC<{f: number}> = ({f}) => {
	const k = (a: number) => mo(f, a, a + 9);
	const moc = oNhip(4);
	const hook = em(mo(f, 28, 44)) * (1 - em(mo(f, moc - 10, moc)));
	const tt = {fontSize: 196, fontWeight: 700, lineHeight: '200px', letterSpacing: 4, textShadow: `0 0 30px ${MAU}aa, 0 0 70px ${MAU}55`};
	const phu = em(mo(f, oNhip(6), oNhip(6) + 14));
	const nho = em(mo(f, oNhip(6.5), oNhip(6.5) + 12));
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: '#fff', textAlign: 'center'}}>
			<div style={{position: 'absolute', top: 330, left: 60, right: 60, opacity: hook, transform: `translateY(${(1 - hook) * 30}px)`}}>
				<div style={{fontSize: 40, letterSpacing: 6, opacity: 0.8}}>1 CỐC TRÀ SỮA</div>
				<div style={{fontSize: 74, fontWeight: 700, marginTop: 6, textShadow: glow(MAU, 16)}}>có bao nhiêu bài Hoá?</div>
			</div>
			<div style={{position: 'absolute', top: 730, left: 0, right: 0}}>
				<div style={tt}>
					<Chu k={k(moc)}>VẺ</Chu> <Chu k={k(moc + 2 * P)}>ĐẸP</Chu>
				</div>
				<div style={{...tt, background: 'none'}}>
					<Chu k={k(oNhip(5))}>HOÁ</Chu>{' '}
					<Chu k={k(oNhip(5) + 2 * P)}>
						<span>
							H<VongO k={k(oNhip(5) + 2 * P)} />C
						</span>
					</Chu>
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					top: 1180,
					left: 0,
					right: 0,
					fontSize: 52,
					fontWeight: 700,
					letterSpacing: 12,
					opacity: phu,
					transform: `translateY(${(1 - phu) * 20}px)`,
					background: `linear-gradient(90deg, ${CHUONG.map((c) => c.mau).join(', ')})`,
					WebkitBackgroundClip: 'text',
					color: 'transparent',
				}}
			>
				TRONG 1 CỐC TRÀ SỮA
			</div>
			<div style={{position: 'absolute', top: 1270, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, opacity: nho}}>
				{CHUONG.map((c, i) => {
					const s = mo(f, oNhip(7) + i * (P / 2), oNhip(7) + i * (P / 2) + 6);
					return <div key={i} style={{width: 16, height: 16, borderRadius: 10, background: c.mau, transform: `scale(${nay(s)})`, boxShadow: glow(c.mau, 8)}} />;
				})}
			</div>
		</div>
	);
};
