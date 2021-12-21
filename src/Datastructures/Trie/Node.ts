export class Node {
  private links: { [key: string]: Node | undefined };
  private flag: boolean;
  constructor() {
    this.links = {};
    this.flag = false;
  }
  getKeys() {
    return Object.keys(this.links);
  }
  containsKey(char: string) {
    return !!this.links[char];
  }
  put(char: string, node: Node) {
    this.links[char] = node;
  }
  get(char: string) {
    return this.links[char]!;
  }
  setEnd() {
    this.flag = true;
  }
  isEnd() {
    return this.flag;
  }
  merge(node: Node) {
    for (let key of node.getKeys()) {
      if (!this.containsKey(key)) {
        this.put(key, node.get(key));
      } else {
        this.get(key).merge(node.get(key));
      }
    }
  }
}
