import cors from 'cors';
import express, { Application } from 'express';
import { config } from './config.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { sessionMiddleware } from './middlewares/session.middleware.js';
import { GameRouter } from './routers/game.router.js';

export class App {
  public app: Application;
  private gameRouter = new GameRouter();

  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.initRouters();
    this.initErrorHandling();
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
    this.app.use('/api/game', this.gameRouter.router);
  }

  private initErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}
