import React from 'react';
import {CHUONG, TONG, batDau, em, mo, xung, O_NHIP} from './nhip';

export const FONT = 'Bahnschrift, Barlow, "Segoe UI", Arial, sans-serif';
export const LE = 64; // lề trái/phải
export const glow = (mau: string, r = 18) => `0 0 ${r}px ${mau}, 0 0 ${r * 2.2}px ${mau}66`;

const hexA = (hex: string, a: number) => hex + Math.round(a * 255).toString(16).padStart(2, '0');

/** Khung HUD chung: badge chương, tiêu đề, chấm tiến độ, thanh thời gian. */
export const Hud: React.FC<{g: number; i: number; mau: string}> = ({g, i, mau}) => {
	const c = CHUONG[i];
	const f = g - batDau(i);
	const vao = em(mo(f, 2, 16));
	const vaoTen = em(mo(f, 6, 22));
	const nhay = xung(f, O_NHIP, 6);
	const tienDo = g / TONG;
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: '#fff'}}>
			{/* góc trên trái */}
			<div style={{position: 'absolute', top: 150, left: LE, display: 'flex', alignItems: 'center', gap: 16, opacity: vao, transform: `translateX(${(1 - vao) * -30}px)`}}>
				<div style={{background: mau, color: '#05070f', fontWeight: 700, fontSize: 26, padding: '4px 16px', borderRadius: 30, boxShadow: glow(mau, 10)}}>{c.so}</div>
				<div style={{fontSize: 22, letterSpacing: 5, opacity: 0.78}}>— {c.chuDe}</div>
			</div>
			<div style={{position: 'absolute', top: 202, left: LE, display: 'flex', alignItems: 'center', gap: 22}}>
				<div style={{width: 8, height: 70 * vaoTen, background: mau, borderRadius: 4, boxShadow: glow(mau, 12 + nhay * 10)}} />
				<div style={{overflow: 'hidden', paddingTop: 16, marginTop: -16}}>
					<div
						style={{
							fontSize: 74,
							fontWeight: 700,
							letterSpacing: 2,
							lineHeight: '84px',
							transform: `translateY(${(1 - vaoTen) * 90}px)`,
							textShadow: `0 0 24px ${hexA(mau, 0.55)}`,
						}}
					>
						{c.ten}
					</div>
				</div>
			</div>
			{/* góc trên phải */}
			<div style={{position: 'absolute', top: 152, right: LE, textAlign: 'right'}}>
				<div style={{fontSize: 19, letterSpacing: 5, opacity: 0.7}}>HOÁ HỌC TRÀ SỮA</div>
				<div style={{display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12}}>
					{CHUONG.map((k, j) => {
						const on = j === i;
						return (
							<div
								key={j}
								style={{
									width: on ? 16 : 11,
									height: on ? 16 : 11,
									marginTop: on ? 0 : 2.5,
									borderRadius: 20,
									background: j < i ? hexA(k.mau, 0.55) : on ? mau : 'rgba(255,255,255,0.18)',
									boxShadow: on ? glow(mau, 8 + nhay * 8) : 'none',
								}}
							/>
						);
					})}
				</div>
			</div>
			{/* khung ngắm 4 góc quanh sân khấu */}
			{[
				[0, 0],
				[1, 0],
				[0, 1],
				[1, 1],
			].map(([px, py], j) => (
				<div
					key={'k' + j}
					style={{
						position: 'absolute',
						top: py ? undefined : 660,
						bottom: py ? 1920 - 1350 : undefined,
						left: px ? undefined : LE + 30,
						right: px ? LE + 30 : undefined,
						width: 54,
						height: 54,
						borderColor: hexA(mau, 0.5 + nhay * 0.4),
						borderStyle: 'solid',
						borderWidth: 0,
						[py ? 'borderBottomWidth' : 'borderTopWidth']: 3,
						[px ? 'borderRightWidth' : 'borderLeftWidth']: 3,
						opacity: vao,
						transform: `scale(${1 + nhay * 0.06})`,
					}}
				/>
			))}
			{/* thanh thời gian */}
			<div style={{position: 'absolute', top: 1520, left: LE, right: LE, height: 3, background: 'rgba(255,255,255,0.12)'}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${tienDo * 100}%`, background: mau, boxShadow: glow(mau, 8)}} />
				<div
					style={{
						position: 'absolute',
						top: -5,
						left: `calc(${tienDo * 100}% - 6px)`,
						width: 12,
						height: 12,
						borderRadius: 10,
						background: '#fff',
						boxShadow: glow(mau, 10),
					}}
				/>
				{CHUONG.map((_, j) => (
					<div key={j} style={{position: 'absolute', top: -8, left: `${(batDau(j) / TONG) * 100}%`, width: 2, height: 18, background: 'rgba(255,255,255,0.35)'}} />
				))}
			</div>
			<div style={{position: 'absolute', top: 1540, left: LE, right: LE, display: 'flex', justifyContent: 'space-between', fontSize: 19, letterSpacing: 4, opacity: 0.5}}>
				<span>VẺ ĐẸP HOÁ HỌC</span>
				<span>
					{c.so} / {String(CHUONG.length).padStart(2, '0')}
				</span>
			</div>
		</div>
	);
};

/** Lớp phủ: vignette + chớp sáng đầu chương. */
export const PhuMan: React.FC<{f: number; mau: string}> = ({f, mau}) => {
	const chop = f >= 0 && f < 8 ? Math.exp(-f / 2.2) : 0;
	return (
		<>
			<div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 60% at 50% 52%, transparent 40%, rgba(2,3,10,0.78) 100%)'}} />
			<div style={{position: 'absolute', inset: 0, background: mau, opacity: chop * 0.35, mixBlendMode: 'screen'}} />
		</>
	);
};
