import * as path from 'path';

export default () => ({
   port: process.env.PORT,
   host: process.env.HOST,
   database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      db: process.env.DATABASE_NAME
   },
   storePath: path.resolve(__dirname, '../..', 'store')
});
