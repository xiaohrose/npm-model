#!/usr/bin/env node
"use strict";

const { spawn } = require('child_process');
const path = require('path');

spawn('ts-node', [path.join(__dirname, '../src/index.ts'), ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
})
