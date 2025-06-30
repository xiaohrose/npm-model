#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const chalk = require('chalk');
const boxen = require('boxen').default;
const { execSync } = require('child_process');

// 加载环境变量
dotenv.config();
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com"
});

// 工具定义
const tools = [
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Read the content of a single file from the filesystem",
            parameters: {
                type: "object",
                properties: {
                    file_path: {
                        type: "string",
                        description: "The path to the file to read (relative or absolute)",
                    }
                },
                required: ["file_path"]
            },
        }
    },
    {
        type: "function",
        function: {
            name: "read_multiple_files",
            description: "Read the content of multiple files from the filesystem",
            parameters: {
                type: "object",
                properties: {
                    file_paths: {
                        type: "array",
                        items: { type: "string" },
                        description: "Array of file paths to read (relative or absolute)",
                    }
                },
                required: ["file_paths"]
            },
        }
    },
    {
        type: "function",
        function: {
            name: "create_file",
            description: "Create a new file or overwrite an existing file with the provided content",
            parameters: {
                type: "object",
                properties: {
                    file_path: {
                        type: "string",
                        description: "The path where the file should be created",
                    },
                    content: {
                        type: "string",
                        description: "The content to write to the file",
                    }
                },
                required: ["file_path", "content"]
            },
        }
    },
    {
        type: "function",
        function: {
            name: "create_multiple_files",
            description: "Create multiple files at once",
            parameters: {
                type: "object",
                properties: {
                    files: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                path: { type: "string" },
                                content: { type: "string" }
                            },
                            required: ["path", "content"]
                        },
                        description: "Array of files to create with their paths and content",
                    }
                },
                required: ["files"]
            },
        }
    },
    {
        type: "function",
        function: {
            name: "edit_file",
            description: "Edit an existing file by replacing a specific snippet with new content",
            parameters: {
                type: "object",
                properties: {
                    file_path: {
                        type: "string",
                        description: "The path to the file to edit",
                    },
                    original_snippet: {
                        type: "string",
                        description: "The exact text snippet to find and replace",
                    },
                    new_snippet: {
                        type: "string",
                        description: "The new text to replace the original snippet with",
                    }
                },
                required: ["file_path", "original_snippet", "new_snippet"]
            },
        }
    },
    {
        type: "function",
        function: {
            name: "run_npm_command",
            description: "Execute npm commands in Node.js projects",
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "npm command to run (e.g., 'install', 'run build')"
                    },
                    working_directory: {
                        type: "string",
                        description: "Project directory path"
                    }
                },
                required: ["command"]
            },
        }
    }
];

// 系统提示
const system_PROMPT = `
You are an elite software engineer called DeepSeek Engineer with decades of experience across all programming domains.
Your expertise spans system design, algorithms, testing, and best practices.
You provide thoughtful, well-structured solutions while explaining your reasoning.

Core capabilities:
1. Code Analysis & Discussion
   - Analyze code with expert-level insight
   - Explain complex concepts clearly
   - Suggest optimizations and best practices
   - Debug issues with precision

2. File Operations (via function calls):
   - read_file: Read a single file's content
   - read_multiple_files: Read multiple files at once
   - create_file: Create or overwrite a single file
   - create_multiple_files: Create multiple files at once
   - edit_file: Make precise edits to existing files using snippet replacement
   - run_npm_command: Execute npm commands in Node.js projects

Guidelines:
1. Provide natural, conversational responses explaining your reasoning
2. Use function calls when you need to read or modify files
3. For file operations:
   - Always read files first before editing them to understand the context
   - Use precise snippet matching for edits
   - Explain what changes you're making and why
   - Consider the impact of changes on the overall codebase
4. Follow language-specific best practices
5. Suggest tests or validation steps when appropriate
6. Be thorough in your analysis and recommendations

IMPORTANT: In your thinking process, if you realize that something requires a tool call, cut your thinking short and proceed directly to the tool call. Don't overthink - act efficiently when file operations are needed.

Remember: You're a senior engineer - be thoughtful, precise, and explain your reasoning clearly.
`;

// 辅助函数
function readLocalFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

