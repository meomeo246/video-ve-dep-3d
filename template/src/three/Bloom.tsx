import {useEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useFrame, useThree} from '@react-three/fiber';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';

/** Hậu kỳ phát sáng: chiếm vòng render của R3F (priority 1). */
export const Bloom: React.FC<{strength?: number; radius?: number; threshold?: number}> = ({strength = 0.9, radius = 0.55, threshold = 0.55}) => {
	const {gl, scene, camera, size} = useThree();
	const k = useMemo(() => {
		const c = new EffectComposer(gl);
		c.setPixelRatio(1);
		c.setSize(size.width, size.height);
		const rp = new RenderPass(scene, camera);
		const bp = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), strength, radius, threshold);
		c.addPass(rp);
		c.addPass(bp);
		c.addPass(new OutputPass());
		return {c, rp, bp};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gl, scene, size.width, size.height]);
	useEffect(() => () => k.c.dispose(), [k]);
	useFrame((state) => {
		k.rp.camera = state.camera;
		k.bp.strength = strength;
		k.bp.radius = radius;
		k.bp.threshold = threshold;
		k.c.render();
	}, 1);
	return null;
};
