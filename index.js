#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { input } = require('@inquirer/prompts');

const updatePackageJson = (packageName) => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update package.json fields
    packageJson.name = packageName;
    packageJson.description = '';
    delete packageJson.repository;
    delete packageJson.bugs;
    delete packageJson.homepage;
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

const cloneRepo = async () => {
    const repoUrl = 'https://github.com/rijfas/generator.js';
    const tempDir = './temp_clone';
    
    try {
        const packageName  = await input(
            {
                type: 'input',
                name: 'packageName',
                message: 'Enter a name for your package:',
                validate: input => input.trim() !== '' || 'Package name cannot be empty'
            }
        );
        console.log('Cloning repository...');
        // Clone into a temporary directory
        execSync(`git clone ${repoUrl} ${tempDir}`, { stdio: '' });
        
        // Move all contents from temp directory to current directory
        const files = fs.readdirSync(path.join(process.cwd(), tempDir));
        files.forEach(file => {
            if(file !== '.git' && file !== 'package-lock.json') {
            fs.renameSync(
                path.join(process.cwd(), tempDir, file),
                path.join(process.cwd(), file)
            );
            }
        });

        
        // Clean up - remove the temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        console.log('Repository contents copied successfully!');
        
        // Update package.json
        updatePackageJson(packageName);
        
        // Run npm install
        console.log('Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('Dependencies installed successfully!');
        
    } catch (error) {
        console.error('Error:', error.message);
        // Clean up if temp directory exists
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        process.exit(1);
    }
};

cloneRepo();
