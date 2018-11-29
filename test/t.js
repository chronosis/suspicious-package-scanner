
class T {
  m(content) {
    console.log(content);
  }

  n(content) {
    console.log(content);
  }

  run(content) {
    const results = [];
    const C = Object.getPrototypeOf(this);
    Object.getOwnPropertyNames(C)
      .filter((prop) => {
        return ((typeof this[prop] === 'function') && prop !== 'constructor' && prop !== 'run');
       })
       .forEach((prop) => {
         this[prop](content);
       });
  }
}

const t = new T();
t.run('moo');