function createFile(filePath, content) {
    // 安全检查
    if (filePath.includes('~')) {
        throw new Error("Home directory references not allowed");
    }

    const normalizedPath = normalizePath(filePath);

    // 验证文件大小
    if (content.length > 5_000_000) {
        throw new Error("File content exceeds 5MB size limit");
    }

    // 创建目录（如果需要）
    const dir = path.dirname(normalizedPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(normalizedPath, content);
    console.log(chalk.blue('✓') + ` Created/updated file at '${chalk.cyan(normalizedPath)}'`);
}

function applyDiffEdit(filePath, originalSnippet, newSnippet) {
    let content;
    try {
        content = readLocalFile(filePath);

        // 验证替换位置
        const occurrences = content.split(originalSnippet).length - 1;
        if (occurrences === 0) {
            throw new Error("Original snippet not found");
        }
        if (occurrences > 1) {
            console.log(chalk.yellow.bold(`⚠ Multiple matches (${occurrences}) found - requiring line numbers for safety`));
            console.log(chalk.dim("Use format:\n--- original.js (lines X-Y)\n+++ modified.js"));
            throw new Error(`Ambiguous edit: ${occurrences} matches`);
        }

        const updatedContent = content.replace(originalSnippet, newSnippet);
        createFile(filePath, updatedContent);
        console.log(chalk.blue('✓') + ` Applied diff edit to '${chalk.cyan(filePath)}'`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(chalk.red('✗') + ` File not found for diff editing: '${chalk.cyan(filePath)}'`);
        } else {
            console.log(chalk.yellow('⚠') + ` ${error.message} in '${chalk.cyan(filePath)}'. No changes made.`);
            if (content) {
                console.log("\n" + chalk.blue.bold("Expected snippet:"));
                console.log(originalSnippet);
                console.log("\n" + chalk.blue.bold("Actual file content:"));
                console.log(content);
            }
        }
    }
}

function tryHandleAddCommand(userInput) {
    const prefix = "/add ";
    if (userInput.trim().toLowerCase().startsWith(prefix)) {
        const pathToAdd = userInput.slice(prefix.length).trim();
        try {
            const normalizedPath = normalizePath(pathToAdd);
            const stats = fs.statSync(normalizedPath);

            if (stats.isDirectory()) {
                addDirectoryToConversation(normalizedPath);
            } else {
                const content = readLocalFile(normalizedPath);
                conversationHistory.push({
                    role: "system",
                    content: `Content of file '${normalizedPath}':\n\n${content}`
                });
                console.log(chalk.blue('✓') + ` Added file '${chalk.cyan(normalizedPath)}' to conversation.\n`);
            }
            return true;
        } catch (error) {
            console.log(chalk.red('✗') + ` Could not add path '${chalk.cyan(pathToAdd)}': ${error.message}\n`);
            return true;
        }
    }
    return false;
}

function addDirectoryToConversation(directoryPath) {
    console.log(chalk.blue('🔍') + ` Scanning directory '${chalk.cyan(directoryPath)}'...`);

    const excludedFiles = new Set([
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        'node_modules', '.next', '.nuxt', '.cache', '.vercel',
        'dist', 'build', '.output', '.contentlayer',
        '.env', '.env.local', '.env.development', '.env.production',
        '.git', '.DS_Store', 'Thumbs.db'
    ]);

    const excludedExtensions = new Set([
        '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.avif',
        '.mp4', '.webm', '.mov', '.mp3', '.wav', '.ogg',
        '.zip', '.tar', '.gz', '.7z', '.rar',
        '.exe', '.dll', '.so', '.dylib', '.bin',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.cache', '.tmp', '.temp',
    ]);

    const skippedFiles = [];
    const addedFiles = [];
    let totalFilesProcessed = 0;
    const maxFiles = 1000;
    const maxFileSize = 5_000_000;

    function walkDir(dir) {
        if (totalFilesProcessed >= maxFiles) return;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (totalFilesProcessed >= maxFiles) break;

            const fullPath = path.join(dir, file);
            let stats;
            try {
                stats = fs.statSync(fullPath);
            } catch (error) {
                skippedFiles.push(`${fullPath} (stat error)`);
                continue;
            }

            if (stats.isDirectory()) {
                if (file.startsWith('.') || excludedFiles.has(file)) {
                    skippedFiles.push(fullPath);
                    continue;
                }
                walkDir(fullPath);
            } else {
                if (file.startsWith('.') || excludedFiles.has(file)) {
                    skippedFiles.push(fullPath);
                    continue;
                }

                const ext = path.extname(file).toLowerCase();
                if (excludedExtensions.has(ext)) {
                    skippedFiles.push(fullPath);
                    continue;
                }

                if (stats.size > maxFileSize) {
                    skippedFiles.push(`${fullPath} (exceeds size limit)`);
                    continue;
                }

                if (isBinaryFile(fullPath)) {
                    skippedFiles.push(fullPath);
                    continue;
                }

                try {
                    const normalizedPath = normalizePath(fullPath);
                    const content = readLocalFile(normalizedPath);
                    conversationHistory.push({
                        role: "system",
                        content: `Content of file '${normalizedPath}':\n\n${content}`
                    });
                    addedFiles.push(normalizedPath);
                    totalFilesProcessed++;
                } catch (error) {
                    skippedFiles.push(fullPath);
                }
            }
        }
    }

    walkDir(directoryPath);

    console.log(chalk.blue('✓') + ` Added folder '${chalk.cyan(directoryPath)}' to conversation.`);
    if (addedFiles.length > 0) {
        console.log(`\n${chalk.blue.bold('📁 Added files:')} ${`(${addedFiles.length} of ${totalFilesProcessed})`}`);
        addedFiles.slice(0, 10).forEach(file => {
            console.log(`  ${chalk.cyan('📄 ' + file)}`);
        });
        if (addedFiles.length > 10) {
            console.log(`  ... and ${addedFiles.length - 10} more`);
        }
    }

    if (skippedFiles.length > 0) {
        console.log(`\n${chalk.yellow.bold('⏭ Skipped files:')} ${`(${skippedFiles.length})`}`);
        skippedFiles.slice(0, 10).forEach(file => {
            console.log(`  ${chalk.yellow.dim('⚠ ' + file)}`);
        });
        if (skippedFiles.length > 10) {
            console.log(`  ... and ${skippedFiles.length - 10} more`);
        }
    }
    console.log();
}

