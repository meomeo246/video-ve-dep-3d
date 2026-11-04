"""Đo nhịp bài nhạc để dựng cảnh bám beat.

    python tools/do_nhip.py public/nhac.mp3 [--drop 13.9]

In ra: BPM, phách 0 (giây), độ to từng ô nhịp (để thấy intro / build / drop / nghỉ),
và 2 dòng BPM + LECH_S để dán vào src/nhip.ts. Cần ffmpeg + numpy.
"""
import subprocess, sys
import numpy as np

SR, HOP, WIN = 22050, 256, 1024


def doc(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def onset(x):
    n = 1 + (len(x) - WIN) // HOP
    khung = np.lib.stride_tricks.as_strided(x, (n, WIN), (x.strides[0] * HOP, x.strides[0]))
    mag = np.log1p(np.abs(np.fft.rfft(khung * np.hanning(WIN), axis=1)))
    flux = np.maximum(np.diff(mag, axis=0), 0).sum(axis=1)
    flux = np.concatenate([[0], flux])
    return (flux - flux.mean()) / (flux.std() + 1e-9)


def main():
    x = doc(sys.argv[1])
    env = onset(x)
    fps = SR / HOP
    ac = np.correlate(env, env, 'full')[len(env) - 1:]
    bpms = np.arange(70.0, 181.0, 0.25)
    diem = []
    for b in bpms:
        lag = 60 * fps / b
        diem.append(sum(np.interp(lag * k, np.arange(len(ac)), ac) / k for k in (1, 2, 4)))
    diem = np.array(diem) * np.exp(-0.5 * (np.log2(bpms / 130) / 0.6) ** 2)  # ưu tiên tempo phổ biến
    bpm = float(bpms[diem.argmax()])
    if abs(bpm - round(bpm)) <= 0.3:
        bpm = float(round(bpm))
    chu = 60 * fps / bpm
    pha = np.arange(0, chu, 0.25)
    t = np.arange(0, len(env) - 1, chu)
    lech = pha[np.argmax([np.interp(t + p, np.arange(len(env)), env).sum() for p in pha])]
    # Pha trên chỉ đúng tới 1 phách; phách nào là phách 1 của ô nhịp thì máy đoán không chắc.
    # Quy ước: drop chính phải rơi đúng đầu ô nhịp -> cho --drop <giây>, không có thì lấy chỗ bật mạnh nhất.
    e2 = np.convolve(x.astype(np.float64) ** 2, np.ones(HOP) / HOP, 'same')[::HOP]
    dau = np.arange(lech, len(e2) - chu, chu)
    rp = np.array([np.sqrt(e2[int(a):int(a + chu)].mean()) for a in dau])
    tang = np.array([0.0] * 4 + [rp[i] / (rp[i - 4:i].mean() + 1e-9) for i in range(4, len(rp))])
    top = [i for i in np.argsort(tang)[::-1][:5]]
    print('Chỗ nhạc bật mạnh (giây):', ', '.join(f'{dau[i] / fps:.2f}' for i in sorted(top)))
    if DROP is not None:
        i_drop = int(round((DROP * fps - lech) / chu))
    else:
        i_drop = top[0]
        print(f'Không có --drop: tạm lấy {dau[i_drop] / fps:.2f}s làm đầu ô nhịp. Nghe lại, sai thì chạy với --drop <giây drop chính>.')
    k = i_drop % 4
    lech_s = (lech + k * chu) / fps
    o = 4 * 60 / bpm
    print(f'BPM {bpm:g} | phách 0 ở {lech_s:.2f}s | 1 phách = {30 * 60 / bpm:.2f} frame, 1 ô nhịp = {o:.2f}s = {30 * o:.1f} frame @30fps')
    print(f'Dài {len(x) / SR:.1f}s\n\nÔ nhịp | giây | độ to')
    rms = []
    n = 0
    while lech_s + (n + 1) * o <= len(x) / SR:
        a, b = int((lech_s + n * o) * SR), int((lech_s + (n + 1) * o) * SR)
        rms.append(float(np.sqrt(np.mean(x[a:b] ** 2))))
        n += 1
    top = max(rms) or 1
    for i, r in enumerate(rms):
        ghi = ''
        if i and r > 1.25 * rms[i - 1] and r > 0.75 * top:
            ghi = '  <- VÀO MẠNH (drop?)'
        elif r < 0.55 * top:
            ghi = '  (nhẹ / nghỉ)'
        print(f'{i:5d}  | {lech_s + i * o:5.1f} | {"#" * int(30 * r / top):30s}{ghi}')
    print(f'\nDán vào src/nhip.ts:\nexport const BPM = {bpm:g};\nexport const LECH_S = {lech_s:.2f};')


DROP = float(sys.argv[sys.argv.index('--drop') + 1]) if '--drop' in sys.argv else None
main()
