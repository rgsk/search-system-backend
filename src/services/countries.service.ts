import { db } from "../db";
import { Country } from "../models/Country.model";
import path from "path";
import lineReader from "line-reader";
import { Trie } from "../Datastructures/Trie/Trie";
import { trieCpp } from "../trieCpp";

const allCountriesTxtFilePath = path.join(path.resolve(), "allCountries.txt");
// console.log(allCountriesTxtFilePath);
let allCountriesTxtReader: Reader;
lineReader.open(allCountriesTxtFilePath, (err, reader) => {
  allCountriesTxtReader = reader;
});
let countriesTrie = new Trie();
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
  dbAssistance: {
    populateCountryNamesFromCountriesTable: async () => {
      await db.raw(`
         insert into countryNames 
          (name)
          select distinct name from countries;
      `);
    },
    dropCountriesNamesTableIfExists: async () => {
      if (await db.schema.hasTable("countryNames")) {
        await db.schema.dropTable("countryNames");
        console.log(`dropped countryNames table`);
      }
    },
    createCountriesNamesTableIfNotExists: async () => {
      if (!(await db.schema.hasTable("countryNames"))) {
        await db.schema.createTable("countryNames", (table) => {
          table.string("name").primary();
        });
        console.log(`created countryNames table`);
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
      let query = `select name from countryNames where name like ?`;
      if (!all) {
        query += ` offset ${(page - 1) * limit} limit ${limit}`;
      }
      const res = await db.raw(query, [`${prefix}%`]);
      const names = res.rows.map((v) => v.name);
      return names;
    },
    populateDatabaseWithNextNumCountries: async (num: number) => {
      const fetchedCountries: string[] = [];
      const add = () =>
        new Promise((resolve, reject) => {
          if (allCountriesTxtReader.hasNextLine()) {
            allCountriesTxtReader.nextLine(async (err, line) => {
              const country = processLineFromTextFile(line!);
              fetchedCountries.push(country.name);
              // console.log(result);
              resolve("fetched the country");
            });
          } else {
            reject("finished");
          }
        });
      const inserIntoDb = async () => {
        const uniqueNames = [...new Set(fetchedCountries)];
        const row = uniqueNames.map((v) => ({
          name: v,
        }));
        await db("countryNames").insert(row);
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
  fetchNumCountriesFromDB: async (num: number) => {
    const countries: Country[] = await db
      .select("name", "name_alt")
      .from(Country.tableName)
      .limit(num);
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
