import { Set } from './set'
import { makeHashAndEqualFunction } from './util'

test('basics', () => {
  const set = new Set(
    [{ a: 1 }, { a: 2 }],
    makeHashAndEqualFunction(({ a }) => [a])
  )

  expect(set.has({ a: 1 })).toBe(true)
  expect(set.has({ a: 3 })).toBe(false)
  expect(set.size).toBe(2)

  set.delete({ a: 1 })
  expect(set.has({ a: 1 })).toBe(false)
  expect(set.size).toBe(1)

  set.add({ a: 10 })
  set.add({ a: 10 })
  set.add({ a: 11 })
  expect(set.size).toBe(3)
  expect([...set.values()]).toEqual([{ a: 2 }, { a: 10 }, { a: 11 }])
  expect([...set.keys()]).toEqual([{ a: 2 }, { a: 10 }, { a: 11 }])
  expect([...set]).toEqual([{ a: 2 }, { a: 10 }, { a: 11 }])
  expect([...set.entries()]).toEqual([
    [{ a: 2 }, { a: 2 }],
    [{ a: 10 }, { a: 10 }],
    [{ a: 11 }, { a: 11 }]
  ])

  set.clear()
  expect(set.size).toBe(0)
  expect([...set.values()]).toEqual([])
})
