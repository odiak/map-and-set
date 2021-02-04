export type HashAndEqual<T> = {
  hash(value: T): number
  equal(value1: T, value2: T): boolean
}

type Primitive = number | string | boolean | null | undefined

export function hashCodeFromPrimitiveArray(array: Array<Primitive>): number {
  return array.reduce((acc: number, e) => {
    let h = 0
    switch (typeof e) {
      case 'number':
        h = e
        break

      case 'boolean':
        h = e ? 1231 : 1237
        break

      case 'string':
        h = hashCodeFromString(e)
        break

      case 'undefined':
        h = 11
        break

      case 'object': // case of null
        h = 12
        break
    }
    return acc * 31 + h
  }, 1)
}

export function hashCodeFromString(s: string): number {
  let h = 1
  for (let i = 0; i < s.length; i++) {
    h = h * 31 + s.charCodeAt(i)
  }
  return h
}

export function makeHashAndEqualFunc<T>(
  extractFeature: (value: T) => Array<Primitive>
): HashAndEqual<T> {
  return {
    hash(value: T): number {
      return hashCodeFromPrimitiveArray(extractFeature(value))
    },
    equal(value1: T, value2: T): boolean {
      const array1 = extractFeature(value1)
      const array2 = extractFeature(value2)
      return array1.length === array2.length && array1.every((v, i) => v === array2[i])
    }
  }
}
