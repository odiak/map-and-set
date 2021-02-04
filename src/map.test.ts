import { Map } from './map'
import { makeHashAndEqualFunc } from './util'

test('basics', () => {
  const map = new Map<number, string>(
    [
      [1, 'a'],
      [2, 'b'],
      [100, 'foo']
    ],
    { hash: (n) => n, equal: (n, m) => n === m }
  )

  expect(map.get(1)).toBe('a')
  expect(map.get(2)).toBe('b')
  expect(map.get(99)).toBe(undefined)

  map.set(8, 'eight')
  expect(map.get(8)).toBe('eight')
  expect(map.size).toBe(4)

  map.delete(8)
  expect(map.get(8)).toBe(undefined)
  expect(map.size).toBe(3)

  const map2 = new Map<number, string>(
    null,
    makeHashAndEqualFunc((v) => [v])
  )
  const expected = [] as number[]
  for (let i = 0; i < 100; i++) {
    map2.set(i, String(i))
    if (i % 3 !== 0) {
      expected.push(i)
    }
  }
  for (let i = 99; i >= 0; i -= 3) {
    map2.delete(i)
  }

  expect([...map2.keys()]).toEqual(expected)
})

test('get', () => {
  const map = new Map<[number, string], number>(
    [
      [[1, 'a'], 99],
      [[2, 'foo'], 100]
    ],
    makeHashAndEqualFunc((v) => v)
  )

  expect(map.get([1, 'a'])).toEqual(99)
  expect(map.get([2, 'a'])).toEqual(undefined)
  expect(map.get([2, 'foo'])).toEqual(100)
})

test('set', () => {
  const map = new Map<{ a: number; b: string }, number>(
    null,
    makeHashAndEqualFunc(({ a, b }) => [a, b])
  )

  expect(map.get({ a: 1, b: 'x' })).toBe(undefined)

  map.set({ a: 1, b: 'x' }, 999)
  expect(map.get({ a: 1, b: 'x' })).toBe(999)
})

test('delete', () => {
  const map = new Map<{ a: number; b: string }, number>(
    null,
    makeHashAndEqualFunc(({ a, b }) => [a, b])
  )

  map.set({ a: 1, b: 'x' }, 999)
  expect(map.get({ a: 1, b: 'x' })).toBe(999)
  expect(map.has({ a: 1, b: 'x' })).toBe(true)
  expect(map.size).toBe(1)

  map.delete({ a: 1, b: 'x' })
  expect(map.get({ a: 1, b: 'x' })).toBe(undefined)
  expect(map.has({ a: 1, b: 'x' })).toBe(false)
  expect(map.size).toBe(0)
})

test('clear', () => {
  const map = new Map<string[], number>(
    null,
    makeHashAndEqualFunc((k) => k)
  )
  map.set(['foo', 'bar'], 99)
  map.set(['a', 'b', 'c'], 899)
  expect([...map.entries()]).toEqual([
    [['foo', 'bar'], 99],
    [['a', 'b', 'c'], 899]
  ])
  expect(map.size).toBe(2)

  map.clear()
  expect([...map.entries()]).toEqual([])
  expect(map.size).toBe(0)
})

test('size', () => {
  const map = new Map<number, number>(
    null,
    makeHashAndEqualFunc((v) => [v])
  )

  expect(map.size).toBe(0)

  for (let i = 0; i < 100; i++) {
    map.set(i, i)
  }

  expect(map.size).toBe(100)
})

test('entries', () => {
  const map = new Map<number, number>(
    null,
    makeHashAndEqualFunc((v) => [v])
  )

  map.set(1, 2)
  map.set(2, 3)
  map.set(3, 4)
  map.set(4, 5)

  expect([...map.entries()]).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5]
  ])
  expect([...map]).toEqual([...map.entries()])
})

test('keys', () => {
  const map = new Map(
    [
      ['a', 1],
      ['b', 2],
      ['hello', 3]
    ],
    makeHashAndEqualFunc((v) => [v])
  )

  expect([...map.keys()]).toEqual(['a', 'b', 'hello'])
})

test('values', () => {
  const map = new Map(
    [
      ['a', 1],
      ['b', 2],
      ['hello', 3]
    ],
    makeHashAndEqualFunc((v) => [v])
  )

  expect([...map.values()]).toEqual([1, 2, 3])
})
