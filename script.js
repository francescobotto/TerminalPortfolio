document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('.typing-effect');
    const mainContent = document.getElementById('output');
    const textToType = typingElement.getAttribute('data-text');
    let index = 0;

    function typeChar() {
        if (index < textToType.length) {
            typingElement.textContent += textToType.charAt(index);
            index++;
            setTimeout(typeChar, 100); // Typing speed
        } else {
            // Finished typing, simulate loading delay then show content
            setTimeout(() => {
                mainContent.classList.remove('hidden');
                mainContent.classList.add('visible');
            }, 500);
        }
    }

    // Start typing effect
    typeChar();

    // --- Dynamic Features ---

    // Scroll Reveal with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.hidden-section').forEach(section => {
        observer.observe(section);
    });

    // --- Dynamic CLI Features ---

    const outputContainer = document.getElementById('output');
    const cliInput = document.getElementById('cli-input');

    // Command Dictionary
    const commands = [
        'education', 'experience', 'research', 'projects',
        'publications', 'skills', 'all', 'clear'
    ];

    // Populate static command list in intro
    const staticCommandList = document.getElementById('command-list-static');
    if (staticCommandList) {
        const p = document.createElement('p');
        p.textContent = '> Available commands:';
        p.style.marginBottom = '0.5rem';
        staticCommandList.appendChild(p);

        const list = document.createElement('ul');
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'max-content max-content';
        list.style.columnGap = '30px';
        list.style.rowGap = '5px';
        list.style.marginTop = '10px';

        commands.forEach(cmd => {
            const li = createClickableCommand(cmd);
            list.appendChild(li);
        });
        staticCommandList.appendChild(list);
    }

    // CV Download Logic
    const downloadCvBtn = document.getElementById('download-cv');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startDownloadProcess();
        });
    }

    function startDownloadProcess() {
        // Prevent multiple clicks while downloading
        if (downloadCvBtn.classList.contains('downloading')) return;
        downloadCvBtn.classList.add('downloading');

        const echo = document.createElement('div');
        echo.className = 'command-echo';
        echo.innerHTML = `<span class="prompt">user@fbotto:~$</span> Downloading CV_Botto.pdf...`;
        outputContainer.appendChild(echo);

        const loadingContainer = document.createElement('div');
        loadingContainer.style.marginBottom = '1rem';
        loadingContainer.style.color = 'var(--text-color)';
        loadingContainer.style.fontFamily = "'Fira Code', monospace";
        outputContainer.appendChild(loadingContainer);

        let progress = 0;
        const totalLength = 30;

        const updateLoader = () => {
            const filledLength = Math.floor((progress / 100) * totalLength);
            const emptyLength = totalLength - filledLength;

            const filledStr = '#'.repeat(filledLength);
            const emptyStr = '-'.repeat(emptyLength);

            loadingContainer.textContent = `[${filledStr}${emptyStr}] ${progress}%`;
            window.scrollTo(0, document.body.scrollHeight);

            if (progress < 100) {
                progress += Math.floor(Math.random() * 15) + 5;
                if (progress > 100) progress = 100;
                setTimeout(updateLoader, Math.floor(Math.random() * 80) + 40);
            } else {
                loadingContainer.textContent = `[${'#'.repeat(totalLength)}] 100% - Ready!`;

                setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = 'CV_Botto.pdf';
                    link.target = '_blank'; // Apri in una nuova scheda
                    link.rel = 'noopener noreferrer'; // Sicurezza
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    downloadCvBtn.classList.remove('downloading');
                }, 400);
            }
        };

        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 10);
        setTimeout(updateLoader, 300);
    }

    // Initialize
    // Typing effect for the first welcome message if needed, or just show intro
    // (Intro is already in HTML, so we just let it sit there)

    // System Stats (Keep existing logic)
    let seconds = 0;
    setInterval(() => {
        seconds++;
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('uptime').textContent = `${h}:${m}:${s}`;

        if (Math.random() > 0.5) {
            document.getElementById('cpu').textContent = Math.floor(Math.random() * 20) + '%';
            document.getElementById('memory').textContent = (64 + Math.floor(Math.random() * 10)) + 'KB';
        }
    }, 1000);

    // CLI Event Listeners
    if (cliInput) {
        cliInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandLine = cliInput.value.trim();
                if (commandLine) {
                    processCommand(commandLine);
                }
                cliInput.value = '';
                // Auto scroll to bottom
                window.scrollTo(0, document.body.scrollHeight);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                handleTabCompletion(cliInput.value);
            }
        });

        // Always focus input
        document.addEventListener('click', (e) => {
            // Don't focus if selecting text OR if clicking on a command/link
            // We want to avoid keyboard popping up when user clicks a command
            const isCommandClick = e.target.closest('.command-item') || e.target.closest('a') || e.target.closest('.clickable');

            if (window.getSelection().toString().length === 0 && !isCommandClick) {
                cliInput.focus();
            }
        });
    }

    function createClickableCommand(cmd) {
        const li = document.createElement('li');
        li.textContent = cmd;
        li.style.cursor = 'pointer';
        li.className = 'command-item'; // Add class for identification

        li.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click listener (focus)
            processCommand(cmd);
        });
        return li;
    }

    function processCommand(cmdLine) {
        // Echo command
        const echo = document.createElement('div');
        echo.className = 'command-echo';
        echo.innerHTML = `<span class="prompt">user@fbotto:~$</span> ${cmdLine}`;
        outputContainer.appendChild(echo);

        const args = cmdLine.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                printOutput("Available commands:");
                const helpList = document.createElement('ul');
                helpList.style.marginBottom = '1rem';
                commands.forEach(c => {
                    const li = createClickableCommand(c);
                    helpList.appendChild(li);
                });
                outputContainer.appendChild(helpList);
                break;

            case 'clear':
                outputContainer.innerHTML = '';
                // Clear content but keep listeners? 
                // Actually clear removes everything. 
                // If we want to keep the "Available commands" visible we might need to rethink, 
                // but standard 'clear' behavior is to wipe screen. 
                // User can type 'help' to get commands back.
                break;



            case 'education':
            case 'experience':
            case 'research':
            case 'projects':
            case 'publications':
            case 'skills':
                renderSection(`tpl-${cmd}`);
                break;

            case 'all':
                ['education', 'experience', 'research', 'projects', 'publications', 'skills'].forEach(sec => {
                    renderSection(`tpl-${sec}`);
                });
                break;



            default:
                printOutput(`Command not found: ${cmd}. Type 'help' for a list of commands.`);
        }

        // Ensure scrolling to bottom after command execution
        setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 10);
    }

    function renderSection(templateId) {
        const template = document.getElementById(templateId);
        if (template) {
            const clone = template.cloneNode(true);
            clone.removeAttribute('id'); // Avoid ID duplicates
            clone.style.display = 'block';
            clone.classList.add('reveal'); // Add animation class if setup in CSS

            // Re-attach query listeners for interactivity (like project details)
            // Function to attach listeners to specific element
            attachListeners(clone);

            outputContainer.appendChild(clone);
        } else {
            printOutput(`Error: Section '${templateId}' not found.`);
        }
    }

    function printOutput(text) {
        const p = document.createElement('p');
        p.textContent = text;
        outputContainer.appendChild(p);
    }

    function handleTabCompletion(currentInput) {
        const matches = commands.filter(c => c.startsWith(currentInput));
        if (matches.length === 1) {
            cliInput.value = matches[0];
        } else if (matches.length > 1) {
            // Print options
            const echo = document.createElement('div');
            echo.className = 'command-echo';
            echo.innerHTML = `<span class="prompt">user@fbotto:~$</span> ${currentInput}`;
            outputContainer.appendChild(echo);

            // Create clickable options for tab completion too?
            const list = document.createElement('ul');
            list.style.display = 'flex';
            list.style.gap = '20px';
            list.style.flexWrap = 'wrap';

            matches.forEach(m => {
                const li = createClickableCommand(m);
                list.appendChild(li);
            });
            outputContainer.appendChild(list);

            // Restore input line visuals (handled by browser keeping focus)
            window.scrollTo(0, document.body.scrollHeight);
        }
    }

    function setTheme(text, dim, link) {
        document.documentElement.style.setProperty('--text-color', text);
        document.documentElement.style.setProperty('--dim-text', dim);
        document.documentElement.style.setProperty('--link-color', link);
    }

    // Re-attach event listeners for dynamic content
    function attachListeners(element) {
        const projectEntries = element.querySelectorAll('.entry.clickable');
        projectEntries.forEach(entry => {
            entry.addEventListener('click', () => {
                const details = entry.querySelector('.details');
                const indicator = entry.querySelector('.indicator');

                if (details.classList.contains('open')) {
                    details.classList.remove('open');
                    indicator.textContent = '[+]';
                } else {
                    details.classList.add('open');
                    indicator.textContent = '[-]';
                }
            });
        });
    }

    // Initial listener attach (if there's static content)
    attachListeners(document);

    // Easter Egg: Ctrl+C to stop server (Main Page Only)
    // Easter Egg: Ctrl+C to stop server (Main Page Only)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'c') {
            document.body.innerHTML = `
                <div style="
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Fira Code', monospace;
                    color: var(--text-color);
                    background-color: var(--bg-color);
                    text-align: center;
                    white-space: pre;
                    font-size: 1.1rem;
                    line-height: 1.2;
                ">
 ___________________________
/                           \\
|   SYSTEM FAILURE: SIGINT  |
|                           |
|         ( X _ X )         |
|                           |
|     PROCESS TERMINATED    |
|                           |
\\___________________________/

Connection to server closed.
                </div>
            `;
        }
    });
});
