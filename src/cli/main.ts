import { Cli } from "./cli";
import { CliArgsClass } from "./cliArgs";
import { configureServices } from './services';

async function run() {
    const clientArgs = new CliArgsClass().cliArgs;
    const services = await configureServices(clientArgs);
    new Cli(services).runClient(clientArgs);
}

run();

