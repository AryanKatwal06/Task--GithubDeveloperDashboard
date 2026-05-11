/**
 * Type Declarations for react-native-sqlite-storage
 *
 * This package doesn't include TypeScript types, so we define them here
 */

declare module 'react-native-sqlite-storage' {
  export interface SQLResultSet {
    rows: {
      length: number;
      item(index: number): Record<string, any>;
    };
    rowsAffected: number;
    insertId?: number;
  }

  export interface SQLiteDatabase {
    executeSql(
      sql: string,
      params?: (string | number)[],
      success?: (result: SQLResultSet) => void,
      error?: (err: Error) => void
    ): Promise<[SQLResultSet]>;
    close(): Promise<void>;
  }

  export interface SQLiteOpenDatabase {
    location?: string;
    name: string;
    iosDatabaseLocation?: string;
  }

  export const Database: {
    enablePromise(enable: boolean): void;
    DEBUG(enable: boolean): void;
    openDatabase(
      options: SQLiteOpenDatabase,
      success?: () => void,
      error?: (err: Error) => void
    ): Promise<SQLiteDatabase>;
  };

  export default Database;
}