function isBinaryFile(filePath, peekSize = 1024) {
    try {
        const buffer = Buffer.alloc(peekSize);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, peekSize, 0);
        fs.closeSync(fd);
        return buffer.includes(0);
    } catch (error) {
        return true;
    }
}

function ensureFileInContext(filePath) {
    try {
        const normalizedPath = normalizePath(filePath);
        const content = readLocalFile(normalizedPath);
        const fileMarker = `Content of file '${normalizedPath}'`;

        if (!conversationHistory.some(msg => msg.content.includes(fileMarker))) {
            conversationHistory.push({
                role: "system",
                content: `${fileMarker}:\n\n${content}`
            });
        }
        return true;
    } catch (error) {
        console.log(chalk.red('✗') + ` Could not read file '${chalk.cyan(filePath)}' for editing context`);
        return false;
    }
}

function normalizePath(pathStr) {
    const resolvedPath = path.resolve(pathStr);
    if (resolvedPath.includes('..')) {
        throw new Error(`Invalid path: ${pathStr} contains parent directory references`);
    }
    return resolvedPath;
}

// 会话状态
let conversationHistory = [
    { role: "system", content: system_PROMPT }
];

// API交互
async function executeFunctionCall(toolCall) {
    try {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        switch (functionName) {
            case "read_file":
                const filePath = args.file_path;
                const normalizedPath = normalizePath(filePath);
                const content = readLocalFile(normalizedPath);
                return `Content of file '${normalizedPath}':\n\n${content}`;

            case "read_multiple_files":
                const filePaths = args.file_paths;
                const results = filePaths.map(filePath => {
                    try {
                        const normalizedPath = normalizePath(filePath);
                        const content = readLocalFile(normalizedPath);
                        return `Content of file '${normalizedPath}':\n\n${content}`;
                    } catch (error) {
                        return `Error reading '${filePath}': ${error.message}`;
                    }
                });
                return "\n\n" + "=".repeat(50) + "\n" + results.join("\n\n" + "=".repeat(50) + "\n");

            case "create_file":
                createFile(args.file_path, args.content);
                return `Successfully created file '${args.file_path}'`;

            case "create_multiple_files":
                const files = args.files;
                const createdFiles = [];
                for (const fileInfo of files) {
                    createFile(fileInfo.path, fileInfo.content);
                    createdFiles.push(fileInfo.path);
                }
                return `Successfully created ${createdFiles.length} files: ${createdFiles.join(', ')}`;

            case "edit_file":
                if (!ensureFileInContext(args.file_path)) {
                    return `Error: Could not read file '${args.file_path}' for editing`;
                }

                applyDiffEdit(args.file_path, args.original_snippet, args.new_snippet);
                return `Successfully edited file '${args.file_path}'`;

            case "run_npm_command":
                const command = args.command;
                const workingDir = args.working_directory || process.cwd();

                // 安全校验
                if (command.includes(';') || command.includes('&&') || command.includes('||')) {
                    throw new Error("Command contains unsafe operators");
                }

                const allowedCommands = ['install', 'run', 'test', 'build', 'start', 'ci', 'audit'];
                const firstWord = command.split(' ')[0];
                if (!allowedCommands.includes(firstWord)) {
                    throw new Error(`Command '${firstWord}' is not allowed`);
                }

                console.log(chalk.blue(`→ Running: npm ${command} in ${workingDir}`));

                try {
                    const result = execSync(`npm ${command}`, {
                        cwd: workingDir,
                        encoding: 'utf-8',
                        stdio: 'pipe',
                        timeout: 300000
                    });
                    return `Command executed successfully:\n${result}`;
                } catch (error) {
                    return `Command failed:\n${error.message}\n${error.stdout || ''}\n${error.stderr || ''}`;
                }

            default:
                return `Unknown function: ${functionName}`;
        }
    } catch (error) {
        return `Error executing ${toolCall.function.name}: ${error.message}`;
    }
}

