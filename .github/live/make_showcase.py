import os
import re
import subprocess
import sys

RAW, OUT, TITLE = sys.argv[1:4]
TMP = OUT + ".part.mp4"

WIDTH, HEIGHT, FPS = 720, 1560, 30
FREEZE_HOLD = 1.0
SPEED = 1.3
TITLE_SECONDS = 2.0
ENCODE = ["-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]


def ffmpeg(args: list[str]) -> subprocess.CompletedProcess:
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
    scan = ffmpeg(["-i", path, "-vf", "freezedetect=n=0.003:d=0.8", "-map", "0:v", "-f", "null", "-"])
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


def graph(segments: list[tuple[float, float]]) -> str:
    parts = [
        f"[0:v]trim=start={start:.3f}:end={end:.3f},setpts=PTS-STARTPTS[s{i}]"
        for i, (start, end) in enumerate(segments)
    ]
    labels = "".join(f"[s{i}]" for i in range(len(segments)))
    parts.append(
        f"{labels}concat=n={len(segments)}:v=1:a=0,setpts=PTS/{SPEED},"
        f"fps={FPS},scale={WIDTH}:{HEIGHT}:flags=lanczos,setsar=1,format=yuv420p[body]"
    )
    fade_out = TITLE_SECONDS - 0.35
    parts.append(
        f"[1:v]scale={WIDTH}:{HEIGHT},fps={FPS},setsar=1,format=yuv420p,"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={fade_out:.2f}:d=0.35[title]"
    )
    parts.append("[title][body]concat=n=2:v=1:a=0[out]")
    return ";".join(parts)


def render() -> None:
    segments = keep_segments(RAW)
    print(f"segments kept: {len(segments)}, raw seconds kept: {sum(e - s for s, e in segments):.1f}")
    result = ffmpeg(
        [
            "-i", RAW,
            "-loop", "1", "-t", str(TITLE_SECONDS), "-i", TITLE,
            "-filter_complex", graph(segments),
            "-map", "[out]",
            *ENCODE,
            TMP,
        ]
    )
    if result.returncode != 0:
        print(result.stderr[-3000:])
        sys.exit(1)
    os.replace(TMP, OUT)
    print(f"showcase: {duration(OUT):.1f}s -> {OUT}")


if __name__ == "__main__":
    render()
