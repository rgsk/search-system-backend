// @ts-ignore
import methods from "../build/Release/native.node";
// test.populate(["rahul", "mehak", "amani", "rohit", "raman1", "rima"]);
// console.log(test.startsWith("r"));
// console.log(test.search("rah"));
// console.log(test.search("ram"));
// console.log(test.search("rahu"));
// console.log(test.getMatches("r"));

export const trieCpp = {
  populate: (words: string[]) => {
    methods.populate(words);
  },
  getMatches: (prefix: string) => {
    return methods.getMatches(prefix);
  },
};
