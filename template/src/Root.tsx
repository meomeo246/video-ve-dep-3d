import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {TONG, batDau, daiChuong} from './nhip';

const NHAC = 've-dep-hoa-hoc.mp3';
export const Root: React.FC = () => (
	<>
		<Composition id="TraSua" component={Video} durationInFrames={TONG} fps={30} width={1080} height={1920} defaultProps={{nhac: NHAC}} />
		<Composition id="Thu05" component={Video} durationInFrames={daiChuong(4)} fps={30} width={1080} height={1920} defaultProps={{lech: batDau(4), nhac: NHAC}} />
	</>
);
