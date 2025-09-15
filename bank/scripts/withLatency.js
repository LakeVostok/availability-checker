export const withLatency = (cb) => {
    return async(...args) => {
      const startTime = process.hrtime.bigint();
      const result = await cb(...args);
      const endTime = process.hrtime.bigint();
  
      return [
        result,
        (Number(endTime - startTime) / 1_000_000_000).toFixed(3),
      ]
    }
}
