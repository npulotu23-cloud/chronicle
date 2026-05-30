// Full-screen cinematic flash for critical roll outcomes.
// Pure visual — no game logic. Renders nothing when type is null.

export default function CritFlash({ type, themeColor }) {
  if (!type) return null;

  const isSuccess = type === 'success';
  const textColor = isSuccess ? themeColor : '#ef4444';
  const bg = isSuccess
    ? `radial-gradient(ellipse at center, ${themeColor}35 0%, rgba(0,0,0,0.92) 65%)`
    : `radial-gradient(ellipse at center, rgba(200,10,10,0.45) 0%, rgba(0,0,0,0.95) 65%)`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center crit-flash pointer-events-none"
      style={{ background: bg }}
    >
      <div className="text-center px-6">
        <p
          className="text-4xl sm:text-6xl font-black tracking-widest uppercase select-none"
          style={{
            color: textColor,
            textShadow: `0 0 30px ${textColor}, 0 0 60px ${textColor}60, 0 0 100px ${textColor}30`,
            fontFamily: 'Georgia, serif',
          }}
        >
          {isSuccess ? '✦ Critical Success ✦' : '✕ Critical Fail ✕'}
        </p>
      </div>
    </div>
  );
}