function trimConversationHistory() {
    if (conversationHistory.length <= 20) return;

    const systemMsgs = conversationHistory.filter(msg => msg.role === "system");
    const otherMsgs = conversationHistory.filter(msg => msg.role !== "system");

    if (otherMsgs.length > 15) {
        conversationHistory = [...systemMsgs, ...otherMsgs.slice(-15)];
    }
}

async function streamOpenAiResponse(userMessage) {
    conversationHistory.push({ role: "user", content: userMessage });
    trimConversationHistory();

    try {
        console.log("\n" + chalk.blue.bold("🐋 Seeking..."));

        const stream = await client.chat.completions.create({
            // model: "deepseek-reasoner",
            model: "deepseek-chat",
            messages: conversationHistory,
            tools: tools,
            // max_tokens: 64000,
            stream: true
        });

        let finalContent = "";
        let toolCalls = [];
        let assistantMessage = "";

        for await (const chunk of stream) {
            const choice = chunk.choices[0];
            if (choice.delta?.content) {
                process.stdout.write(choice.delta.content);
                finalContent += choice.delta.content;
            }

            if (choice.delta?.tool_calls) {
                for (const toolCall of choice.delta.tool_calls) {
                    const index = toolCall.index;
                    while (toolCalls.length <= index) {
                        toolCalls.push({
                            id: "",
                            type: "function",
                            function: { name: "", arguments: "" }
                        });
                    }

                    if (toolCall.id) {
                        toolCalls[index].id = toolCall.id;
                    }

                    if (toolCall.function) {
                        if (toolCall.function.name) {
                            toolCalls[index].function.name += toolCall.function.name;
                        }
                        if (toolCall.function.arguments) {
                            toolCalls[index].function.arguments += toolCall.function.arguments;
                        }
                    }
                }
            }
        }

        console.log();

        assistantMessage = {
            role: "assistant",
            content: finalContent || null
        };

        if (toolCalls.length > 0) {
            const formattedToolCalls = toolCalls.map((tc, i) => ({
                id: tc.id || `call_${i}_${Date.now()}`,
                type: "function",
                function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments
                }
            }));

            assistantMessage.tool_calls = formattedToolCalls;
            conversationHistory.push(assistantMessage);

            console.log(chalk.cyan.bold(`\n⚡ Executing ${formattedToolCalls.length} function call(s)...`));

            for (const toolCall of formattedToolCalls) {
                console.log(chalk.blue(`→ ${toolCall.function.name}`));

                try {
                    const result = await executeFunctionCall(toolCall);
                    conversationHistory.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: result
                    });
                    console.log(chalk.green(`✓ ${toolCall.function.name} completed`));
                } catch (error) {
                    console.log(chalk.red(`✗ Error executing ${toolCall.function.name}: ${error.message}`));
                    conversationHistory.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: toolCall.function.name,
                        content: `Error: ${error.message}`
                    });
                }
            }

            console.log(chalk.blue.bold("\n🔄 Processing results..."));
            const followUpResponse = await client.chat.completions.create({
                model: "deepseek-reasoner",
                messages: conversationHistory,
                tools: tools,
                max_tokens: 64000,
                stream: true
            });

            let followUpContent = "";
            console.log("\n" + chalk.blue.bold("🤖 Assistant> "));

            for await (const chunk of followUpResponse) {
                if (chunk.choices[0].delta?.content) {
                    process.stdout.write(chunk.choices[0].delta.content);
                    followUpContent += chunk.choices[0].delta.content;
                }
            }
            console.log();

            conversationHistory.push({
                role: "assistant",
                content: followUpContent
            });
        } else {
            conversationHistory.push(assistantMessage);
        }

        return { success: true };
    } catch (error) {
        const errorMsg = `DeepSeek API error: ${error.message}`;
        console.log(chalk.red.bold(`\n❌ ${errorMsg}`));
        return { error: errorMsg };
    }
}

