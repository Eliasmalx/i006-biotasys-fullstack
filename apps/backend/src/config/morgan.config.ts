import morgan from 'morgan';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const morganConfig = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
);
