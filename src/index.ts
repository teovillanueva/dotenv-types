#!/usr/bin/env node
import program from "commander";

import dotenv from "dotenv";

import { version } from "pjson";

import path from "path";
import fs from "fs";

import { log } from "./utils/log";
import { format } from "./utils/format";

interface InterfaceCLI extends program.Command {
    filename?: string;
    file?: string;
    directory?: string;
}

const cli: InterfaceCLI = program
    .version(version)
    .option("-F, --file <file>", "Your .env file")
    .option("-f, --filename <filename>", "Output filename")
    .option("-d, --directory <dir>", "Output directory")
    .parse(process.argv)

const main = async () => {
    const DEFAULT_DOTENV_FILENAME = ".env";
    const DEFAULT_DOTENV_DIRECTORY = process.cwd();
    const DEFAULT_DEFINITION_FILENAME = "env.d.ts";
    const DEFAULT_DEFINITION_DIRECTORY = process.cwd();
    
    const dotenvFilename = cli.file || DEFAULT_DOTENV_FILENAME;
    const outputFilename = cli.filename || DEFAULT_DEFINITION_FILENAME;

    const dotenvPath = cli.file ? path.join(process.cwd(), cli.file) : path.join(DEFAULT_DOTENV_DIRECTORY, DEFAULT_DOTENV_FILENAME);
    const outputPath = path.join(DEFAULT_DEFINITION_DIRECTORY, cli.directory || "", outputFilename);
    
    const outputDirectory = path.dirname(outputPath);

    if (
        (cli.filename && cli.filename === DEFAULT_DOTENV_FILENAME) ||
        (cli.file && cli.filename && path.basename(cli.file) === cli.filename)
    ) {
        log.error("The output filename should not match the dotenv file!")
        return;
    }

    try {
        const dotenvBuffer = fs.readFileSync(dotenvPath);

        const parsedDotenv = dotenv.parse(dotenvBuffer);

        const keys = Object.keys(parsedDotenv);

        const output = `
            // Generated using https://www.npmjs.com/package/dotenv-types

            declare namespace NodeJS {
                export interface ProcessEnv {
                    <REPLACE>
                }
            }
        `.replace("<REPLACE>", keys.map((key, index) => (
            `${key}: string; ${ index !== keys.length - 1 ? "\n" : "" }`
        )).join(""))

        try {
            const dir = fs.opendirSync(outputDirectory);
            dir.closeSync();
        } catch (error) {
            fs.mkdirSync(outputDirectory);
        }

        fs.writeFileSync(outputPath, format(output))

        log.success(`Generated ${outputFilename} successfully!`);
    } catch (error) {
        if (error.code) {
            if (error.code === "ENOENT") {
                log.error(`Could not find ${dotenvFilename}!`);
                return;
            }
        }
    }
}

main();