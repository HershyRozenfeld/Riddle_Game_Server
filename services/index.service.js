import { readFile } from '../dal/index.dal.js';

export const writePerson = async (data) => {
    const file = await readName();
    const newFile = JSON.parse(file);
    newFile.push(data);
    write(JSON.stringify(data));
    return ({ success: true });
}