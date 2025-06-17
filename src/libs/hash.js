import bcrypt from 'bcrypt';

export const encryptPass = async (pass) => {
    const salt = await bcrypt.genSalt();
    const passHash = await bcrypt.hash(pass, salt);
    return passHash;
};

export const matchPass = async (pass, password) => {
    const match = await bcrypt.compare(pass, password);
    return match;
};

