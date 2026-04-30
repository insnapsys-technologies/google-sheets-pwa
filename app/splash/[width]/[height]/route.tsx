import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  const { width: w, height: h } = await params;
  const width = parseInt(w, 10);
  const height = parseInt(h, 10);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width < 100 || height < 100 ||
    width > 3000 || height > 3000
  ) {
    return new Response('Invalid dimensions', { status: 400 });
  }

  const { origin } = new URL(req.url);
  const iconSize = Math.round(Math.min(width, height) * 0.18);
  const iconRadius = Math.round(iconSize * 0.23);
  const fontSize = Math.round(Math.min(width, height) * 0.028);
  const glowSize = Math.round(Math.min(width, height) * 0.38);
  const barWidth = Math.round(Math.min(width, height) * 0.1);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          position: 'relative',
        }}
      >
        {/* Pink ambient glow */}
        <div
          style={{
            position: 'absolute',
            width: glowSize,
            height: glowSize,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,45,123,0.32) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* App icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${origin}/android/launchericon-192x192.png`}
          width={iconSize}
          height={iconSize}
          style={{ borderRadius: iconRadius, position: 'relative' }}
          alt=""
        />

        {/* App name */}
        <div
          style={{
            marginTop: Math.round(height * 0.018),
            fontFamily: 'sans-serif',
            fontWeight: 900,
            fontSize: fontSize,
            letterSpacing: '0.26em',
            color: '#ffffff',
            display: 'flex',
          }}
        >
          DIRECTORY
        </div>

        {/* Pink accent bar */}
        <div
          style={{
            marginTop: Math.round(height * 0.012),
            width: barWidth,
            height: Math.round(Math.min(width, height) * 0.0025),
            backgroundColor: '#FF2D7B',
            borderRadius: 2,
            display: 'flex',
          }}
        />
      </div>
    ),
    { width, height }
  );
}
