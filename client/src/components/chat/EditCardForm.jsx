import { useState } from 'react';
import api from '../../utils/api';
import logger from '../../utils/logger';

const categoryClasses = {
  Food: 'bg-orange-50 text-orange-700 border border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30',
  Transport: 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
  Shopping: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  Entertainment: 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30',
  Bills: 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30',
  Health: 'bg-cyan-50 text-cyan-700 border border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30',
  General: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50',
};

export default function EditCardForm({ parsed, onSave, onCancel }) {
  const [amount, setAmount] = useState(parsed.amount);
  const [category, setCategory] = useState(parsed.category);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState(null); // { type: 'rose' | 'green', msg: string }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlertState(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAlertState({
        type: 'rose',
        msg: 'Please enter a valid amount greater than 0.',
      });
      return;
    }

    setLoading(true);
    try {
      logger.info({ entryId: parsed.id, amount: parsedAmount, category }, 'Saving changes...');
      const response = await api.patch(`/entries/${parsed.id}`, {
        amount: parsedAmount,
        category,
      });

      logger.info({ entryId: parsed.id }, 'Changes saved successfully');
      setAlertState({
        type: 'green',
        msg: 'Changes successfully saved!',
      });

      setTimeout(() => {
        onSave({
          ...parsed,
          amount: parsedAmount,
          category,
          streak: response.data?.entry ? parsed.streak : parsed.streak
        });
      }, 500);
    } catch (err) {
      logger.error({ err }, 'Error saving edited entry details');
      setAlertState({
        type: 'rose',
        msg: err.response?.data?.message || 'Could not save updates. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-4 bg-surface/85 backdrop-blur-md border-[0.5px] border-separator shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col gap-3.5 max-w-[280px]"
      /* style={{
        background: 'var(--color-surface)',
        border: '0.5px solid var(--color-separator)',
        borderRadius: '16px',
        padding: '1.25rem',
      }} */
    >
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold tracking-[0.06em] text-label-tertiary uppercase">
          Edit Details
        </span>
        <span className="text-[9px] text-label-tertiary">
          Confidence: {parsed.confidence}
        </span>
      </div>

      {alertState && (
        <div
          className={`px-3 py-2 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 animate-fadeIn ${
            alertState.type === 'rose'
              ? 'bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/30'
              : 'bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/30'
          }`}
        >
          <span>{alertState.type === 'rose' ? '⚠️' : '✨'}</span>
          <span>{alertState.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-label-secondary font-semibold">Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            disabled={loading}
            placeholder="0.00"
            className="bg-bg border-[0.5px] border-separator rounded-lg px-3 py-1.5 text-xs text-label-primary outline-none focus:border-primary transition-all disabled:opacity-50"
            /* style={{
              background: 'var(--color-bg)',
              border: '0.5px solid var(--color-separator)',
              borderRadius: '8px',
              padding: '6px 10px',
            }} */
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-label-secondary font-semibold">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={loading}
            className="bg-bg border-[0.5px] border-separator rounded-lg px-2 py-1.5 text-xs text-label-primary outline-none focus:border-primary transition-all disabled:opacity-50"
            /* style={{
              background: 'var(--color-bg)',
              border: '0.5px solid var(--color-separator)',
              borderRadius: '8px',
              padding: '6px 10px',
            }} */
          >
            {Object.keys(categoryClasses).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white border-none cursor-pointer hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
            /* style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }} */
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-bg text-label-secondary border border-separator cursor-pointer hover:bg-surface disabled:opacity-50 transition-all"
            /* style={{
              background: 'var(--color-bg)',
              color: 'var(--color-label-secondary)',
              border: '1px solid var(--color-separator)',
              cursor: 'pointer',
            }} */
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
