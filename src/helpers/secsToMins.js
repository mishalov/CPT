export const secsToMins = secs => {
  const fullSecs = Math.trunc(secs);
  const deciSecs = fullSecs % 60;
  const toOut = `${Math.floor(fullSecs / 60)}:${
    deciSecs < 10 ? "0" + deciSecs : deciSecs
  }`;
  return toOut;
};
