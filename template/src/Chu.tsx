import React from 'react';
import {FONT, LE, glow} from './Hud';
import {em, mo} from './nhip';

/** "C8H10N4O2" -> chỉ số dưới; "^+" -> chỉ số trên. */
export const Cth: React.FC<{s: string}> = ({s}) => {
	const out: React.ReactNode[] = [];
	const re = /(\d+|\^[^ ]+|_[a-z]|[^\d^_]+)/g;
	let m: RegExpExecArray | null;
	let k = 0;
	while ((m = re.exec(s))) {
		const t = m[0];
		const prev = out.length ? s[m.index - 1] : '';
		if (/^\d+$/.test(t) && prev && /[A-Za-z)\]]/.test(prev))
			out.push(<span key={k++} style={{fontSize: '0.58em', verticalAlign: '-0.22em'}}>{t}</span>);
		else if (t[0] === '^') out.push(<span key={k++} style={{fontSize: '0.58em', verticalAlign: '0.55em'}}>{t.slice(1)}</span>);
		else if (t[0] === '_') out.push(<span key={k++} style={{fontSize: '0.58em', verticalAlign: '-0.22em'}}>{t.slice(1)}</span>);
		else out.push(<React.Fragment key={k++}>{t}</React.Fragment>);
	}
	return <>{out}</>;
};

export type Dong = {t: React.ReactNode; at: number; mau?: boolean; to?: boolean};
export type The = {t: string; mau: string; at: number};

/** Khối chữ trái trên: công thức lớn + các dòng hiện dần theo frame. */
export const KhoiChu: React.FC<{f: number; mau: string; lon: React.ReactNode; lonAt?: number; dong: Dong[]; the?: The[]; coLon?: number}> = ({
	f,
	mau,
	lon,
	lonAt = 6,
	dong,
	the,
	coLon = 132,
}) => {
	const v = (a: number) => em(mo(f, a, a + 12));
	return (
		<div style={{position: 'absolute', top: 318, left: LE, right: LE, fontFamily: FONT, color: '#fff'}}>
			<div
				style={{
					fontSize: coLon,
					fontWeight: 700,
					lineHeight: `${coLon * 1.05}px`,
					opacity: v(lonAt),
					transform: `translateY(${(1 - v(lonAt)) * 40}px)`,
					textShadow: glow(mau, 20),
					whiteSpace: 'nowrap',
				}}
			>
				{lon}
			</div>
			{dong.map((d, i) => (
				<div
					key={i}
					style={{
						fontSize: d.to ? 34 : 27,
						fontWeight: d.to ? 700 : 400,
						marginTop: i === 0 ? 14 : 8,
						color: d.mau ? mau : '#fff',
						opacity: v(d.at) * (d.mau || d.to ? 1 : 0.82),
						transform: `translateX(${(1 - v(d.at)) * -24}px)`,
						textShadow: d.mau ? glow(mau, 8) : 'none',
						letterSpacing: 0.5,
					}}
				>
					{d.t}
				</div>
			))}
			{the ? (
				<div style={{display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap'}}>
					{the.map((c, i) => (
						<div
							key={i}
							style={{
								fontSize: 23,
								fontWeight: 700,
								letterSpacing: 2,
								padding: '5px 16px',
								borderRadius: 30,
								border: `2px solid ${c.mau}`,
								color: c.mau,
								opacity: v(c.at),
								transform: `scale(${0.8 + 0.2 * v(c.at)})`,
								boxShadow: `0 0 12px ${c.mau}55`,
							}}
						>
							{c.t}
						</div>
					))}
				</div>
			) : null}
		</div>
	);
};
