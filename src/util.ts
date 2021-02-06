export type HashAndEqual<T> = {
  hash(value: T): number
  equal(value1: T, value2: T): boolean
}

type Primitive = number | string | boolean | null | undefined

export function hashCodeFromString(s: string): number {
  let h = 1
  for (let i = 0; i < s.length; i++) {
    h = h * 31 + s.charCodeAt(i)
  }
  return h
}

const hashCodeOfPositiveInfinity = hashCodeFromString('Infinity')
const hashCodeOfNegativeInfinity = hashCodeFromString('-Infinity')
const hashCodeOfNan = hashCodeFromString('NaN')

const hashCodeOfTrue = hashCodeFromString('true')
const hashCodeOfFalse = hashCodeFromString('false')

const hashCodeOfNull = hashCodeFromString('null')
const hashCodeOfUndefined = hashCodeFromString('undefined')

export function hashCodeFromNumber(n: number): number {
  if (Number.isInteger(n)) {
    let hash = n
    hash = ~hash + (hash << 15)
    hash = hash ^ (hash >> 12)
    hash = hash + (hash << 2)
    hash = hash ^ (hash >> 4)
    hash = hash * 2057
    hash = hash ^ (hash >> 16)
    return hash & 0x3fffffff
  } else if (n === Number.POSITIVE_INFINITY) {
    return hashCodeOfPositiveInfinity
  } else if (n === Number.NEGATIVE_INFINITY) {
    return hashCodeOfNegativeInfinity
  } else if (Number.isNaN(n)) {
    return hashCodeOfNan
  } else {
    return hashCodeFromString(n.toString())
  }
}

export function hashCodeFromPrimitiveArray(array: Array<Primitive>): number {
  return array.reduce((acc: number, e) => {
    let h = 0
    switch (typeof e) {
      case 'number':
        h = hashCodeFromNumber(e)
        break

      case 'boolean':
        h = e ? hashCodeOfTrue : hashCodeOfFalse
        break

      case 'string':
        h = hashCodeFromString(e)
        break

      case 'undefined':
        h = hashCodeOfUndefined
        break

      case 'object': // case of null
        h = hashCodeOfNull
        break
    }
    return acc * 31 + h
  }, 1)
}

export function makeHashAndEqualFunction<T>(
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
