function getDate() {
    const date = new Date();

    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);

    return `[${hours}:${minutes}:${seconds}]`;
}

exports.info = (message: string) => console.log(`${getDate()} [INFO] ${message}`);
exports.warn = (message: string) => console.log(`${getDate()} [WARN] ${message}`);
exports.error = (message: string) => console.log(`${getDate()} [ERROR] ${message}`);