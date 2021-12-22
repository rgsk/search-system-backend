import { db } from "../db";
import { Country } from "../models/Country.model";
import path from "path";
import lineReader from "line-reader";
import { Trie } from "../Datastructures/Trie/Trie";
import { trieCpp } from "../trieCpp";
import { TreeSet } from "jstreemap";

const allCountriesTxtFilePath = path.join(path.resolve(), "allCountries.txt");
// console.log(allCountriesTxtFilePath);
let allCountriesTxtReader: Reader;
lineReader.open(allCountriesTxtFilePath, (err, reader) => {
  allCountriesTxtReader = reader;
});
let countriesTrie = new Trie();
let countriesSet = new TreeSet<string>();
//
export const countriesService = {
  getAll: async ({ page, limit }: { page: number; limit: number }) => {
    const countries = await db
      .select("*")
      .from(Country.tableName)
      .limit(limit)
      .offset((page - 1) * limit);
    return countries;
  },
  create: async (countryData: {
    uuid: number;
    name: string;
    name_alt: string;
    latin: string;
    location: string;
    date: string;
  }) => {
    const country = new Country(countryData);
    await db(Country.tableName).insert(country);
  },
  count: async () => {
    const count = await db(Country.tableName).count("uuid");
    return +count[0].count;
  },
  treeSet: {
    loadDataIntoCountriesSet: async () => {
      const countries = await countriesService.fetchNumCountriesFromDB();
      // console.log(countries);

      const countryNames = countries.map((c) => c.name);
      console.log("populating set");
      for (let name of countryNames) {
        countriesSet.add(name);
      }
      console.log("finished populating set");
    },
    getCountriesWithPrefix: async ({
      prefix,
      page,
      limit,
      all,
    }: {
      prefix: string;
      page: number;
      limit: number;
      all: boolean;
    }) => {
      const matches: string[] = [];
      let upper =
        prefix.substring(0, prefix.length - 1) +
        String.fromCharCode(prefix[prefix.length - 1].charCodeAt(0) + 1);
      for (
        let it = countriesSet.lowerBound(prefix);
        !it.equals(countriesSet.upperBound(upper));
        it.next()
      ) {
        matches.push(it.key);
      }
      return matches;
    },
  },
  dbAssistance: {
    dropCountriesNamesTableIfExists: async () => {
      if (await db.schema.hasTable("names")) {
        await db.schema.dropTable("names");
        console.log(`dropped names table`);
      }
    },
    createCountriesNamesTableIfNotExists: async () => {
      if (!(await db.schema.hasTable("names"))) {
        await db.schema.createTable("names", (table) => {
          table.bigInteger("uuid").primary();
          table.string("name");
        });
        console.log(`created names table`);
      }
    },
    getCountriesWithPrefix: async ({
      prefix,
      page,
      limit,
      all,
    }: {
      prefix: string;
      page: number;
      limit: number;
      all: boolean;
    }) => {
      // select *, count(*) over() from names where name like 'A%' limit 100
      let query = `select  *, count(*) over() from names where name like ?`;
      if (!all) {
        query += ` offset ${(page - 1) * limit} limit ${limit}`;
      }
      const res = await db.raw(query, [`${prefix}%`]);
      const countries = res.rows.map((c) => {
        return { uuid: c.uuid, name: c.name };
      });

      const total = res.rows[0]?.count || 0;
      return { countries, total };
    },
    populateDatabaseWithNextNumCountries: async (num: number) => {
      const fetchedCountries: Country[] = [];
      const add = () =>
        new Promise((resolve, reject) => {
          if (allCountriesTxtReader.hasNextLine()) {
            allCountriesTxtReader.nextLine(async (err, line) => {
              const country = processLineFromTextFile(line!);
              fetchedCountries.push(country);
              // console.log(result);
              resolve("fetched the country");
            });
          } else {
            reject("finished");
          }
        });
      const inserIntoDb = async () => {
        const rows = fetchedCountries.map((v) => {
          return {
            uuid: v.uuid,
            name: v.name,
          };
        });
        await db("names").insert(rows);
      };
      for (let i = 0; i < num; i++) {
        try {
          await add();
        } catch (err) {
          await inserIntoDb();
          return true;
        }
      }
      await inserIntoDb();
      return false;
    },
  },
  cpp: {
    loadDataIntoCountriesTrie: async () => {
      const countries: Country[] = await db
        .select("name")
        .from(Country.tableName)
        .limit(10);
      // console.log(countries);
      const countryNames = countries.map((c) => c.name);
      trieCpp.populate(countryNames);
      return {
        message: "populated countryTrie with country names",
        totalRows: countries.length,
      };
    },

    getCountriesWithPrefix: async ({
      prefix,
      page,
      limit,
    }: {
      prefix: string;
      page: number;
      limit: number;
    }) => {
      const countryNames = trieCpp.getMatches(prefix);
      // const countries: Country[] = await db
      //   .select("*")
      //   .from(Country.tableName)
      //   .whereIn("name", countryNames)
      //   .limit(limit)
      //   .offset((page - 1) * limit);
      return countryNames;
    },
  },
  loadDataIntoCountriesTrie: async () => {
    countriesTrie = new Trie();
    const countries: Partial<Country>[] = await db
      .select("name")
      .from(Country.tableName)
      .limit(1000);
    // console.log(countries);

    countriesTrie.insertAll(countries.map((c) => c.name!));
    return {
      message: "populated countryTrie with country names",
      totalRows: countries.length,
    };
  },

  getCountriesWithPrefix: async ({
    prefix,
    page,
    limit,
  }: {
    prefix: string;
    page: number;
    limit: number;
  }) => {
    const countryNames = countriesTrie.getMatchesWithGivenPrefix(prefix);
    // const countries: Country[] = await db
    //   .select("*")
    //   .from(Country.tableName)
    //   .whereIn("name", countryNames)
    //   .limit(limit)
    //   .offset((page - 1) * limit);
    return countryNames;
  },
  createTableIfNotExists: async () => {
    if (!(await db.schema.hasTable(Country.tableName))) {
      await db.schema.createTable(Country.tableName, (table) => {
        table.bigInteger("uuid").primary();
        table.string("name");
        table.string("name_alt");
        table.text("latin");
        table.string("location");
        table.date("date");
      });
      console.log(`created ${Country.tableName} table`);
    }
  },

  dropTableIfExists: async () => {
    if (await db.schema.hasTable(Country.tableName)) {
      await db.schema.dropTable(Country.tableName);
      console.log(`dropped ${Country.tableName} table`);
    }
  },
  populateDatabaseWithNextNumCountries: async (num: number) => {
    const fetchedCountries: Country[] = [];
    const add = () =>
      new Promise((resolve, reject) => {
        if (allCountriesTxtReader.hasNextLine()) {
          allCountriesTxtReader.nextLine(async (err, line) => {
            const country = processLineFromTextFile(line!);
            fetchedCountries.push(country);
            // console.log(result);
            resolve("fetched the country");
          });
        } else {
          reject("finished");
        }
      });
    for (let i = 0; i < num; i++) {
      try {
        await add();
      } catch (err) {
        await db(Country.tableName).insert(fetchedCountries);
        return true;
      }
    }
    await db(Country.tableName).insert(fetchedCountries);
    return false;
  },
  fetchNumCountriesFromDB: async (num: number = 0) => {
    const countries: Country[] = await db.select("name").from("countries");
    // .limit(num);
    return countries;
  },

  fetchNextNumCountriesTxtFile: async (num: number) => {
    console.log(num);
    const fetchedCountries: Country[] = [];
    const add = () =>
      new Promise((resolve, reject) => {
        console.log(allCountriesTxtReader.hasNextLine());
        if (allCountriesTxtReader.hasNextLine()) {
          allCountriesTxtReader.nextLine(async (err, line) => {
            console.log(line);
            const country = processLineFromTextFile(line!);
            console.log(country);
            fetchedCountries.push(country);
            // console.log(result);
            resolve("fetched the country");
          });
        } else {
          reject("finished");
        }
      });
    for (let i = 0; i < num; i++) {
      try {
        console.log(i);
        await add();
      } catch (err) {
        // return {
        //   countries: fetchedCountries,
        //   finished: true,
        // };
      }
    }
    function timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    await timeout(5000);
    return {
      countries: fetchedCountries,
      finished: false,
    };
  },
};
const processLineFromTextFile = (line: string) => {
  const row = line.split(/\t/);

  const uuid = +row[0];
  const name = row[1];
  const name_alt = row[2];
  const latin = row[3];
  const location = row[17];
  const date = row[18];
  const country = new Country({
    uuid,
    name,
    name_alt,
    latin,
    location,
    date,
  });
  return country;
};
