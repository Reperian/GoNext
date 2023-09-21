export function getRootURL() {
    return `${process.env.REACT_APP_BACKEND_SERVER_PROTOCOL}://${process.env.REACT_APP_BACKEND_SERVER_DOMAIN}:${process.env.REACT_APP_BACKEND_SERVER_PORT}/`
}
// Function to convert a number to a multi character code eg. 1 => A, 2 => B, 28 => AB
// https://stackoverflow.com/questions/8240637/convert-numbers-to-letters-beyond-the-26-character-alphabet
export function numToCharCode(n: number) {
    const ordA = "A".charCodeAt(0);
    const ordZ = "Z".charCodeAt(0);
    const len = ordZ - ordA + 1;

    let s = "";
    while (n >= 0) {
        s = String.fromCharCode((n % len) + ordA) + s;
        n = Math.floor(n / len) - 1;
    }
    return s;
}


export function charCodetoNum(str: string) {
    const ordA = "A".charCodeAt(0);
    const ordZ = "Z".charCodeAt(0);
    const len = ordZ - ordA + 1;
    let result = 0;
    for (let i = str.length - 1; i >= 0; i--) {
        result += (str.charCodeAt(i) - ordA) * Math.pow(len, i);
    }
    return result;
}

export function getSeatMapDimensions() {
    return {
        rows: 30,
        cols: 30
    }
}