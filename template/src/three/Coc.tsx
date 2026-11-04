import React, {useMemo} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const VERT = /* glsl */ `
varying vec3 vPos; varying vec3 vN; varying vec3 vV;
void main(){
	vPos = position;
	vec4 wp = modelMatrix * vec4(position, 1.0);
	vN = normalize(mat3(modelMatrix) * normal);
	vV = normalize(cameraPosition - wp.xyz);
	gl_Position = projectionMatrix * viewMatrix * wp;
}`;

/** Vật liệu kính neon: trong suốt, viền sáng theo Fresnel. */
export const useKinh = (mau = '#cfe6ff', manh = 1) =>
	useMemo(
		() =>
			new THREE.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				uniforms: {uC: {value: new THREE.Color(mau)}, uM: {value: manh}},
				vertexShader: VERT,
				fragmentShader: /* glsl */ `
				uniform vec3 uC; uniform float uM; varying vec3 vN; varying vec3 vV; varying vec3 vPos;
				void main(){
					float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
					float soc = smoothstep(0.985, 1.0, abs(sin(atan(vPos.z, vPos.x) * 1.0 + 0.9))) * 0.6;
					vec3 c = uC * (0.015 + fr * 0.42 + soc * 0.25) * uM;
					gl_FragColor = vec4(c, 1.0);
				}`,
			}),
		[mau, manh],
	);

/** Bán kính thành trong của cốc theo độ cao. */
export const COC = {day: 0.24, cao: 3.3, rDuoi: 0.84, rTren: 1.06};
export const rTrong = (y: number) => COC.rDuoi + ((COC.rTren - COC.rDuoi) * (y - COC.day)) / (COC.cao - COC.day);

/** Cốc thuỷ tinh cao, có vành sáng. */
export const CocThuyTinh: React.FC<{sang?: number}> = ({sang = 1}) => {
	const {day, cao, rDuoi, rTren} = COC;
	const geo = useMemo(() => {
		const p: THREE.Vector2[] = [];
		p.push(new THREE.Vector2(0, 0));
		p.push(new THREE.Vector2(rDuoi + 0.02, 0));
		p.push(new THREE.Vector2(rDuoi + 0.06, 0.05));
		for (let i = 0; i <= 24; i++) {
			const y = 0.05 + ((cao - 0.05) * i) / 24;
			p.push(new THREE.Vector2(rTrong(Math.max(y, day)) + 0.05, y));
		}
		p.push(new THREE.Vector2(rTren + 0.02, cao + 0.01));
		for (let i = 24; i >= 0; i--) {
			const y = day + ((cao - day) * i) / 24;
			p.push(new THREE.Vector2(rTrong(y), y));
		}
		p.push(new THREE.Vector2(0, day));
		return new THREE.LatheGeometry(p, 96);
	}, [cao, day, rDuoi, rTren]);
	const kinh = useKinh('#bfe3ff', 0.9 * sang);
	return (
		<group>
			<mesh geometry={geo} material={kinh} renderOrder={5} />
			<mesh position={[0, cao + 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
				<torusGeometry args={[rTren + 0.035, 0.018, 12, 128]} />
				<meshBasicMaterial color={new THREE.Color('#dff1ff').multiplyScalar(0.9 * sang)} toneMapped={false} />
			</mesh>
			<mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={6}>
				<torusGeometry args={[rDuoi + 0.05, 0.022, 12, 128]} />
				<meshBasicMaterial color={new THREE.Color('#dff1ff').multiplyScalar(0.6 * sang)} toneMapped={false} />
			</mesh>
		</group>
	);
};

/** Khối nước trong cốc. Màu uB ở dưới, mặt axit uA lan từ trên xuống tới độ cao `front`. */
export const NuocDoiMau: React.FC<{muc: number; front: number; mauTren: string; mauDuoi: string; t: number; vach?: number}> = ({
	muc,
	front,
	mauTren,
	mauDuoi,
	t,
	vach = 1,
}) => {
	const geo = useMemo(() => {
		const p: THREE.Vector2[] = [new THREE.Vector2(0, COC.day + 0.01)];
		for (let i = 0; i <= 30; i++) {
			const y = COC.day + 0.01 + ((muc - COC.day - 0.01) * i) / 30;
			p.push(new THREE.Vector2(rTrong(y) - 0.018, y));
		}
		p.push(new THREE.Vector2(0, muc));
		return new THREE.LatheGeometry(p, 96);
	}, [muc]);
	const mat = useMemo(
		() =>
			new THREE.ShaderMaterial({
				transparent: true,
				uniforms: {
					uA: {value: new THREE.Color()},
					uB: {value: new THREE.Color()},
					uF: {value: 0},
					uT: {value: 0},
					uV: {value: 1},
				},
				vertexShader: VERT,
				fragmentShader: /* glsl */ `
				uniform vec3 uA; uniform vec3 uB; uniform float uF; uniform float uT; uniform float uV;
				varying vec3 vPos; varying vec3 vN; varying vec3 vV;
				void main(){
					float a = atan(vPos.z, vPos.x); float y = vPos.y;
					float n = (sin(a * 3.0 + y * 4.0 - uT * 2.1) + sin(a * 5.0 - y * 2.5 + uT * 1.3)) * 0.22
						+ sin(a * 11.0 + y * 7.0 + uT * 3.0) * 0.08;
					float m = smoothstep(uF - 0.14, uF + 0.14, y + n);
					vec3 c = mix(uB, uA, m);
					float fr = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
					float top = step(0.5, vN.y);
					float sau = 0.55 + 0.45 * smoothstep(0.2, 2.6, y);
					vec3 col = c * (0.5 + 0.2 * fr) * sau + c * fr * 0.7;
					float band = exp(-pow((y + n - uF) / 0.05, 2.0)) * (1.0 - top);
					col += mix(uA, vec3(1.0), 0.25) * band * 1.1 * uV;
					col = mix(col, c * 1.05 + 0.03, top * 0.6);
					gl_FragColor = vec4(col, 0.9);
				}`,
			}),
		[],
	);
	(mat.uniforms.uA.value as THREE.Color).set(mauTren);
	(mat.uniforms.uB.value as THREE.Color).set(mauDuoi);
	mat.uniforms.uF.value = front;
	mat.uniforms.uT.value = t;
	mat.uniforms.uV.value = vach;
	return <mesh geometry={geo} material={mat} renderOrder={2} />;
};

/** Viên đá kính (dùng lại cho cảnh đá). */
export const VienDa: React.FC<{position: [number, number, number]; rotation: [number, number, number]; size?: number; mau?: string}> = ({
	position,
	rotation,
	size = 0.5,
	mau = '#d6f6ff',
}) => {
	const geo = useMemo(() => new RoundedBoxGeometry(size, size, size, 4, size * 0.16), [size]);
	const kinh = useKinh(mau, 1.8);
	return <mesh geometry={geo} material={kinh} position={position} rotation={rotation} renderOrder={4} />;
};
