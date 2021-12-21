import { Node } from "./Node";
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
import path from "path";
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
    let queue: [string, Node][] = [];
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
    console.log(queue);
    const promises: Promise<unknown>[] = [];
    while (queue.length) {
      const [curString, curNode] = queue.shift()!;
      promises.push(generateMatchesWithWorker(curString, curNode));
    }

    const results = await promises[0];
    console.log(results);
    console.log("hiii fdsfdsfdsds");
    console.log(matches);
    return matches;
  }
  merge(trie: Trie) {
    this.root.merge(trie.root);
    return this;
  }
}
const generateMatchesWithWorker = (curString: string, curNode: Node) => {
  return new Promise((resolve, reject) => {
    let worker = new Worker(path.join(__dirname, "worker.js"));
    // wait for a message and resolve
    worker.on("message", ({ data }) => resolve(data));
    // if we get an error, reject
    worker.onerror = reject;
    // post a message to the worker
    worker.postMessage(generateMatches(curString, curNode));
  });
};
const generateMatches = (curString: string, curNode: Node) => {
  // console.log(curString);
  // only main thread console.log will work
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
