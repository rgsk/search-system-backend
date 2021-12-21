import { Node } from "./Node";
import { fileURLToPath } from "url";

import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
const fileName = fileURLToPath(import.meta.url);
// console.log(fileName);
export class Trie {
  private root: Node;
  constructor() {
    this.root = new Node();
  }
  insert(word: string) {
    let node = this.root;
    for (let i = 0; i < word.length; i++) {
      if (!node.containsKey(word[i])) {
        node.put(word[i], new Node());
      }
      node = node.get(word[i]);
    }
    node.setEnd();
  }
  search(prefix: string) {
    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      if (!node.containsKey(prefix[i])) {
        return false;
      }
      node = node.get(prefix[i]);
    }
    return node.isEnd();
  }
  startsWith(prefix: string) {
    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      if (!node.containsKey(prefix[i])) {
        return false;
      }
      node = node.get(prefix[i]);
    }
    return true;
  }
  async getMatchesWithGivenPrefix(prefix: string) {
    let matches: string[] = [];
    const queue: [string, Node][] = [];
    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      if (!node.containsKey(prefix[i])) {
        return [];
      }
      node = node.get(prefix[i]);
    }
    // generateMatches(prefix, node);
    for (let key of node.getKeys()) {
      queue.push([prefix + key, node.get(key)]);
    }
    const promise = new Promise((resolve, reject) => {
      if (isMainThread) {
        const threads = new Set();
        while (queue.length) {
          const [curString, curNode] = queue.shift()!;
          threads.add(
            new Worker(fileName, { workerData: { curNode, curString } })
          );
        }

        let worker: any;
        for (worker of threads) {
          worker.on("error", (err) => {
            throw err;
          });
          worker.on("exit", () => {
            threads.delete(worker);
            console.log(`Thread exiting, ${threads.size} running...`);
            if (threads.size === 0) {
              // console.log(primes.join("\n"));
              resolve(matches);
            }
          });
          worker.on("message", (msg) => {
            matches = matches.concat(msg);
          });
        }
      } else {
        const threadMatches = generateMatches(
          workerData.curString,
          workerData.curNode
        );
        parentPort!.postMessage(threadMatches);
      }
    });

    await promise;
    return matches;
  }
  merge(trie: Trie) {
    this.root.merge(trie.root);
    return this;
  }
  async insertAll(words: string[]) {
    if (isMainThread) {
      const process = new Promise((resolve, reject) => {
        const max = words.length;
        const threadCount = 5;
        const threads = new Set();
        console.log(`Running with ${threadCount} threads...`);
        const range = Math.ceil(max / threadCount);
        let start = 0;
        for (let i = 0; i < threadCount - 1; i++) {
          const myStart = start;
          threads.add(
            new Worker(fileName, {
              workerData: { start: myStart, range },
            })
          );
          start += range;
        }
        threads.add(
          new Worker(fileName, {
            workerData: {
              start,
              range: range + (max % threadCount),
            },
          })
        );
        let worker: any;
        for (worker of threads) {
          worker.on("error", (err) => {
            throw err;
          });
          worker.on("exit", () => {
            threads.delete(worker);
            console.log(`Thread exiting, ${threads.size} running...`);
            if (threads.size === 0) {
              resolve("populated");
            }
          });
          worker.on("message", (msg) => {
            this.merge(msg);
          });
        }
      });
      await process;
    } else {
      const workerTrie = new Trie();
      workerTrie.insertAll(words.slice(workerData.start, workerData.end));
      parentPort!.postMessage(workerTrie);
    }
  }
}

const generateMatches = (curString: string, curNode: Node) => {
  const matches: string[] = [];
  const queue: [string, Node][] = [];
  queue.push([curString, curNode]);
  while (queue.length) {
    const [curString, curNode] = queue.shift()!;
    if (curNode.isEnd()) {
      matches.push(curString);
    }
    for (let key of curNode.getKeys()) {
      queue.push([curString + key, curNode.get(key)]);
    }
  }
  return matches;
};
