import{test as E}from"@playwright/test";import{execSync as o,spawn as v}from"child_process";import f from"http";import*as h from"net";var a=class s{id;port;dbName;cmd;server;static instances=new Set;static cleanupSetup=!1;constructor(t){this.id=t.replace("-","_"),this.port=0,this.dbName="iodome_test",this.cmd=process.env.CI?"start":"dev",s.instances.add(this),this.setupGlobalCleanup()}async setup(){this.port=await this.getFreePort(),this.setupDb(),this.log(`Starting server for test ${this.id} on port ${this.port}`),this.server=v("pnpm",[this.cmd],{env:{...process.env,DATABASE_URL:this.url,PORT:this.port.toString()},stdio:"ignore",detached:process.platform!=="win32"}),this.log(`Server process ${this.server.pid} started for test ${this.id}`),await this.waitForServerReady(this.port),this.log(`Server ready for test ${this.id}`)}setupGlobalCleanup(){if(s.cleanupSetup)return;s.cleanupSetup=!0;let t=()=>{let e=s.instances.size;e>0&&this.log(`Cleaning up ${e} test server${e===1?"":"s"}...`),s.instances.forEach(r=>{r.cleanup()})};process.once("SIGINT",()=>{t(),process.exit(0)}),process.once("SIGTERM",()=>{t(),process.exit(0)}),process.once("exit",t),process.once("uncaughtException",e=>{console.error("Uncaught exception:",e),t(),process.exit(1)}),process.once("unhandledRejection",e=>{console.error("Unhandled rejection:",e),t(),process.exit(1)})}async cleanup(){if(s.instances.delete(this),this.server&&!this.server.killed){this.log(`Killing server process ${this.server.pid}`);try{this.server.pid&&process.kill(-this.server.pid,"SIGTERM")}catch{this.server.kill("SIGTERM")}setTimeout(()=>{if(this.server&&!this.server.killed)try{this.server.pid&&process.kill(-this.server.pid,"SIGKILL")}catch{this.server.kill("SIGKILL")}},2e3)}this.cleanupDb()}get url(){return`postgresql://postgres:postgres@localhost:5432/${this.name}?schema=public`}get name(){return`${this.dbName}_${this.id}`}async getFreePort(){return new Promise((t,e)=>{let r=h.createServer();r.listen(0,()=>{let i=r.address();r.close(),i&&typeof i=="object"?t(i.port):e(new Error("Failed to acquire free port"))})})}setupDb(){this.log(`Creating test database: ${this.name}`),o(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${this.name}' AND pid <> pg_backend_pid();
			"
		`,{stdio:"ignore"}),o(`psql -U postgres -c "DROP DATABASE IF EXISTS ${this.name}"`,{stdio:"ignore"}),o(`psql -U postgres -c "CREATE DATABASE ${this.name}"`,{stdio:"ignore"}),this.log(`Running Prisma migrations for ${this.name}`),o(`DATABASE_URL=${this.url} pnpm prisma db push --accept-data-loss`,{stdio:"ignore"}),this.log(`Database setup complete for ${this.name}`)}cleanupDb(){try{o(`
        psql -U postgres -c "
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE datname = '${this.name}' AND pid <> pg_backend_pid();
        "
      `,{stdio:"ignore"}),o(`psql -U postgres -c "DROP DATABASE IF EXISTS ${this.name}"`,{stdio:"ignore"}),this.log(`Dropped test database: ${this.name}`)}catch(t){process.env.DEBUG_IODOME&&console.warn(`Failed to drop test database ${this.name}:`,t)}}async waitForServerReady(t=6e4){let e=Date.now();return new Promise((r,i)=>{let p=()=>{let d=f.get(`http://127.0.0.1:${this.port}`,l=>{l.statusCode&&l.statusCode<500?r():c()});d.on("error",c),d.end()},c=()=>{Date.now()-e>t?i(new Error("Dev server did not become ready within the timeout period.")):setTimeout(p,100)};p()})}log(t){process.env.DEBUG_IODOME&&console.log(t)}};function b(s){return`postgresql://postgres:postgres@localhost:5432/iodome_test_${s.replace("-","_")}?schema=public`}function u(s){return E.extend({baseURL:[async({},t,e)=>{let{testId:r}=e,i=new a(r);await i.setup(),await t(`http://127.0.0.1:${i.port}`),await i.cleanup()},{scope:"test",timeout:3e4}],prisma:[async({},t,e)=>{let{testId:r}=e,i=new s({datasources:{db:{url:b(r)}},log:process.env.DEBUG?["query","info","warn","error"]:[]});await t(i)},{scope:"test"}]})}import{execSync as n}from"child_process";async function m(){n(`
		psql -U postgres -t -c "
			SELECT datname
			FROM pg_database
			WHERE datname LIKE 'iodome_test%';
		"
	`,{encoding:"utf-8"}).split(`
`).map(e=>e.replace(/│/g,"").trim()).filter(e=>e.length>0).filter(e=>e.includes("iodome_test")).forEach(e=>{n(`
			psql -U postgres -c "
				SELECT pg_terminate_backend(pid)
				FROM pg_stat_activity
				WHERE datname = '${e}' AND pid <> pg_backend_pid();
			"
		`,{stdio:"ignore"}),n(`psql -U postgres -c "DROP DATABASE IF EXISTS "${e}"";`,{stdio:"ignore"})})}import{afterEach as S,beforeEach as T}from"vitest";function g(s){T(async()=>{await s.$queryRaw`BEGIN;`}),S(async()=>{await s.$queryRaw`ROLLBACK;`})}export{u as createTestFixtures,m as dropDatabases,g as useTransactions};
//# sourceMappingURL=index.js.map