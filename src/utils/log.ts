import chalk from "chalk";

const error = (message: string, returnString = false) => {
    
    const formated = `${chalk.red("ERROR!")} ${message}`;

    if (returnString) return formated;

    console.error(formated);
}

const success = (message: string, returnString = false): void | string => {

    const formated = `${chalk.green("SUCCESS!")} ${message}`;
    
    if (returnString) return formated;

    console.log(formated);
}

export const log = {
    error,
    success
}