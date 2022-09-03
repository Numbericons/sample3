// v101
function preSavePage(options) {
  const retLines = { lines: [] };

  for (let k = 0; k < options.data.length; k++) {
    options.data[k].intAmount = parseFloat(options.data[k].Amount)
    retLines.lines.push(options.data[k]);
  }

  return {
    data: [retLines],
    errors: options.errors,
    abort: false,
    newErrorsAndRetryData: []
  }
}