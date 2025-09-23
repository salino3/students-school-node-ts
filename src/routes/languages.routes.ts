import { Router } from "express";
import * as languagesControllers from "../controllers/languages.controllers";

const routerLanguages = Router();

routerLanguages.post("/", languagesControllers.addLanguages);

export default routerLanguages;
