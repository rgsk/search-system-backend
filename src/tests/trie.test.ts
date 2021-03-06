import { Trie } from "../Datastructures/Trie/Trie";
import { countriesService } from "../services/countries.service";
import { cppHook } from "../cppHook";
import fs from "fs";
import path from "path";
import { TreeMultiSet } from "jstreemap";
const filePath = path.join(path.resolve(), "input.txt");
// console.log(filePath);
export class TrieTest {
  trie: Trie;
  constructor() {
    this.trie = new Trie();
  }
  async main() {
    const names = [
      "Rahul",
      "Mehak",
      "Aman",
      "Pankaj",
      "Manu",
      "Vishesh",
      "Rama",
      "Ramaan Gupta",
    ];
    // for (let name of names) {
    //   this.trie.insert(name);
    // }
    await this.trie.insertAll(names);
    console.log(this.trie.search("Rahul"));
    console.log(this.trie.startsWith("Rah"));
    console.log(this.trie.startsWith("Rahy"));
    console.log(this.trie.search("Rahu"));
    console.log(await this.trie.getMatchesWithGivenPrefix("R"));
  }
  async merge() {
    const trie1 = new Trie();
    trie1.insert("Rahul");
    const trie2 = new Trie();
    trie1.insert("Riman");
    trie1.insert("Rekan");
    trie1.insert("Rekam");
    // trie1.merge(trie2);
    const values = await trie1.getMatchesWithGivenPrefix("R");
    console.log(values);
  }
  async cpp() {
    const names = [
      "Rahul",
      "Mehak",
      "Aman",
      "Pankaj",
      "Manu",
      "Vishesh",
      "Rama",
      "Ramaan Gupta",
    ];
    const uuids = names.map((v) => 324);
    // const countries = await countriesService.fetchCountriesFromDB();
    // console.log(data);
    // const countryNames = countries.map((c) => c.name);
    // console.log(countryNames)
    // const data = fs.readFileSync(filePath);
    // console.log(data.toString());
    // var stream = fs.createWriteStream(filePath);
    // stream.once("open", function (fd) {
    //   for (let country of countryNames) {
    //     stream.write(country + "\n");
    //   }

    //   stream.end();
    // });
    cppHook.populateMap(names, uuids);
    // "Ram", 2, 1, true
    console.log(
      cppHook.getMatchesFromMap({
        prefix: "Ra",
        page: 1,
        limit: 1,
        all: true,
        turbo: true,
      })
    );
  }
  async set() {
    let set = new TreeMultiSet();
    const names = [
      "Rahul",
      "Mehak",
      "Aman",
      "Pankaj",
      "Manu",
      "Vishesh",
      "Rama",
      "Ramaan Gupta",
      "Rahul",
    ];
    // const countries = await countriesService.fetchNumCountriesFromDB(1000000);
    // // console.log(countries);
    // const countryNames = countries.map((c) => c.name);
    for (let name of names) {
      set.add(name);
    }
    let prefix = "Ra";
    let upper =
      prefix.substring(0, prefix.length - 1) +
      String.fromCharCode(prefix[prefix.length - 1].charCodeAt(0) + 1);
    for (
      let it = set.lowerBound(String.fromCharCode(0));
      !it.equals(set.upperBound(String.fromCharCode(255)));
      it.next()
    ) {
      console.log(it.key);
    }
  }
}
