type InternalEntry<Key, Value> = {
  key: Key
  value: Value
  hash: number
  next: InternalEntry<Key, Value> | null
  before: InternalEntry<Key, Value> | null
  after: InternalEntry<Key, Value> | null
}

export type MapKeyOptions<Key> = {
  hash(key: Key): number
  equal(key1: Key, key2: Key): boolean
}

const maxCapacity = 2 ** 52

export class Map<Key, Value> {
  private table: Array<InternalEntry<Key, Value> | null>
  private internalSize = 0
  private loadFactor = 0.75
  private threshold: number
  private hashKey: (key: Key) => number
  private equalKey: (key1: Key, key2: Key) => boolean
  private headEntry: InternalEntry<Key, Value> | null = null
  private tailEntry: InternalEntry<Key, Value> | null = null

  constructor(iterable: Iterable<[Key, Value]> | undefined | null, keyOption: MapKeyOptions<Key>) {
    this.hashKey = keyOption.hash
    this.equalKey = keyOption.equal

    const capacity = 16
    this.threshold = Math.floor(capacity * this.loadFactor)
    this.table = new Array(capacity).fill(null)

    if (iterable != null) {
      for (const [key, value] of iterable) {
        this.set(key, value)
      }
    }
  }

  get size(): number {
    return this.internalSize
  }

  clear(): void {
    const table = this.table
    for (let i = 0; i < table.length; i++) {
      table[i] = null
    }
    this.internalSize = 0
    this.headEntry = null
    this.tailEntry = null
  }

  delete(key: Key): boolean {
    const hash = hashNumber(this.hashKey(key))
    const i = indexFor(hash, this.table.length)
    let prev: InternalEntry<Key, Value> | null = null
    for (let e = this.table[i]; e != null; prev = e, e = e.next) {
      if (e.hash === hash) {
        const k = e.key
        if (k === key || this.equalKey(k, key)) {
          if (prev == null) {
            this.table[i] = e.next
          } else {
            prev.next = e.next
          }
          const { before, after } = e
          if (before == null) {
            this.headEntry = after
          } else {
            before.after = after
          }
          if (after == null) {
            this.tailEntry = before
          } else {
            after.before = before
          }
          this.internalSize--
          return true
        }
      }
    }
    return false
  }

  private getEntry(key: Key): InternalEntry<Key, Value> | null {
    const hash = hashNumber(this.hashKey(key))
    const i = indexFor(hash, this.table.length)
    for (let e = this.table[i]; e != null; e = e.next) {
      if (e.hash === hash) {
        const k = e.key
        if (k === key || this.equalKey(k, key)) {
          return e
        }
      }
    }
    return null
  }

  get(key: Key): Value | undefined {
    return this.getEntry(key)?.value
  }

  has(key: Key): boolean {
    return this.getEntry(key) != null
  }

  set(key: Key, value: Value): this {
    const hash = hashNumber(this.hashKey(key))
    const i = indexFor(hash, this.table.length)
    for (let e = this.table[i]; e != null; e = e.next) {
      if (e.hash === hash) {
        const k = e.key
        if (k === key || this.equalKey(k, key)) {
          e.value = value
          return this
        }
      }
    }
    const entry: InternalEntry<Key, Value> = {
      key,
      value,
      hash,
      next: this.table[i],
      before: this.tailEntry,
      after: null
    }
    if (this.tailEntry == null) {
      this.headEntry = entry
      this.tailEntry = entry
    } else {
      this.tailEntry.after = entry
      this.tailEntry = entry
    }

    this.table[i] = entry
    this.internalSize++
    if (this.internalSize >= this.threshold) {
      this.resize(this.table.length * 2)
    }
    return this
  }

  private resize(newCapacity: number) {
    if (this.table.length === maxCapacity) {
      this.threshold = Number.MAX_SAFE_INTEGER
      return
    }
    const newTable = new Array(newCapacity).fill(null)
    for (let e = this.headEntry; e != null; e = e.after) {
      const i = indexFor(e.hash, newCapacity)
      e.next = newTable[i]
      newTable[i] = e
    }
    this.table = newTable
    this.threshold = newTable.length * this.loadFactor
  }

  *entries(): IterableIterator<[Key, Value]> {
    for (let e = this.headEntry; e != null; e = e.after) {
      yield [e.key, e.value]
    }
  }

  [Symbol.iterator](): IterableIterator<[Key, Value]> {
    return this.entries()
  }

  *keys(): IterableIterator<Key> {
    for (let e = this.headEntry; e != null; e = e.after) {
      yield e.key
    }
  }

  *values(): IterableIterator<Value> {
    for (let e = this.headEntry; e != null; e = e.after) {
      yield e.value
    }
  }

  forEach(callback: (value: Value, key: Key, map: this) => void): void {
    for (let e = this.headEntry; e != null; e = e.after) {
      callback(e.value, e.key, this)
    }
  }
}

function hashNumber(h: number): number {
  h ^= (h >>> 20) ^ (h >>> 12)
  return h ^ (h >>> 7) ^ (h >>> 4)
}

function indexFor(hash: number, capacity: number): number {
  return hash & (capacity - 1)
}
