import './index.scss';

async function log() {
  const resp = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  console.log(resp);
  return resp;
}

log();
