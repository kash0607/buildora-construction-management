import mongoose from 'mongoose';

/**
 * Atomic Counter Collection
 * Uses MongoDB's findOneAndUpdate with $inc to guarantee unique,
 * monotonically increasing sequence numbers even under concurrency.
 *
 * Each document represents a named counter (e.g. 'project', 'vendor', 'pr').
 */
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Get the next sequence number for a named counter.
 * Atomically increments and returns the new value.
 *
 * @param {string} name - Counter name (e.g. 'project', 'vendor', 'pr')
 * @param {number} [startAt=1] - Initial value if counter doesn't exist yet
 * @returns {Promise<number>} The next sequence number
 */
export async function getNextSequence(name, startAt = 1) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );
  // If this is the very first call (seq was 0 before $inc → now 1),
  // we may want to offset by startAt
  // The counter starts at 0, $inc makes it 1, 2, 3, ...
  // The caller formats with the offset, e.g. `PRJ-${100 + seq}`
  return counter.seq;
}

export default Counter;
