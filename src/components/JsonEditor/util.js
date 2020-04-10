/**
 * 抹平数组解构与对象解构的差异
 * @param {*} value
 */
export function refreshByDeconstruct(value) {
  // primitive
  if (typeof value !== "object" || value === null) return value;

  return Array.isArray(value) ? [...value] : { ...value };
}

/**
 * 获取对象的键的数量
 */
export function getKeyLen(obj) {
  if (isPrimitive(obj)) return 0;

  const arr = Object.values(obj);

  return arr.reduce((acc, current) => acc + getKeyLen(current), arr.length);
}

export function isPrimitive(value) {
  return typeof value !== "object" || value === null;
}

/**
 * 在保证原键值顺序不变的前提下替换键值
 * 若 newKey 为空则删键
 * @param {*} obj
 * @param {*} oldKey
 * @param {*} newKey
 */
export function renameKeyInObj(obj, oldKey, newKey) {
  if (isPrimitive(obj)) throw new TypeError("Object is required!");

  if (!newKey) {
    delete obj[oldKey];

    return refreshByDeconstruct(obj);
  }

  return Object.keys(obj).reduce((acc, key) => {
    if (key === oldKey) {
      acc[newKey] = obj[key];
    } else {
      acc[key] = obj[key];
    }

    return acc;
  }, {});
}
