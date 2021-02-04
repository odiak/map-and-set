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

test('resizing', () => {
  const map = new Map<number, number>(
    null,
    makeHashAndEqualFunc((v) => [v])
  )

  for (let i = 0; i < 100; i++) {
    map.set(i, i)
  }

  expect(map.get(4)).toEqual(4)
  expect(map.get(50)).toEqual(50)
  expect(map.size).toEqual(100)
})
