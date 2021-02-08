import { Map } from './map'

type Entry<Value> = {
  value: Value
  hash: number
}

type EntryContainer<Value> = {
  entry: Entry<Value> | null
  next: EntryContainer<Value> | null
}

export type SetOptions<Value> = {
  hash(value: Value): number
  equal(value1: Value, value2: Value): boolean
}

export class Set<Value> {
  private hashValue: (value: Value) => number
  private equalValue: (value1: Value, value2: Value) => boolean
  private hashTable: Array<EntryContainer<Value> | null>
  private dataTable: Array<EntryContainer<Value>> = []
  private internalSize = 0

  constructor(iterable: Iterable<Value> | null | undefined, options: SetOptions<Value>) {
    this.hashValue = options.hash
    this.equalValue = options.equal

    const bucketSize = Array.isArray(iterable) ? getInitialBucketSize(iterable.length) : 2
    this.hashTable = new Array<null>(bucketSize).fill(null)

    if (iterable != null) {
      for (const value of iterable) {
        this.add(value)
      }
    }
  }

  get size(): number {
    return this.internalSize
  }

  private getEntryContainer(value: Value): EntryContainer<Value> | null {
    const hash = this.hashValue(value)
    const index = indexFor(hash, this.hashTable.length)
    for (let c = this.hashTable[index]; c != null; c = c.next) {
      const e = c.entry
      if (e != null && e.hash === hash && (e.value === value || this.equalValue(e.value, value))) {
        return c
      }
    }
    return null
  }

  has(value: Value): boolean {
    return this.getEntryContainer(value) != null
  }

  delete(value: Value): boolean {
    const c = this.getEntryContainer(value)
    if (c == null) return false
    c.entry = null
    this.internalSize--

    if (this.hashTable.length > 2 && this.internalSize < this.hashTable.length) {
      this.resize(this.hashTable.length / 2)
    }
    return true
  }

  add(value: Value): this {
    const hash = this.hashValue(value)
    const index = indexFor(hash, this.hashTable.length)
    for (let c = this.hashTable[index]; c != null; c = c.next) {
      const e = c.entry
      if (e != null && e.hash === hash && (e.value === value || this.equalValue(e.value, value))) {
        e.value = value
        return this
      }
    }
    const c = { entry: { value, hash }, next: this.hashTable[index] }
    this.hashTable[index] = c
    this.dataTable.push(c)

    if (this.dataTable.length > this.hashTable.length * 2) {
      if (this.internalSize < this.hashTable.length) {
        this.resize(this.hashTable.length)
      } else {
        this.resize(this.hashTable.length * 2)
      }
    }
    return this
  }

  private resize(bucketSize: number) {
    const newHashTable = new Array<EntryContainer<Value> | null>(bucketSize).fill(null)
    const newDataTable = new Array<EntryContainer<Value>>()
    for (const container of this.dataTable) {
      if (container.entry == null) continue
      const index = indexFor(container.entry.hash, bucketSize)
      container.next = newHashTable[index]
      newHashTable[index] = container
      newDataTable.push(container)
    }
  }

  clear(): void {
    this.internalSize = 0
    this.hashTable = new Array<null>(this.hashTable.length).fill(null)
    this.dataTable = []
  }

  *values(): IterableIterator<Value> {
    for (const { entry } of this.dataTable) {
      if (entry != null) yield entry.value
    }
  }

  [Symbol.iterator](): IterableIterator<Value> {
    return this.values()
  }

  keys(): IterableIterator<Value> {
    return this.values()
  }

  *entries(): IterableIterator<[Value, Value]> {
    for (const { entry } of this.dataTable) {
      if (entry != null) yield [entry.value, entry.value]
    }
  }

  forEach(callback: (value: Value, key: Value, set: this) => void): void {
    for (const { entry } of this.dataTable) {
      if (entry != null) callback(entry.value, entry.value, this)
    }
  }
}

function getInitialBucketSize(numEntries: number): number {
  let n = 2
  while (n < numEntries) n *= 2
  return n
}

function indexFor(hash: number, capacity: number): number {
  return hash & (capacity - 1)
}
