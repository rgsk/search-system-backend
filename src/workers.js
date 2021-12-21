"use strict";
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
let primes = [];
const min = 2;
function generatePrimes(start, range) {
  let isPrime = true;
  let end = start + range;
  for (let i = start; i < end; i++) {
    for (let j = min; j < Math.sqrt(end); j++) {
      if (i !== j && i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
    isPrime = true;
  }
}

if (isMainThread) {
  const process = new Promise((resolve, reject) => {
    const max = 1e7;

    const threadCount = 2;
    const threads = new Set();
    console.log(`Running with ${threadCount} threads...`);
    const range = Math.ceil((max - min) / threadCount);
    let start = min;
    for (let i = 0; i < threadCount - 1; i++) {
      const myStart = start;
      threads.add(
        new Worker(__filename, { workerData: { start: myStart, range } })
      );
      start += range;
    }
    threads.add(
      new Worker(__filename, {
        workerData: { start, range: range + ((max - min + 1) % threadCount) },
      })
    );
    for (let worker of threads) {
      worker.on("error", (err) => {
        throw err;
      });
      worker.on("exit", () => {
        threads.delete(worker);
        console.log(`Thread exiting, ${threads.size} running...`);
        if (threads.size === 0) {
          // console.log(primes.join("\n"));
          resolve(primes);
        }
      });
      worker.on("message", (msg) => {
        // console.log(msg);
        primes = primes.concat(msg);
      });
    }
  });
  (async () => {
    const allPrimes = await process;
    console.log(allPrimes);
  })();
} else {
  generatePrimes(workerData.start, workerData.range);
  console.log("worker finished passing primes");
  // console.log(primes);
  parentPort.postMessage(primes);
}
