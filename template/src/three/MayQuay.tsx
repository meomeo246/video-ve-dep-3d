import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';

type V3 = [number, number, number];

/** Máy quay điều khiển thẳng theo frame (không dùng controls). */
export const MayQuay: React.FC<{pos: V3; nhin: V3; fov?: number; lac?: number; f?: number}> = ({pos, nhin, fov = 34, lac = 0, f = 0}) => {
	const {set, size} = useThree();
	const cam = useMemo(() => new THREE.PerspectiveCamera(fov, size.width / size.height, 0.1, 300), []); // eslint-disable-line react-hooks/exhaustive-deps
	useLayoutEffect(() => {
		set({camera: cam});
	}, [cam, set]);
	const lx = Math.sin(f * 2.3) * lac;
	const ly = Math.cos(f * 3.1) * lac;
	cam.fov = fov;
	cam.aspect = size.width / size.height;
	cam.position.set(pos[0] + lx, pos[1] + ly, pos[2]);
	cam.lookAt(nhin[0] + lx * 0.5, nhin[1] + ly * 0.5, nhin[2]);
	cam.updateProjectionMatrix();
	return null;
};
