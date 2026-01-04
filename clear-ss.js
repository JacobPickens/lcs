const fs = require('fs');

(async () => {
    await fs.rmSync("./public/images/ss", { recursive: true, force: true });

    // Recreate the empty directory if desired
    await fs.mkdirSync("./public/images/ss", { recursive: true })
})();