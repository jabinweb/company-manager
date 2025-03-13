export function deepMerge<T extends object = object>(...objects: (T | undefined)[]) {
  return objects.reduce((prev, obj) => {
    if (!obj) return prev
    
    Object.keys(obj).forEach(key => {
      const pVal = prev[key]
      const oVal = obj[key]
      
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = Array.from(new Set([...pVal, ...oVal]))
      }
      else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = deepMerge(pVal, oVal)
      }
      else {
        prev[key] = oVal
      }
    })
    
    return prev
  }, {}) as T
}

function isObject(item: any): item is object {
  return (item && typeof item === 'object' && !Array.isArray(item))
}
