import prettier from "prettier"

export const format = (str: string) => {
    return prettier.format(str, { parser: "typescript" })
}