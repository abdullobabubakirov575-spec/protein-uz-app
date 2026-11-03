import os
import re
import subprocess
import sys

RAW, OUT, ICON, FONT = sys.argv[1:5]
TMP = OUT + ".part.mp4"

WIDTH, HEIGHT, FPS = 720, 1560, 30
FREEZE_HOLD = 1.1
SPEED = 1.15
BACKGROUND = "0x0C0C0C"


def run(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(["ffmpeg", "-hide_banner", "-y", *args], capture_output=True, text=True)


def duration(path: str) -> float:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(probe.stdout.strip())


def keep_segments(path: str) -> list[tuple[float, float]]:
    total = duration(path)
    scan = run(["-i", path, "-vf", "freezedetect=n=0.003:d=0.9", "-map", "0:v", "-f", "null", "-"])
    starts = [float(v) for v in re.findall(r"freeze_start: ([\d.]+)", scan.stderr)]
    ends = [float(v) for v in re.findall(r"freeze_end: ([\d.]+)", scan.stderr)]
    if len(ends) < len(starts):
        ends.append(total)

    segments, cursor = [], 0.0
    for start, end in zip(starts, ends):
        keep_until = min(end, start + FREEZE_HOLD)
        if keep_until - cursor > 0.05:
            segments.append((cursor, keep_until))
        cursor = max(cursor, end)
    if total - cursor > 0.05:
        segments.append((cursor, total))
    return segments


def body_filter(segments: list[tuple[float, float]]) -> str:
    parts = [
        f"[0:v]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[s{i}]"
        for i, (start, end) in enumerate(segments)
    ]
    labels = "".join(f"[s{i}]" for i in range(len(segments)))
    parts.append(
        f"{labels}concat=n={len(segments)}:v=1:a=0,setpts=PTS/{SPEED},"
        f"fps={FPS},scale={WIDTH}:{HEIGHT}:flags=lanczos,format=yuv420p[body]"
    )
    return ";".join(parts)


def title_card(text_main: str, text_sub: str, seconds: float) -> str:
    font = FONT.replace(":", "\\:")
    return (
        f"color=c={BACKGROUND}:s={WIDTH}x{HEIGHT}:r={FPS}:d={seconds}[cardbg];"
        f"[1:v]scale=260:260,format=rgba[cardicon];"
        f"[cardbg][cardicon]overlay=(W-w)/2:(H-h)/2-170:shortest=1,"
        f"drawtext=fontfile='{font}':text='{text_main}':fontcolor=white:fontsize=76:x=(w-text_w)/2:y=h/2+20,"
        f"drawtext=fontfile='{font}':text='{text_sub}':fontcolor=0x96E04A:fontsize=38:x=(w-text_w)/2:y=h/2+120,"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={seconds - 0.35}:d=0.35,format=yuv420p"
    )


def render() -> None:
    segments = keep_segments(RAW)
    print(f"segments kept: {len(segments)}, seconds: {sum(e - s for s, e in segments):.1f}")
    graph = ";".join(
        [
            body_filter(segments),
            title_card("PROTEIN.UZ", "iOS-приложение", 2.2) + "[intro]",
            "[intro][body]concat=n=2:v=1:a=0[out]",
        ]
    )
    result = run(
        [
            "-i", RAW,
            "-loop", "1", "-i", ICON,
            "-filter_complex", graph,
            "-map", "[out]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "21",
            "-movflags", "+faststart",
            TMP,
        ]
    )
    if result.returncode != 0:
        print(result.stderr[-3000:])
        fallback = run(
            [
                "-i", RAW,
                "-filter_complex", body_filter(segments),
                "-map", "[body]",
                "-c:v", "libx264", "-preset", "medium", "-crf", "21",
                "-movflags", "+faststart",
                TMP,
            ]
        )
        if fallback.returncode != 0:
            print(fallback.stderr[-3000:])
            sys.exit(1)
    os.replace(TMP, OUT)
    print(f"showcase: {duration(OUT):.1f}s -> {OUT}")


if __name__ == "__main__":
    render()
