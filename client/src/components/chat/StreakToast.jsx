export default function StreakToast({ days = 7 }) {
  return (
    <div className="flex justify-center my-2">
      <div
        className="px-4 py-2 rounded-full text-sm font-medium"
        style={{
          background: '#fff3e0',
          border: '1px solid #ffcc80',
          color: '#e65100',
        }}
      >
        🔥 Streak kept · {days} days
      </div>
    </div>
  );
}
