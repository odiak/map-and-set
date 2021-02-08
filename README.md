# map-and-set

This package provides Map and Set implementations that have very similar API to ECMAScript's Map and Set.

Unlike ECMAScript's ones, they have hash and equality functions.
You can use objects for keys of Map and values of Set without worrying about objects' identity.

Implementations of Map and Set are inspired by an article: [\[V8 Deep Dives\] Understanding Map Internals \| by Andrey Pechkurov \| ITNEXT](https://itnext.io/v8-deep-dives-understanding-map-internals-45eb94a183df).
Thanks Andrey.

## Install

You can install it with npm.

```console
npm install map-and-set
```

## Example

```typescript
import { Map, Set, makeHashAndEqualFunction } from 'map-and-set'

interface User {
  id: number
  name: string
}

const map = new Map<User, number>(null, {
  hash: (user) => user.id,
  equal: (user1, user2) => user1.id === user2.id
})

// You can write shortly with utility function
const map_ = new Map<User, number>(
  null,
  makeHashAndEqualFunction((user) => [user.id])
)

map.set({ id: 1, name: 'Tom' }, 99)
map.set({ id: 2, name: 'Michael' }, 100)

map.get({ id: 1, name: 'Tom' }) // => 99
map.has({ id: 1, name: 'Tom' }) // => true
map.has({ id: 1, name: 'Unknown' }) // => true
map.has({ id: 3, name: 'Tom' }) // => false

map.delete({ id: 1 })
map.has({ id: 1, name: 'Tom' }) // => false

const set = new Set<User>(
  null,
  makeHashAndEqualityFunction((user) => [user.id])
)

set.add({ id: 10, name: 'Tomoko' })
set.add({ id: 11, name: 'Yuya' })

set.has({ id: 10, name: 'Tomoko' }) // => true
set.has({ id: 10, name: 'Unknown' }) // => true
set.has({ id: 11, name: 'Yuya' }) // => true
set.has({ id: 99, name: 'Unknown' }) // => false

set.delete({ id: 11, name: 'Yuya' })
set.has({ id: 11, name: 'Yuya' }) // => false
```

## License

MIT
