import React, {useMemo} from 'react';
import * as THREE from 'three';

const ngauNhien = (seed: number) => {
	let s = seed >>> 0;
	return () => {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		return s / 4294967296;
	};
};

/** Bụi sáng bokeh lơ lửng phía sau, trôi lên chậm theo frame. */
export const Bui: React.FC<{f: number; mau: string; n?: number}> = ({f, mau, n = 220}) => {
	const geo = useMemo(() => {
		const r = ngauNhien(7);
		const p = new Float32Array(n * 3);
		const s = new Float32Array(n);
		const k = new Float32Array(n);
		for (let i = 0; i < n; i++) {
			p[i * 3] = (r() - 0.5) * 36;
			p[i * 3 + 1] = r() * 26 - 6;
			p[i * 3 + 2] = -r() * 30 + 4;
			s[i] = 0.4 + Math.pow(r(), 3) * 3.2;
			k[i] = r();
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(p, 3));
		g.setAttribute('aSize', new THREE.BufferAttribute(s, 1));
		g.setAttribute('aK', new THREE.BufferAttribute(k, 1));
		return g;
	}, [n]);
	const mat = useMemo(
		() =>
			new THREE.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				uniforms: {uT: {value: 0}, uC: {value: new THREE.Color()}},
				vertexShader: /* glsl */ `
				attribute float aSize; attribute float aK; uniform float uT; varying float vK; varying float vA;
				void main(){
					vec3 p = position;
					p.y = mod(p.y + 6.0 + uT * (0.15 + aK * 0.35), 26.0) - 6.0;
					p.x += sin(uT * 0.4 + aK * 30.0) * 0.4;
					vec4 mv = modelViewMatrix * vec4(p, 1.0);
					gl_Position = projectionMatrix * mv;
					gl_PointSize = aSize * 260.0 / -mv.z;
					vK = aK;
					vA = 0.35 + 0.65 * (0.5 + 0.5 * sin(uT * (1.0 + aK * 2.0) + aK * 50.0));
				}`,
				fragmentShader: /* glsl */ `
				uniform vec3 uC; varying float vK; varying float vA;
				void main(){
					float d = length(gl_PointCoord - 0.5) * 2.0;
					float a = smoothstep(1.0, 0.0, d);
					a = a * a;
					vec3 c = mix(uC, vec3(1.0), step(0.82, vK) * 0.6);
					gl_FragColor = vec4(c * a * vA * 0.55, 1.0);
				}`,
			}),
		[],
	);
	mat.uniforms.uT.value = f / 30;
	(mat.uniforms.uC.value as THREE.Color).set(mau);
	return <points geometry={geo} material={mat} frustumCulled={false} />;
};

/** Lưới sàn neon mờ dần ra xa + bệ tròn phát sáng dưới vật. */
export const San: React.FC<{f: number; mau: string; nhip?: number; banKinh?: number}> = ({f, mau, nhip = 0, banKinh = 2}) => {
	const luoi = useMemo(
		() =>
			new THREE.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				uniforms: {uC: {value: new THREE.Color()}, uT: {value: 0}},
				vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
				fragmentShader: /* glsl */ `
				uniform vec3 uC; uniform float uT; varying vec2 vP;
				float line(float x, float w){ float d = abs(fract(x) - 0.5); return smoothstep(w, 0.0, 0.5 - d); }
				void main(){
					vec2 g = vP / 1.2;
					float l = max(line(g.x, 0.035), line(g.y, 0.035));
					float r = length(vP);
					float fade = smoothstep(26.0, 3.0, r);
					gl_FragColor = vec4(uC * l * fade * 0.32, 1.0);
				}`,
			}),
		[],
	);
	const be = useMemo(
		() =>
			new THREE.ShaderMaterial({
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				uniforms: {uC: {value: new THREE.Color()}, uT: {value: 0}, uN: {value: 0}, uR: {value: 2}},
				vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
				fragmentShader: /* glsl */ `
				uniform vec3 uC; uniform float uT; uniform float uN; uniform float uR; varying vec2 vP;
				float ring(float r, float at, float w){ return exp(-pow((r - at) / w, 2.0)); }
				void main(){
					float r = length(vP) / uR; float a = atan(vP.y, vP.x);
					float c = ring(r, 0.62, 0.012) * 1.6 + ring(r, 0.8, 0.008) * 1.1 + ring(r, 1.0, 0.02) * 0.9;
					float dash = step(0.5, fract(a * 9.549 + uT * 0.25));
					c += ring(r, 0.9, 0.012) * dash * 1.2;
					float tick = step(0.92, fract(a * 19.1 - uT * 0.1)) * ring(r, 1.12, 0.03);
					c += tick * 0.8;
					c += smoothstep(0.75, 0.0, r) * 0.18;
					c += ring(r, 0.62 + uN * 0.5, 0.03) * uN * 1.4;
					gl_FragColor = vec4(uC * c, 1.0);
				}`,
			}),
		[],
	);
	(luoi.uniforms.uC.value as THREE.Color).set(mau);
	(be.uniforms.uC.value as THREE.Color).set(mau);
	be.uniforms.uT.value = f / 30;
	be.uniforms.uN.value = nhip;
	be.uniforms.uR.value = banKinh;
	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={luoi}>
				<planeGeometry args={[60, 60]} />
			</mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} material={be}>
				<planeGeometry args={[banKinh * 2.6, banKinh * 2.6]} />
			</mesh>
		</group>
	);
};
