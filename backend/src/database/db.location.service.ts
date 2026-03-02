import { Injectable } from "@nestjs/common";
import { DbService } from "./db.service";

@Injectable()
export class BlogDatabaseService {
  // need to give a db service as param when used. -> see db.service.
  constructor(private db: DbService) {}
}
