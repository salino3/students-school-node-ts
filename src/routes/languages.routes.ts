import { Router } from "express";
import * as languagesControllers from "../controllers/languages.controllers";

const routerLanguages = Router();

routerLanguages.post("/", languagesControllers.addLanguage);

routerLanguages.get("/", languagesControllers.getListLanguages);

routerLanguages.get("/:id", languagesControllers.getLanguageById);

routerLanguages.patch("/:id", languagesControllers.updateNameLanguage);

routerLanguages.delete("/:id", languagesControllers.deleteLanguage);

export default routerLanguages;
