const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const DIR = '/Users/davityeritsyan/Public/ent/film/fuji'
const ROOT_DIR = `${DIR}/_root`;
const IMAGE_DIR = `${ROOT_DIR}/imgs`;
const SYNC_FILE = './last_sync.txt';

function getLastSyncDate(ignoreSync) {
    if (ignoreSync || !fs.existsSync(SYNC_FILE)) {
        return new Date(0);
    }
    const lastSync = fs.readFileSync(SYNC_FILE, 'utf-8');
    return new Date(lastSync.trim());
}

function updateLastSyncDate() {
    fs.writeFileSync(SYNC_FILE, new Date().toISOString());
}

function getCreationDate(filePath) {
    const stats = fs.statSync(filePath);
    return stats.birthtime;
}

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function sortAndGroupImages(ignoreSync) {
    const lastSyncDate = getLastSyncDate(ignoreSync);
    const files = fs.readdirSync(IMAGE_DIR);

    files.forEach(file => {
        const filePath = path.join(IMAGE_DIR, file);
        if (fs.lstatSync(filePath).isFile()) {
            const creationDate = getCreationDate(filePath);
            console.log(creationDate, lastSyncDate)
            if (creationDate > lastSyncDate) {
                const year = creationDate.getFullYear();
                const month = String(creationDate.getMonth() + 1).padStart(2, '0');
                const day = String(creationDate.getDate()).padStart(2, '0');
                const destinationDir = path.join(DIR, `${year}-${month}-${day}`);

                ensureDirectoryExists(destinationDir);

                const destinationPath = path.join(destinationDir, file);
                fs.renameSync(filePath, destinationPath);
                console.log(`Moved ${file} to ${destinationDir}`);
            }
        }
    });

    updateLastSyncDate();
}

const args = process.argv.slice(2);
const ignoreSync = args.includes('-all');


sortAndGroupImages(ignoreSync);