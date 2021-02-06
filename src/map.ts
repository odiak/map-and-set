type Entry<Key, Value> = {
  key: Key
  value: Value
  hash: number
}

type EntryContainer<Key, Value> = {
  entry: Entry<Key, Value> | null
  next: EntryContainer<Key, Value> | null
}

export type MapKeyOptions<Key> = {
  hash(key: Key): number
  equal(key1: Key, key2: Key): boolean
}

const maxCapacity = 2 ** 30

export class Map<Key, Value> {
  private hashKey: (key: Key) => number
  private equalKey: (key1: Key, key2: Key) => boolean
  private hashTable: Array<EntryContainer<Key, Value> | null>
  private dataTable: Array<EntryContainer<Key, Value>>
  private internalSize = 0

  constructor(iterable: Iterable<[Key, Value]> | undefined | null, keyOption: MapKeyOptions<Key>) {
    this.hashKey = keyOption.hash
    this.equalKey = keyOption.equal

    const bucketSize = Array.isArray(iterable) ? getInitialBucketSize(iterable.length) : 2
    this.hashTable = new Array<null>(bucketSize).fill(null)
    this.dataTable = []

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
    this.hashTable = new Array<null>(this.hashTable.length).fill(null)
    this.dataTable = []
    this.internalSize = 0
  }

  private getEntryContainer(key: Key): EntryContainer<Key, Value> | null {
    const hash = hashNumber(this.hashKey(key))
    const index = indexFor(hash, this.hashTable.length)
    for (let c = this.hashTable[index]; c != null; c = c.next) {
      const e = c.entry
      if (e != null && e.hash === hash) {
        if (e.key === key || this.equalKey(e.key, key)) {
          return c
        }
      }
    }
    return null
  }

  delete(key: Key): boolean {
    const c = this.getEntryContainer(key)
    if (c == null) return false
    c.entry = null
    this.internalSize--
    if (this.hashTable.length > 2 && this.internalSize < this.dataTable.length / 2) {
      this.resize(this.hashTable.length / 2)
    }
    return true
  }

  get(key: Key): Value | undefined {
    return this.getEntryContainer(key)?.entry?.value
  }

  has(key: Key): boolean {
    return this.getEntryContainer(key) != null
  }

  set(key: Key, value: Value): this {
    const hash = hashNumber(this.hashKey(key))
    const index = indexFor(hash, this.hashTable.length)
    for (let c = this.hashTable[index]; c != null; c = c.next) {
      const e = c.entry
      if (e != null && e.hash === hash) {
        if (e.key === key || this.equalKey(e.key, key)) {
          e.value = value
          return this
        }
      }
    }
    const c = { entry: { key, value, hash }, next: this.hashTable[index] }
    this.hashTable[index] = c
    this.dataTable.push(c)
    this.internalSize++

    if (this.dataTable.length > this.hashTable.length * 2) {
      if (this.internalSize < this.dataTable.length) {
        this.resize(this.hashTable.length)
      } else {
        this.resize(this.hashTable.length * 2)
      }
    }
    return this
  }

  private resize(bucketSize: number) {
    const capacity = bucketSize * 2
    if (capacity > maxCapacity) {
      throw new Error('maximum capacity exceeded')
    }

    const oldDataTable = this.dataTable
    type EC = EntryContainer<Key, Value>
    const hashTable = new Array<EC | null>(bucketSize).fill(null)
    const dataTable = [] as Array<EC>
    for (const c of oldDataTable) {
      const e = c.entry
      if (e == null) continue
      const index = indexFor(e.hash, bucketSize)
      c.next = hashTable[index]
      hashTable[index] = c
      dataTable.push(c)
    }
    this.hashTable = hashTable
    this.dataTable = dataTable
  }

  *entries(): IterableIterator<[Key, Value]> {
    for (const { entry } of this.dataTable) {
      if (entry != null) yield [entry.key, entry.value]
    }
  }

  [Symbol.iterator](): IterableIterator<[Key, Value]> {
    return this.entries()
  }

  *keys(): IterableIterator<Key> {
    for (const { entry } of this.dataTable) {
      if (entry != null) yield entry.key
    }
  }

  *values(): IterableIterator<Value> {
    for (const { entry } of this.dataTable) {
      if (entry != null) yield entry.value
    }
  }

  forEach(callback: (value: Value, key: Key, map: this) => void): void {
    for (const { entry } of this.dataTable) {
      if (entry != null) callback(entry.value, entry.key, this)
    }
  }
}

function getInitialBucketSize(numEntries: number): number {
  let n = 2
  while (n < numEntries) n *= 2
  return n
}

function hashNumber(n: number): number {
  let hash = n
  hash = ~hash + (hash << 15)
  hash = hash ^ (hash >> 12)
  hash = hash + (hash << 2)
  hash = hash ^ (hash >> 4)
  hash = hash * 2057
  hash = hash ^ (hash >> 16)
  return hash & 0x3fffffff
}

function indexFor(hash: number, capacity: number): number {
  return hash & (capacity - 1)
}
