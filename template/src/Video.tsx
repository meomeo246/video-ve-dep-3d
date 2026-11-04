import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Bloom} from './three/Bloom';
import {Bui} from './three/Nen';
import {MoiTruong} from './three/PhanTu';
import {Hud, PhuMan} from './Hud';
import {CHUONG, INTRO, OUTRO_DAU, TONG, batDau, chuongTai, daiChuong, oNhip, O_HET} from './nhip';
import {Ba05, mauPH, phTai} from './canh/Ch05DauBiec';
import {Chu05} from './canh/Chu05';
import {Ba01, Chu01, Ba02, Chu02} from './canh/Ch01Ch02';
import {Ba03, Chu03, Ba04, Chu04} from './canh/Ch03Ch04';
import {Ba06, Chu06} from './canh/Ch06Da';
import {BaIntro, ChuIntro} from './canh/Intro';
import {BaOutro, ChuOutro} from './canh/Outro';

type Canh = {Ba: React.FC<{f: number; dai: number}>; Chu: React.FC<{f: number}>; mau?: (f: number) => string};
const CANH: Canh[] = [
	{Ba: Ba01, Chu: Chu01},
	{Ba: Ba02, Chu: Chu02},
	{Ba: Ba03, Chu: Chu03},
	{Ba: Ba04, Chu: Chu04},
	{Ba: Ba05, Chu: Chu05, mau: (f) => mauPH(phTai(f))},
	{Ba: Ba06, Chu: Chu06},
];

/** `lech`: frame bắt đầu (render thử 1 đoạn). */
export const Video: React.FC<{lech?: number; nhac?: string}> = ({lech = 0, nhac}) => {
	const g = useCurrentFrame() + lech;
	const i = chuongTai(g);
	let noiDung: React.ReactNode;
	let chu: React.ReactNode;
	let mau = '#38bdf8';
	let f = g;
	if (i < 0) {
		noiDung = <BaIntro f={g} />;
		chu = <ChuIntro f={g} />;
	} else if (i >= CHUONG.length) {
		f = g - OUTRO_DAU;
		mau = '#e6b07a';
		noiDung = <BaOutro f={f} dai={TONG - OUTRO_DAU} />;
		chu = <ChuOutro f={f} />;
	} else {
		const C = CANH[i];
		f = g - batDau(i);
		mau = C.mau ? C.mau(f) : CHUONG[i].mau;
		noiDung = <C.Ba f={f} dai={daiChuong(i)} />;
		chu = (
			<>
				<Hud g={g} i={i} mau={mau} />
				<C.Chu f={f} />
			</>
		);
	}
	const amLuong = (x: number) => interpolate(x + lech, [oNhip(O_HET - 1), TONG - 2], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: '#04060d'}}>
			<ThreeCanvas linear={false} width={1080} height={1920} gl={{antialias: true, powerPreference: 'high-performance'}}>
				<color attach="background" args={['#04060d']} />
				<fog attach="fog" args={['#04060d', 18, 46]} />
				<ambientLight intensity={0.25} />
				<MoiTruong />
				<Bui f={g} mau={mau} />
				{noiDung}
				<Bloom strength={0.75} radius={0.5} threshold={0.72} />
			</ThreeCanvas>
			<PhuMan f={i < 0 ? 999 : f} mau={mau} />
			{chu}
			{nhac ? <Audio src={staticFile(nhac)} startFrom={lech} volume={amLuong} /> : null}
		</AbsoluteFill>
	);
};