// 主函数
async function main() {
    // 欢迎信息
    console.log(boxen(
        chalk.blue.bold('🐋 DeepSeek Engineer') + ' ' + chalk.cyan('with Function Calling') +
        '\n' + chalk.dim.blue('Powered by DeepSeek-R1 with Chain-of-Thought Reasoning'),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'blue',
            title: chalk.cyan.bold('🤖 AI Code Assistant'),
            titleAlignment: 'center'
        }
    ));

    // 使用说明
    console.log(boxen(
        chalk.blue.bold('📁 File Operations:') +
        '\n  • ' + chalk.cyan('/add path/to/file') + ' - Include a single file in conversation' +
        '\n  • ' + chalk.cyan('/add path/to/folder') + ' - Include all files in a folder' +
        '\n  • ' + chalk.dim('The AI can automatically read and create files using function calls') +
        '\n\n' + chalk.blue.bold('🎯 Commands:') +
        '\n  • ' + chalk.cyan('exit') + ' or ' + chalk.cyan('quit') + ' - End the session' +
        '\n  • ' + chalk.cyan('clear') + ' - Reset the conversation' +
        '\n  • ' + chalk.dim('Just ask naturally - the AI will handle operations automatically!'),
        {
            padding: 1,
            borderStyle: 'single',
            borderColor: 'blue',
            title: chalk.blue.bold('💡 How to Use'),
            titleAlignment: 'left'
        }
    ));

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.blue('🔵 You> ')
    });

    rl.prompt();

    rl.on('line', async (input) => {
        const userInput = input.trim();

        if (!userInput) {
            rl.prompt();
            return;
        }

        if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
            console.log(chalk.blue.bold('\n👋 Goodbye! Happy coding!'));
            rl.close();
            return;
        }

        if (userInput.toLowerCase() === 'clear') {
            conversationHistory = [
                { role: "system", content: system_PROMPT }
            ];
            console.log(chalk.green('\n🔄 Conversation history cleared.'));
            rl.prompt();
            return;
        }

        if (tryHandleAddCommand(userInput)) {
            rl.prompt();
            return;
        }

        const response = await streamOpenAiResponse(userInput);
        if (response.error) {
            console.log(chalk.red.bold(`❌ Error: ${response.error}`));
        }

        rl.prompt();
    });

    rl.on('close', () => {
        console.log(chalk.blue.bold('\n✨ Session finished. Thank you for using DeepSeek Engineer!'));
        process.exit(0);
    });
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});