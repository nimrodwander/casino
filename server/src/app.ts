import cors from 'cors';
import express, { Application } from 'express';
import { config } from './config.js';
import { sessionMiddleware } from './config/session.config.js';
import { SessionRouter } from './routers/session.router.js';

export class App {
  public app: Application;
  private sessionRouter = new SessionRouter();

  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.initRouters();
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Casino server running on http://localhost:${port}`);
    });
  }

  private initMiddlewares(): void {
    this.app.use(cors({
      origin: config.clientUrl,
      credentials: true,
    }));
    this.app.use(express.json());
    this.app.use(sessionMiddleware);
  }

  private initRouters(): void {
    this.app.use('/api/session', this.sessionRouter.router);
  }
}
