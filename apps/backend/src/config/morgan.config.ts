import morgan from 'morgan';

export const morganConfig = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
);
