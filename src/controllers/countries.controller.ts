import { Request, Response } from "express";
import { Country } from "../models/Country.model";
import { countriesService } from "../services/countries.service";
export const countriesController = {
  async getAll(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const countries = await countriesService.getAll({ page, limit });
    res.json({
      [Country.tableName]: countries,
    });
  },
  async getCountriesWithPrefix(req: Request, res: Response) {
    const prefix = (req.query.name as string) || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const all = !!req.query.all;
    const countries =
      await countriesService.dbAssistance.getCountriesWithPrefix({
        prefix,
        page,
        limit,
        all,
      });
    res.json({
      total: countries.length,
      [Country.tableName]: countries,
    });
  },
  async getCountriesWithPrefixUsingTreeSet(req: Request, res: Response) {
    const prefix = (req.query.name as string) || "";
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const all = !!req.query.all;
    const countries = await countriesService.treeSet.getCountriesWithPrefix({
      prefix,
      page,
      limit,
      all,
    });
    res.json({
      total: countries.length,
      [Country.tableName]: countries,
    });
  },
  async create(req: Request, res: Response) {
    const uuid: number = req.body.uuid;
    const name: string = req.body.name;
    const name_alt: string = req.body.name_alt;
    const latin: string = req.body.latin;
    const location: string = req.body.location;
    const date: string = req.body.date;

    await countriesService.create({
      uuid,
      name,
      name_alt,
      latin,
      location,
      date,
    });
    res.json({ message: "created" });
  },
  async populate(req: Request, res: Response) {
    const rows = Number(req.query.rows) || 0;
    const times = Number(req.query.times) || 1;
    let timesDone = 0;
    let finished;
    do {
      finished = await countriesService.populateDatabaseWithNextNumCountries(
        rows
      );
      timesDone++;
    } while (!finished && timesDone < times);
    const trieUpdationResult =
      await countriesService.loadDataIntoCountriesTrie();
    res.json({
      message: finished ? `rows added no more left` : `rows added`,
      trieUpdationResult,
    });
  },

  async count(req: Request, res: Response) {
    const rows = await countriesService.count();
    res.json({
      message: `${rows} rows`,
    });
  },
  async flushCountriesTable(req: Request, res: Response) {
    await countriesService.dropTableIfExists();
    await countriesService.createTableIfNotExists();
    res.json({
      message: `dropped table and created empty table successfully`,
    });
  },
};
