import { Map } from './map'

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
})
