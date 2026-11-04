"""Beat tạm kiểu phonk 120 BPM (tự tổng hợp, không bản quyền): 808 + clap + hat + cowbell.
python tools/beat_tam.py <so_o_nhip> public/beat.wav"""
import sys, wave
import numpy as np
SR = 44100
BPM = 120
BEAT = 60 / BPM
o = int(sys.argv[1]) if len(sys.argv) > 1 else 4
out = sys.argv[2] if len(sys.argv) > 2 else 'public/beat.wav'
dur = o * 4 * BEAT
x = np.zeros(int(SR * (dur + 1)))
rng = np.random.default_rng(3)
def add(at, sig, g=1.0):
    i = int(at * SR); x[i:i + len(sig)] += sig[: len(x) - i] * g
def kick808(f0=55, L=0.9):
    t = np.arange(int(SR * L)) / SR
    f = f0 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.2 * np.sin(ph) * np.exp(-t * 3.2))
def clap(L=0.25):
    t = np.arange(int(SR * L)) / SR
    n = rng.standard_normal(len(t))
    n = n - np.concatenate([[0], n[:-1]]) * 0.9
    env = np.exp(-t * 18) * (1 + 0.6 * (np.sin(t * 2 * np.pi * 90) > 0) * (t < 0.03))
    return n * env * 0.5
def hat(L=0.05):
    t = np.arange(int(SR * L)) / SR
    n = rng.standard_normal(len(t)); n = n - np.concatenate([[0], n[:-1]])
    return n * np.exp(-t * 90) * 0.18
def cowbell(semi, L=0.32):
    t = np.arange(int(SR * L)) / SR
    k = 2 ** (semi / 12)
    s = np.sign(np.sin(2 * np.pi * 540 * k * t)) + np.sign(np.sin(2 * np.pi * 800 * k * t))
    s = s - np.concatenate([[0], s[:-1]]) * 0.6
    return np.tanh(s * np.exp(-t * 11) * 0.9) * 0.32
mel = [0, None, 0, 3, None, 5, 3, None, 7, None, 5, 3, None, 0, 3, None]  # 16 nốt móc kép / ô nhịp
for b in range(o):
    t0 = b * 4 * BEAT
    for k in [0, 1.75, 2.5]:
        add(t0 + k * BEAT, kick808(55 if k != 2.5 else 49), 0.85)
    for k in [1, 3]: add(t0 + k * BEAT, clap(), 0.7)
    for k in range(8): add(t0 + k * BEAT / 2, hat(), 0.8 if k % 2 else 0.5)
    if b >= 1:
        for j, s in enumerate(mel):
            if s is not None: add(t0 + j * BEAT / 4, cowbell(s + (12 if b == o - 1 and j > 7 else 0)), 0.9)
x = x[: int(SR * dur)]
x = np.tanh(x * 1.2) / np.tanh(1.2) * 0.85
pcm = (np.stack([x, x], 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', out, round(dur, 2), 's')
