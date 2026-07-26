const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
require('dotenv').config();

const execPromise = promisify(exec);

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupDir = path.join(__dirname, '../../backups');
    const backupName = `mongodb-backup-${timestamp}`;
    const backupPath = path.join(backupDir, backupName);
    const zipPath = path.join(backupDir, `${backupName}.zip`);

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('✓ Created backups directory');
    }

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('Starting database backup...');
    console.log(`Backup location: ${backupPath}`);

    // Run mongodump
    const dumpCommand = `mongodump --uri="${mongoUri}" --out="${backupPath}"`;
    
    try {
      await execPromise(dumpCommand);
      console.log('✓ Database dump completed successfully');
    } catch (dumpError) {
      throw new Error(`Mongodump failed: ${dumpError.message}`);
    }

    // Create zip file
    console.log('Creating zip archive...');
    
    // Use PowerShell's Compress-Archive for Windows
    const zipCommand = `powershell Compress-Archive -Path "${backupPath}" -DestinationPath "${zipPath}" -Force`;
    
    try {
      await execPromise(zipCommand);
      console.log('✓ Zip archive created successfully');
    } catch (zipError) {
      throw new Error(`Zip creation failed: ${zipError.message}`);
    }

    // Remove the uncompressed backup folder
    const removeCommand = `powershell Remove-Item -Path "${backupPath}" -Recurse -Force`;
    await execPromise(removeCommand);
    console.log('✓ Cleaned up temporary files');

    // Get file size
    const stats = fs.statSync(zipPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n=================================');
    console.log('✓ BACKUP COMPLETED SUCCESSFULLY!');
    console.log('=================================');
    console.log(`File: ${backupName}.zip`);
    console.log(`Size: ${fileSizeMB} MB`);
    console.log(`Location: ${zipPath}`);
    console.log('=================================\n');

    return zipPath;
  } catch (error) {
    console.error('\n❌ BACKUP FAILED:');
    console.error(error.message);
    
    if (error.message.includes('mongodump')) {
      console.error('\nMake sure MongoDB Database Tools are installed.');
      console.error('Download from: https://www.mongodb.com/try/download/database-tools');
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  backupDatabase();
}

module.exports = backupDatabase;
