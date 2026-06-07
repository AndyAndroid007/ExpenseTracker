export default function StreakToast({ days = 7 }) {
  return (
    <div className="flex justify-center my-2">
      <div
        className="px-4 py-1.5 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400"
        // style={{
        //   background: '#fff3e0',
        //   border: '1px solid #ffcc80',
        //   color: '#e65100',
        // }}
      >
        🔥 Streak kept · {days} days
      </div>
    </div>
  );
}
