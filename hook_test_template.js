// v100

function preSavePage(options) {
  return {
    data: options.data,
    errors: options.errors,
    abort: false
  }
}

const options = "{Insert sample data from IO}";

const result = preSavePage(options);
console.log(result);