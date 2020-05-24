import path from "path";
import fs from "fs";

import deldir from "rimraf";

import { exec } from "child_process";
import { promisify } from "util";

const RunCommandAsync = promisify(exec);

type CliOptions = "--filename" | "--file" | "--directory" ;

type CliOption = [CliOptions, string];

const CLI_PATH = "dist/index.js";

const cli = (...options: CliOption[]) => {
    
    const parsedOptions = options.map(option => option.join(" ")).join(" ");

    return RunCommandAsync(`node ${CLI_PATH} ${parsedOptions}`);
}

test("Fails if there is not .env at process.cwd()", async () => {
    const { stderr, stdout } = await cli();

    expect(stdout).toBeFalsy();
    expect(stderr.trim()).toBe("ERROR! Could not find .env!");
});

test("Creates env.d.ts wtih .env.test fron samples folder", async () => {
    const { stderr, stdout } = await cli(["--file", "tests/samples/.env.test"]);

    const outputPath = path.join(process.cwd(), "env.d.ts");

    const output = fs.readFileSync(outputPath);

    expect(stderr).toBeFalsy()
    expect(stdout).toBeTruthy();

    expect(output.includes("MY_VAR: string;")).toBeTruthy();

    fs.unlinkSync(outputPath);

})

const CUSTOM_FILENAME = "myenv.d.ts";

test(`Creates declaration file with custom filename (${CUSTOM_FILENAME})`, async () => {
    const { stderr, stdout } = await cli(["--file", "tests/samples/.env.test"], ["--filename", CUSTOM_FILENAME]);

    const outputPath = path.join(process.cwd(), CUSTOM_FILENAME);

    const output = fs.readFileSync(outputPath);

    expect(stderr).toBeFalsy()
    expect(stdout).toBeTruthy();

    expect(output.includes("MY_VAR: string;")).toBeTruthy();

    fs.unlinkSync(outputPath);
})

const CUSTOM_DIRECTORY = "tests/out";

test(`Creates declaration file with custom filename (${CUSTOM_FILENAME}) and custom directory (${CUSTOM_DIRECTORY})`, async () => {
    const { stderr, stdout } = await cli(["--file", "tests/samples/.env.test"], ["--filename", CUSTOM_FILENAME], ["--directory", CUSTOM_DIRECTORY]);

    const outputPath = path.join(process.cwd(), CUSTOM_DIRECTORY, CUSTOM_FILENAME);

    const output = fs.readFileSync(outputPath);

    expect(stderr).toBeFalsy()
    expect(stdout).toBeTruthy();

    expect(output.includes("MY_VAR: string;")).toBeTruthy();

    deldir.sync(path.dirname(outputPath))
})