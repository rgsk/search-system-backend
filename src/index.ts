import "dotenv/config";
import express from "express";
import cors from "cors";
import { TrieTest } from "./tests/trie.test";
import { countriesRouter } from "./routes/countries.route";
import { countriesService } from "./services/countries.service";
import { db } from "./db";
import { constants } from "./constants";
constants;
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Growth School Assignment",
  });
});
app.use("/countries", countriesRouter);

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  // await populateDatabase();
  // await countriesService.cpp.loadDataIntoCountriesTrie();
  // await testing();
  // await populateCountryNamesTable();
  // const prefix = "Ra";
  // const res = await db.raw(`select name from countryNames where name like ?`, [
  //   `\\'${prefix}\\%\\'`,
  // ]);
  // const q = db
  //   .raw(`select name from countryNames where name like ?`, [`${prefix}%`])
  //   .toQuery();
  // const res = await db.raw(`select name from countryNames where name like ?`, [
  //   `${prefix}%`,
  // ]);
  // console.log(res.rows);
  // await testing();

  console.log("listening on PORT: " + PORT);
  await countriesService.treeSet.loadDataIntoCountriesSet();
});
const populateDatabase = async () => {
  await countriesService.dropTableIfExists();
  await countriesService.createTableIfNotExists();
  console.log("populating data from text file to db");
  let finished;
  do {
    finished = await countriesService.populateDatabaseWithNextNumCountries(
      5000
    );
  } while (!finished);
  console.log("finished populating data from text file to db");
};
const populateCountryNamesTable = async () => {
  await countriesService.dbAssistance.dropCountriesNamesTableIfExists();
  await countriesService.dbAssistance.createCountriesNamesTableIfNotExists();
  console.log("populating countryNames from coutries table");
  await countriesService.dbAssistance.populateCountryNamesFromCountriesTable();
  console.log("finished populating countryNames from coutries table");
  // console.log("populating data from text file to db");
  // let finished;
  // do {
  //   finished =
  //     await countriesService.dbAssistance.populateDatabaseWithNextNumCountries(
  //       5000
  //     );
  // } while (!finished);
  // console.log("finished populating data from text file to db");
};
const testing = async () => {
  const trieTest = new TrieTest();
  // await trieTest.main();
  // trieTest.cpp();
  await trieTest.set();
};
