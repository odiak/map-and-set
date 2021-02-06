type DataTableEntry = {
  key: unknown
  value: unknown
  hash: number
  next: number
}

export type MapKeyOptions<Key> = {
  hash(key: Key): number
  equal(key1: Key, key2: Key): boolean
}

const absence = Object.freeze({})
const maxCapacity = 2 ** 30

export class Map<Key, Value> {
  private hashKey: (key: Key) => number
  private equalKey: (key1: Key, key2: Key) => boolean
  private hashTable: Array<number>
  private dataTable: Array<DataTableEntry | null>
  private nextSlot = 0
  private internalSize = 0

  constructor(iterable: Iterable<[Key, Value]> | undefined | null, keyOption: MapKeyOptions<Key>) {
    this.hashKey = keyOption.hash
    this.equalKey = keyOption.equal

    const bucketSize = 2
    this.hashTable = new Array(bucketSize).fill(-1)
    this.dataTable = new Array(bucketSize * 2).fill(null)

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
    this.hashTable = new Array(this.hashTable.length).fill(-1)
    this.dataTable = new Array(this.dataTable.length).fill(null)
    this.nextSlot = 0
    this.internalSize = 0
  }

  private getEntry(key: Key): DataTableEntry | null {
    const hash = hashNumber(this.hashKey(key))
    const index = indexFor(hash, this.hashTable.length)
    let i = this.hashTable[index]
    while (i !== -1) {
      const e = this.dataTable[i]!
      if (e.key !== absence && e.hash === hash) {
        const otherKey = e.key as Key
        if (otherKey === key || this.equalKey(otherKey, key)) {
          return e
        }
      }
      i = e.next
    }
    return null
  }

  delete(key: Key): boolean {
    const e = this.getEntry(key)
    if (e == null) return false
    e.key = absence
    e.value = absence
    this.internalSize--
    if (this.hashTable.length > 2 && this.internalSize < this.dataTable.length / 2) {
      this.resize(this.hashTable.length / 2)
    }
    return true
  }

  get(key: Key): Value | undefined {
    return this.getEntry(key)?.value as Value | undefined
  }

  has(key: Key): boolean {
    return this.getEntry(key) != null
  }

  set(key: Key, value: Value): this {
    const hash = hashNumber(this.hashKey(key))
    const index = indexFor(hash, this.hashTable.length)
    let i = this.hashTable[index]
    while (i !== -1) {
      const e = this.dataTable[i]!
      if (e.key !== absence && e.hash === hash) {
        const otherKey = e.key as Key
        if (otherKey === key || this.equalKey(otherKey, key)) {
          e.value = value
          return this
        }
      }
      i = e.next
    }
    if (this.nextSlot >= this.dataTable.length) {
      if (this.internalSize < this.dataTable.length) {
        this.resize(this.hashTable.length)
      } else {
        this.resize(this.hashTable.length * 2)
      }
    }
    const e = { key, value, hash, next: this.hashTable[index] }
    this.hashTable[index] = this.nextSlot
    this.dataTable[this.nextSlot] = e
    this.nextSlot++
    this.internalSize++
    return this
  }

  private resize(bucketSize: number) {
    const capacity = bucketSize * 2
    if (capacity > maxCapacity) {
      throw new Error('maximum capacity exceeded')
    }

    const oldDataTable = this.dataTable as Array<DataTableEntry>
    const hashTable = new Array(bucketSize).fill(-1)
    const dataTable = new Array(capacity).fill(null)
    let nextSlot = 0
    for (const e of oldDataTable) {
      if (e.key === absence) continue
      const index = indexFor(e.hash, bucketSize)
      e.next = hashTable[index]
      hashTable[index] = nextSlot
      dataTable[nextSlot] = e
      nextSlot++
    }
    this.nextSlot = nextSlot
    this.hashTable = hashTable
    this.dataTable = dataTable
  }

  *entries(): IterableIterator<[Key, Value]> {
    for (let i = 0; i < this.nextSlot; i++) {
      const e = this.dataTable[i]!
      if (e.key === absence) continue
      yield [e.key as Key, e.value as Value]
    }
  }

  [Symbol.iterator](): IterableIterator<[Key, Value]> {
    return this.entries()
  }

  *keys(): IterableIterator<Key> {
    for (let i = 0; i < this.nextSlot; i++) {
      const e = this.dataTable[i]!
      if (e.key === absence) continue
      yield e.key as Key
    }
  }

  *values(): IterableIterator<Value> {
    for (let i = 0; i < this.nextSlot; i++) {
      const e = this.dataTable[i]!
      if (e.key === absence) continue
      yield e.value as Value
    }
  }

  forEach(callback: (value: Value, key: Key, map: this) => void): void {
    for (let i = 0; i < this.nextSlot; i++) {
      const e = this.dataTable[i]!
      if (e.key === absence) continue
      callback(e.value as Value, e.key as Key, this)
    }
  }
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
