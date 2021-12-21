import { Router } from "express";
import { countriesController } from "../controllers/countries.controller";
export const countriesRouter = Router();
countriesRouter.get("/", countriesController.getAll);
countriesRouter.get("/count", countriesController.count);
countriesRouter.post("/populate", countriesController.populate);
countriesRouter.get("/search", countriesController.getCountriesWithPrefix);
countriesRouter.post("/", countriesController.create);
countriesRouter.post("/flush", countriesController.flushCountriesTable);
