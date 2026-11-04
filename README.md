# Tổng hợp skills: Social

Mỗi thư mục là 1 skill có `SKILL.md` (cách làm + luật) và các file kèm theo.

| Skill | Làm gì |
|---|---|
| [video-ve-dep-3d](video-ve-dep-3d/SKILL.md) | Video TikTok dọc "Vẻ đẹp <môn học>": 3D neon (Remotion + Three.js), chữ HUD, bám beat nhạc, không lời đọc |

## Cách dùng

- **Claude Code:** chép thư mục skill vào `~/.claude/skills/` (dùng cho mọi dự án) hoặc `<dự án>/.claude/skills/` (chỉ dự án đó). Lúc nhờ làm video loại này, Claude sẽ tự đọc skill.
- **AI khác (Gemini, Codex…):** bảo nó đọc `video-ve-dep-3d/SKILL.md` trước khi làm, và đọc thêm các file trong `references/` khi đến bước tương ứng.
- **Người làm tay:** đọc `SKILL.md` theo thứ tự các bước; engine ở `template/`.

Không commit nhạc, video hay `node_modules` (đã có `.gitignore`).
