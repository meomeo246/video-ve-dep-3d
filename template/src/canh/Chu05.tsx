import React from 'react';
import {FONT, LE, glow} from '../Hud';
import {MOC_PH, mauPH, phTai} from './Ch05DauBiec';
import {em, mo, O_NHIP} from '../nhip';

const so = (v: number, n = 1) => v.toFixed(n).replace('.', ',');
const MU = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const mu = (n: number) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => MU[+d]).join('');

/** Chữ HUD riêng chương 05. */
export const Chu05: React.FC<{f: number}> = ({f}) => {
	const ph = phTai(f);
	const mau = mauPH(ph);
	const e = Math.floor(-ph + 1e-9);
	const h = Math.pow(10, -ph) / Math.pow(10, e);
	const vao = (a: number) => em(mo(f, a, a + 14));
	const chanh = vao(1.5 * O_NHIP);
	const mauChip: [string, string, number][] = [
		['XANH', mauPH(7), 7],
		['TÍM', mauPH(4.2), 4.2],
		['HỒNG', mauPH(2.6), 2.6],
	];
	const x = (p: number) => ((p - 1) / 13) * 100;
	return (
		<div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: '#fff'}}>
			<div style={{position: 'absolute', top: 318, left: LE, opacity: vao(10), transform: `translateY(${(1 - vao(10)) * 30}px)`}}>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
					<span style={{fontSize: 56, fontWeight: 700, color: mau, textShadow: glow(mau, 14)}}>pH</span>
					<span style={{fontSize: 168, fontWeight: 700, lineHeight: '160px', color: '#fff', textShadow: glow(mau, 22)}}>{so(ph)}</span>
				</div>
				<div style={{fontSize: 30, marginTop: 10, color: mau, textShadow: glow(mau, 8)}}>
					[H⁺] ≈ {so(h)}·10{mu(e)} M
				</div>
				<div style={{fontSize: 26, marginTop: 10, opacity: 0.75, letterSpacing: 1}}>anthocyanin đậu biếc · đổi màu theo pH</div>
				<div style={{display: 'flex', gap: 14, marginTop: 26}}>
					{mauChip.map(([t, c, p], i) => {
						const on = ph <= p + 0.25;
						return (
							<div
								key={t}
								style={{
									fontSize: 26,
									fontWeight: 700,
									letterSpacing: 3,
									padding: '6px 20px',
									borderRadius: 30,
									border: `2px solid ${c}`,
									background: on ? c : 'transparent',
									color: on ? '#05070f' : c,
									boxShadow: on ? glow(c, 10) : 'none',
									opacity: i === 0 ? 1 : 0.35 + 0.65 * (on ? 1 : 0),
								}}
							>
								{t}
							</div>
						);
					})}
				</div>
			</div>
			{/* thẻ nước chanh */}
			<div
				style={{
					position: 'absolute',
					top: 700,
					right: LE,
					textAlign: 'right',
					opacity: chanh,
					transform: `translateX(${(1 - chanh) * 40}px)`,
				}}
			>
				<div style={{fontSize: 30, fontWeight: 700, color: '#ffe45c', textShadow: glow('#ffe45c', 10)}}>+ NƯỚC CHANH</div>
				<div style={{fontSize: 24, opacity: 0.8, marginTop: 4}}>axit citric nhả H⁺</div>
			</div>
			{/* thang pH */}
			<div style={{position: 'absolute', top: 1380, left: LE, right: LE, opacity: vao(20)}}>
				<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 20, letterSpacing: 4, opacity: 0.6, marginBottom: 10}}>
					<span>AXIT</span>
					<span>TRUNG TÍNH</span>
					<span>BAZƠ</span>
				</div>
				<div
					style={{
						height: 16,
						borderRadius: 8,
						background: `linear-gradient(90deg, ${MOC_PH.map(([p, c]) => `${c} ${x(p)}%`).join(', ')})`,
						boxShadow: '0 0 18px rgba(255,255,255,0.12)',
					}}
				/>
				<div style={{position: 'absolute', top: 26, left: `${x(ph)}%`, transform: 'translateX(-50%)'}}>
					<div style={{width: 4, height: 34, margin: '0 auto', background: '#fff', boxShadow: glow(mau, 10)}} />
					<div style={{fontSize: 22, fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap', textShadow: glow(mau, 8)}}>{so(ph)}</div>
				</div>
			</div>
		</div>
	);
};
