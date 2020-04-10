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
