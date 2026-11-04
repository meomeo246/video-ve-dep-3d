// Toạ độ phân tử dựng tay (đơn vị: 1 = 1 liên kết ~1,4 Å). Đủ đúng liên kết để học sinh nhìn, không phải toạ độ tinh thể học.
export type NguyenTu = {e: 'C' | 'H' | 'N' | 'O'; p: [number, number, number]};
export type LienKet = [number, number, number?]; // i, j, bậc
export type PhanTu = {a: NguyenTu[]; b: LienKet[]};

const tam = (pt: PhanTu): PhanTu => {
	const c = [0, 0, 0];
	for (const x of pt.a) for (let k = 0; k < 3; k++) c[k] += x.p[k] / pt.a.length;
	return {a: pt.a.map((x) => ({e: x.e, p: [x.p[0] - c[0], x.p[1] - c[1], x.p[2] - c[2]]})), b: pt.b};
};

/** Gắn 3 H tứ diện cho nhóm CH3 theo hướng d (2D). */
const metyl = (a: NguyenTu[], b: LienKet[], ci: number, d: [number, number]) => {
	const [x, y, z] = a[ci].p;
	const p = [-d[1], d[0]];
	for (let k = 0; k < 3; k++) {
		const t = (k * 2 * Math.PI) / 3 + 0.4;
		a.push({e: 'H', p: [x + 0.72 * (0.34 * d[0] + 0.94 * Math.cos(t) * p[0]), y + 0.72 * (0.34 * d[1] + 0.94 * Math.cos(t) * p[1]), z + 0.72 * 0.94 * Math.sin(t)]});
		b.push([ci, a.length - 1, 1]);
	}
};

/** Caffeine C8H10N4O2: khung purine (vòng 6 + vòng 5 ngưng tụ), 3 nhóm CH3. */
export const CAFFEINE: PhanTu = (() => {
	const a: NguyenTu[] = [
		{e: 'N', p: [-0.866, 0.5, 0]}, // 0 N1
		{e: 'C', p: [-0.866, -0.5, 0]}, // 1 C2
		{e: 'N', p: [0, -1, 0]}, // 2 N3
		{e: 'C', p: [0.866, -0.5, 0]}, // 3 C4
		{e: 'C', p: [0.866, 0.5, 0]}, // 4 C5
		{e: 'C', p: [0, 1, 0]}, // 5 C6
		{e: 'N', p: [1.817, 0.809, 0]}, // 6 N7
		{e: 'C', p: [2.405, 0, 0]}, // 7 C8
		{e: 'N', p: [1.817, -0.809, 0]}, // 8 N9
		{e: 'O', p: [-1.645, -0.95, 0]}, // 9 O (C2)
		{e: 'O', p: [0, 1.9, 0]}, // 10 O (C6)
		{e: 'C', p: [-1.732, 1.0, 0]}, // 11 CH3 (N1)
		{e: 'C', p: [0, -2.0, 0]}, // 12 CH3 (N3)
		{e: 'C', p: [2.126, 1.76, 0]}, // 13 CH3 (N7)
		{e: 'H', p: [3.2, 0, 0]}, // 14 H (C8)
	];
	const b: LienKet[] = [
		[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 1], [5, 0, 1],
		[4, 6, 1], [6, 7, 1], [7, 8, 2], [8, 3, 1],
		[1, 9, 2], [5, 10, 2], [0, 11, 1], [2, 12, 1], [6, 13, 1], [7, 14, 1],
	];
	metyl(a, b, 11, [-0.866, 0.5]);
	metyl(a, b, 12, [0, -1]);
	metyl(a, b, 13, [0.309, 0.951]);
	return tam({a, b});
})();

