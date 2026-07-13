const { Client } = require('pg');

const passwords = ['postgres_secure_password'];

async function test() {
  for (const pw of passwords) {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres', // default db
      password: pw,
      port: 5432,
    });
    try {
      await client.connect();
      console.log(`SUCCESS with password: "${pw}"`);
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed with password: "${pw}" - Error: ${err.message}`);
    }
  }
}

test();
