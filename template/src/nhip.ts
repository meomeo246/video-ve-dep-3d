// Lưới nhịp theo bài nhạc ve-dep-hoa-hoc.mp3: 142 BPM, phách 0 ở 0,40s (đo 03/11).
export const FPS = 30;
export const BPM = 142;
export const LECH_S = 0.4;
export const PHACH = (FPS * 60) / BPM; // ~12,68 frame
export const O_NHIP = PHACH * 4; // ~50,7 frame
/** Frame (tuyệt đối) của ô nhịp thứ n. */
export const oNhip = (n: number) => Math.round((LECH_S + (n * 4 * 60) / BPM) * FPS);

export type Chuong = {so: string; chuDe: string; ten: string; mau: string};
export const CHUONG: Chuong[] = [
	{so: '01', chuDe: 'HỢP CHẤT HỮU CƠ', ten: 'TRÀ', mau: '#fbbf24'},
	{so: '02', chuDe: 'SACCHAROSE', ten: 'ĐƯỜNG ĐEN', mau: '#fb7a3c'},
	{so: '03', chuDe: 'TINH BỘT', ten: 'TRÂN CHÂU', mau: '#34d399'},
	{so: '04', chuDe: 'NHŨ TƯƠNG', ten: 'SỮA', mau: '#f5e6c8'},
	{so: '05', chuDe: 'CHẤT CHỈ THỊ pH', ten: 'TRÀ ĐẬU BIẾC', mau: '#6d7cff'},
	{so: '06', chuDe: 'LIÊN KẾT HYDROGEN', ten: 'ĐÁ', mau: '#67e8f9'},
];
/** Ô nhịp bắt đầu mỗi chương; phần tử cuối = bắt đầu outro. */
export const MOC = [8, 12, 16, 20, 24, 30, 34];
export const O_HET = 38;
export const INTRO = oNhip(MOC[0]);
export const batDau = (i: number) => oNhip(MOC[i]);
export const daiChuong = (i: number) => oNhip(MOC[i + 1]) - oNhip(MOC[i]);
export const OUTRO_DAU = oNhip(MOC[CHUONG.length]);
export const TONG = oNhip(O_HET);
/** -1 = intro, 0..5 = chương, 6 = outro. */
export const chuongTai = (g: number) => {
	if (g < INTRO) return -1;
	for (let i = 0; i < CHUONG.length; i++) if (g < batDau(i + 1)) return i;
	return CHUONG.length;
};

/** Xung nhịp: 1 ngay đầu phách, tắt dần theo hàm mũ. */
export const xung = (f: number, chuKy = PHACH, tat = 5) => (f < 0 ? 0 : Math.exp(-(f % chuKy) / tat));
export const kep = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mo = (f: number, a: number, b: number) => kep((f - a) / (b - a));
export const em = (t: number) => 1 - Math.pow(1 - kep(t), 3);
export const emIO = (t: number) => {
	const x = kep(t);
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** Bật nảy (overshoot) khi xuất hiện. */
export const nay = (t: number) => {
	const x = kep(t);
	const c = 2.2;
	return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