/** Saccharose C12H22O11 (chỉ vẽ nguyên tử nặng + H của nhóm OH): vòng glucose 6 cạnh – cầu O – vòng fructose 5 cạnh. */
export const SACCHAROSE: PhanTu = (() => {
	const a: NguyenTu[] = [];
	const b: LienKet[] = [];
	const add = (e: NguyenTu['e'], p: [number, number, number]) => (a.push({e, p}), a.length - 1);
	const vong = (cx: number, n: number, r: number, goc0: number, eo: number[]) => {
		const id: number[] = [];
		for (let k = 0; k < n; k++) {
			const t = goc0 + (k * 2 * Math.PI) / n;
			id.push(add(eo[k] === 1 ? 'O' : 'C', [cx + Math.cos(t) * r, Math.sin(t) * r * 0.75, (k % 2 ? 0.28 : -0.28) + Math.sin(t) * 0.45]));
		}
		for (let k = 0; k < n; k++) b.push([id[k], id[(k + 1) % n], 1]);
		return id;
	};
	const oh = (ci: number, d: [number, number, number]) => {
		const [x, y, z] = a[ci].p;
		const o = add('O', [x + d[0], y + d[1], z + d[2]]);
		b.push([ci, o, 1]);
		const h = add('H', [x + d[0] * 1.6 + 0.2, y + d[1] * 1.6, z + d[2] * 1.6 + 0.2]);
		b.push([o, h, 1]);
		return o;
	};
	const ra = (ci: number, cx: number, s: number) => {
		const [x, y] = a[ci].p;
		const dx = x - cx, dy = y;
		const l = Math.hypot(dx, dy) || 1;
		return [(dx / l) * 0.95, (dy / l) * 0.95, s * 0.5] as [number, number, number];
	};
	// glucose: C1..C5 + O5, C1 ở đỉnh phải
	const G = vong(-1.75, 6, 1.0, 0, [0, 0, 0, 0, 0, 1]); // [C1, C2, C3, C4, C5, O5] ngược chiều
	// fructose: C2' ở đỉnh trái
	const F = vong(1.85, 5, 0.86, Math.PI, [0, 0, 0, 0, 1]); // [C2', C3', C4', C5', O5']
	const cau = add('O', [0.06, -0.35, 0.1]);
	b.push([G[0], cau, 1], [cau, F[0], 1]);
	oh(G[1], ra(G[1], -1.75, 1));
	oh(G[2], ra(G[2], -1.75, -1));
	oh(G[3], ra(G[3], -1.75, 1));
	// C5 -> C6H2OH
	const c6 = add('C', [a[G[4]].p[0] + 0.3, a[G[4]].p[1] - 0.95, a[G[4]].p[2] + 0.5]);
	b.push([G[4], c6, 1]);
	oh(c6, [0.5, -0.75, 0.3]);
	oh(F[1], ra(F[1], 1.85, 1));
	oh(F[2], ra(F[2], 1.85, -1));
	// C2' -> C1'H2OH, C5' -> C6'H2OH
	const c1f = add('C', [a[F[0]].p[0] + 0.2, a[F[0]].p[1] + 0.95, a[F[0]].p[2] + 0.4]);
	b.push([F[0], c1f, 1]);
	oh(c1f, [-0.6, 0.7, 0.2]);
	const c6f = add('C', [a[F[3]].p[0] + 0.9, a[F[3]].p[1] - 0.45, a[F[3]].p[2] - 0.4]);
	b.push([F[3], c6f, 1]);
	oh(c6f, [0.7, 0.6, -0.3]);
	return tam({a, b});
})();

/** Mạng nước đá Ih (kiểu wurtzite): O ở nút, H nằm trên liên kết O···O, mỗi O 2 H gần (quy tắc băng gần đúng). */
export const BANG = (() => {
	const A = 2.2, C = A * 1.633;
	const O: [number, number, number][] = [];
	const nx = 4, ny = 4, nz = 2;
	const co = [
		[0, 0, 0],
		[2 / 3, 1 / 3, 0.5],
		[0, 0, 3 / 8],
		[2 / 3, 1 / 3, 7 / 8],
	];
	for (let i = 0; i < nx; i++)
		for (let j = 0; j < ny; j++)
			for (let k = 0; k < nz; k++)
				for (const [u, v, w] of co) {
					const fx = i + u, fy = j + v, fz = k + w;
					O.push([A * (fx + fy * -0.5), C * fz, A * fy * 0.8660254]);
				}
	const d0 = A * 0.6124; // khoảng O–O lân cận
	const bond: [number, number][] = [];
	for (let i = 0; i < O.length; i++)
		for (let j = i + 1; j < O.length; j++) {
			const d = Math.hypot(O[i][0] - O[j][0], O[i][1] - O[j][1], O[i][2] - O[j][2]);
			if (Math.abs(d - d0) < 0.12) bond.push([i, j]);
		}
	// lấy tâm
	const c = [0, 0, 0];
	for (const p of O) for (let k = 0; k < 3; k++) c[k] += p[k] / O.length;
	const Oc = O.map((p) => [p[0] - c[0], p[1] - c[1], p[2] - c[2]] as [number, number, number]);
	// gán H: mỗi O lấy 2 liên kết chưa có H trỏ vào (quy tắc băng gần đúng); O mặt ngoài thiếu thì H chĩa ra ngoài
	const lay = new Set<number>();
	const H: {o: number; q: number; p: [number, number, number]}[] = [];
	const t = 0.36;
	for (let o = 0; o < Oc.length; o++) {
		let n = 0;
		for (let k = 0; k < bond.length && n < 2; k++) {
			const [i, j] = bond[k];
			if ((i !== o && j !== o) || lay.has(k)) continue;
			const q = i === o ? j : i;
			lay.add(k);
			H.push({o, q, p: [Oc[o][0] + (Oc[q][0] - Oc[o][0]) * t, Oc[o][1] + (Oc[q][1] - Oc[o][1]) * t, Oc[o][2] + (Oc[q][2] - Oc[o][2]) * t]});
			n++;
		}
		for (; n < 2; n++) {
			const g = o * 2.4 + n * 2.1;
			H.push({o, q: -1, p: [Oc[o][0] + Math.cos(g) * 0.45, Oc[o][1] + (n ? -0.2 : 0.3), Oc[o][2] + Math.sin(g) * 0.45]});
		}
	}
	return {O: Oc, bond, H};
})();
