(function() {
    'use strict';
    console.log('Started!');

    try {
        const SCRIPT_NAME = "Redação SP";
        const CREDITS = "feito por: biscurim";
        const GEMINI_API_KEY = "AIzaSyBwEiziXQ79LP7IKq93pmLM8b3qnwXn6bQ"; // Sua chave API aqui
        const MODEL_NAME = 'gemini-2.0-flash'; // Modelo conforme solicitado
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
        const MAX_RETRIES = 2;
        const TOAST_DURATION = 3500;

        const PAGE_IDENTIFIER_SELECTOR = 'p.MuiTypography-root.MuiTypography-body1.css-m576f2';
        const PAGE_IDENTIFIER_TEXT = 'Redação';
        const TITLE_TEXTAREA_PARENT_SELECTOR = 'textarea:not([aria-hidden="true"])';
        const BODY_TEXTAREA_PARENT_SELECTOR = 'textarea:not([aria-hidden="true"])';
        const COLETANEA_SELECTOR = '.ql-editor';
        const ENUNCIADO_SELECTOR = '.css-1pvvm3t';
        const GENERO_SELECTOR = '.css-1cq7p20';
        const CRITERIOS_SELECTOR = '.css-1pvvm3t';


        let menuVisible = false;
        let logPanelVisible = false;
        let toggleButton = null;
        let menuPanel = null;
        let logPanel = null;
        let logContentDiv = null;
        let statusLine = null;
        let runButton = null;
        let clearButton = null;
        let isRunning = false;
        let isClearing = false;
        let toastContainer = null;
        let logArray = [];


      const styles = `
    :root { --hck-font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; --hck-ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94); }

    #hck-toggle-button { position: fixed; bottom: 18px; right: 18px; background-color: #000000cc; color: #f0f0f0; padding: 9px 14px; border-radius: 40px; cursor: pointer; font-family: var(--hck-font-stack); font-size: 13.5px; font-weight: 600; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35); z-index: 10000; transition: background-color 0.25s var(--hck-ease-out), transform 0.25s var(--hck-ease-out); user-select: none; border: 1px solid #fff; }
    #hck-toggle-button:hover { background-color: #1a1a1a; transform: scale(1.03); }

    #hck-menu-panel, #hck-log-panel { position: fixed; right: 18px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28); padding: 14px; z-index: 9999; font-family: var(--hck-font-stack); display: none; flex-direction: column; border: 1px solid rgba(255, 255, 255, 0.1); opacity: 0; transform: translateY(15px) scale(0.97); transition: opacity 0.75s var(--hck-ease-out), transform 0.35s var(--hck-ease-out); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); cursor: move; }

    #hck-menu-panel { bottom: 70px; width: 180px; background-color: rgba(0, 0, 0, 0.85); color: #e8e8e8; gap: 8px; }
    #hck-log-panel { bottom: 70px; width: 280px; max-height: 65vh; background-color: rgba(15, 15, 15, 0.9); color: #d8d8d8; gap: 10px; }

    #hck-menu-panel.visible, #hck-log-panel.visible { display: flex; opacity: 1; transform: translateY(0) scale(1); }

    #hck-menu-panel .hck-title-bar { display: flex; flex-direction: column; align-items: center; margin-bottom: 6px; }
    #hck-menu-panel h3 { margin: 0; font-size: 16px; font-weight: 700; animation: rgbShift 4s linear infinite; }
    @keyframes rgbShift {
        0% { color: rgb(255, 0, 0); }
        33% { color: rgb(0, 255, 0); }
        66% { color: rgb(0, 0, 255); }
        100% { color: rgb(255, 0, 0); }
    }

    #hck-menu-panel .hck-credits { font-size: 9px; color: #a0a0a0; font-weight: 400; margin-top: 1px; }

    #hck-menu-panel button, #hck-log-panel button { background-color: transparent; color: #f0f0f0; border: 1px solid #fff; padding: 9px 10px; border-radius: 7px; cursor: pointer; font-size: 12.5px; font-weight: 500; transition: background-color 0.2s ease-out, transform 0.1s ease-out; width: 100%; margin-top: 4px; }
    #hck-menu-panel button:hover:not(:disabled), #hck-log-panel button:hover:not(:disabled) { background-color: rgba(255, 255, 255, 0.1); }
    #hck-menu-panel button:active:not(:disabled), #hck-log-panel button:active:not(:disabled) { transform: scale(0.98); }
    #hck-menu-panel button:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; opacity: 0.6; }

    #hck-status-line { margin-top: 6px; padding: 6px 8px; border-top: 1px solid #444; font-size: 11.5px; color: #dadada; min-height: 16px; text-align: center; background-color: transparent; }

    #hck-status-line.error { color: #ff9c9c; font-weight: 500; }
    #hck-status-line.success { color: #a8e6cf; font-weight: 500; }

    #hck-toast-container { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 10001; display: flex; flex-direction: column; align-items: center; gap: 8px; width: 90%; max-width: 380px; }

    .hck-toast { background-color: rgba(28, 28, 28, 0.94); color: #f0f0f0; padding: 10px 16px; border-radius: 8px; font-family: var(--hck-font-stack); font-size: 12.5px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); opacity: 0; transform: translateY(-30px) scale(0.95); transition: opacity 0.4s var(--hck-ease-out), transform 0.4s var(--hck-ease-out); text-align: center; width: fit-content; max-width: 100%; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.12); }

    .hck-toast.show { opacity: 1; transform: translateY(0) scale(1); }
    .hck-toast.error { background-color: rgba(192, 57, 43, 0.94); color: #fff; border-color: rgba(255,255,255,0.2); }
    .hck-toast.success { background-color: rgba(39, 174, 96, 0.94); color: #fff; border-color: rgba(255,255,255,0.2); }

    #hck-log-panel .hck-title-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #484848; }
    #hck-log-panel h3 { margin: 0; font-size: 15px; font-weight: 600; color: #d8d8d8; }

    #hck-log-content { overflow-y: auto; max-height: calc(65vh - 110px); background-color: #161616; padding: 10px; border-radius: 7px; font-size: 10px; line-height: 1.4; color: #c0c0c0; white-space: pre-wrap; word-break: break-word; border: 1px solid #3a3a3a; }

    .hck-log-entry { margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dotted #484848; }
    .hck-log-entry:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .hck-log-entry time { color: #999; margin-right: 8px; font-weight: bold; }
    .hck-log-entry code { font-family: 'Menlo', 'Consolas', monospace; }
    .hck-log-entry.error { color: #ff8c8c; font-weight: 500; }
    .hck-log-entry.success { color: #b0e8c8; }
    .hck-log-entry.api { color: #88c0f0; }
    .hck-log-entry.debug { color: #b0b0b0; }

    #hck-log-panel .log-controls { display: flex; gap: 10px; margin-top: 12px; }
    #hck-log-panel .log-controls button { width: auto; padding: 8px 14px; background-color: transparent; border: 1px solid #fff; }
    #hck-log-panel .log-controls button.clear { background-color: #903838; border-color: #fff; }
`;

        function addBookmarkletStyles() { try { const s = document.createElement("style"); s.type = "text/css"; s.innerText = styles; document.head.appendChild(s); logToMemory("Estilos injetados.", "debug"); } catch (e) { console.error(`${SCRIPT_NAME} StyleErr:`, e); logToMemory(`Erro ao injetar estilos: ${e}`, "error"); } }
        function createToastContainer() { if (!document.getElementById('hck-toast-container')) { toastContainer = document.createElement('div'); toastContainer.id = 'hck-toast-container'; document.body.appendChild(toastContainer); } else { toastContainer = document.getElementById('hck-toast-container'); } }
        function showToast(message, type = 'info', duration = TOAST_DURATION) { if (!toastContainer) createToastContainer(); const t = document.createElement('div'); t.className = 'hck-toast'; t.textContent = message; if (type === 'error') t.classList.add('error'); else if (type === 'success') t.classList.add('success'); toastContainer.appendChild(t); requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('show'); }); }); setTimeout(() => { t.classList.remove('show'); setTimeout(() => { if (t.parentNode === toastContainer) toastContainer.removeChild(t); }, 500); }, duration); }
        function logToMemory(message, type = 'info') { const ts = new Date(); const e = { timestamp:ts, type, message }; logArray.push(e); if (type !== 'debug') console[type === 'error' ? 'error' : 'log'](`[${formatTime(ts)}] ${type.toUpperCase()}: ${message}`); if (logPanelVisible && logContentDiv) renderSingleLogEntry(e); }
        function updateStatus(message, type = 'info', showToastFlag = false) { if (statusLine) { statusLine.textContent = message; statusLine.className = 'hck-status-line'; if (type === 'error') statusLine.classList.add('error'); else if (type === 'success') statusLine.classList.add('success'); } const lt = (type === 'info' || type === 'debug') ? type : (type === 'error' ? 'error' : 'success'); logToMemory(message, lt); if (showToastFlag) showToast(message, type); }
        function formatTime(d) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
        function renderSingleLogEntry(e) { if (!logContentDiv) return; const d = document.createElement('div'); d.className = `hck-log-entry ${e.type}`; const t = document.createElement('time'); t.textContent = `[${formatTime(e.timestamp)}]`; const c = document.createElement('code'); c.textContent = e.message; d.appendChild(t); d.appendChild(c); logContentDiv.appendChild(d); logContentDiv.scrollTop = logContentDiv.scrollHeight; }
        function renderLogs() { if (!logContentDiv) return; logContentDiv.innerHTML = ''; logArray.forEach(renderSingleLogEntry); }
        function clearLogs() { logArray = []; renderLogs(); logToMemory("Logs do painel limpos.", "info"); showToast("Logs do painel limpos"); }
        function createLogPanel() { if (document.getElementById('hck-log-panel')) return; logPanel = document.createElement('div'); logPanel.id = 'hck-log-panel'; const tb = document.createElement('div'); tb.className = 'hck-title-bar'; const ti = document.createElement('h3'); ti.textContent = 'Logs Detalhados'; tb.appendChild(ti); logPanel.appendChild(tb); logContentDiv = document.createElement('div'); logContentDiv.id = 'hck-log-content'; logPanel.appendChild(logContentDiv); const cd = document.createElement('div'); cd.className = 'log-controls'; const cb = document.createElement('button'); cb.textContent = 'Limpar'; cb.className = 'clear'; cb.onclick = clearLogs; const clb = document.createElement('button'); clb.textContent = 'Fechar'; clb.onclick = toggleLogPanel; cd.appendChild(cb); cd.appendChild(clb); logPanel.appendChild(cd); document.body.appendChild(logPanel); renderLogs(); }
        function toggleLogPanel() { if (!logPanel) createLogPanel(); logPanelVisible = !logPanelVisible; if (logPanel) logPanel.classList.toggle('visible', logPanelVisible); if (logPanelVisible) { menuPanel?.classList.remove('visible'); menuVisible = false; renderLogs(); } }

        function createUI() {
            logToMemory('Iniciando criação da UI', 'debug'); if (!document.body) { logToMemory('document.body não pronto em createUI', 'error'); return; } if (document.getElementById('hck-toggle-button')) { logToMemory('UI já existe, ignorando.', 'debug'); return; }
            try {
                createToastContainer(); toggleButton = document.createElement('div'); toggleButton.id = 'hck-toggle-button'; toggleButton.textContent = SCRIPT_NAME; toggleButton.onclick = toggleMenu; document.body.appendChild(toggleButton); menuPanel = document.createElement('div'); menuPanel.id = 'hck-menu-panel'; const tb = document.createElement('div'); tb.className = 'hck-title-bar'; const ti = document.createElement('h3'); ti.textContent = SCRIPT_NAME; const cs = document.createElement('span'); cs.className = 'hck-credits'; cs.textContent = CREDITS; tb.appendChild(ti); tb.appendChild(cs); menuPanel.appendChild(tb); runButton = document.createElement('button'); runButton.textContent = 'Gerar Redação'; runButton.onclick = () => { if (!isRunning && !isClearing) mainProcessWrapper(); }; menuPanel.appendChild(runButton); clearButton = document.createElement('button'); clearButton.textContent = 'Limpar Campos'; clearButton.className = 'clear-button'; clearButton.onclick = () => { if (!isRunning && !isClearing) clearFieldsProcessWrapper(); }; menuPanel.appendChild(clearButton); const logButton = document.createElement('button'); logButton.textContent = 'Ver Logs'; logButton.onclick = toggleLogPanel; menuPanel.appendChild(logButton); statusLine = document.createElement('div'); statusLine.id = 'hck-status-line'; statusLine.textContent = 'Pronto.'; menuPanel.appendChild(statusLine); document.body.appendChild(menuPanel); makeDraggable(menuPanel); logToMemory('UI criada com sucesso.', 'success');
            } catch (e) { logToMemory(`Erro crítico ao criar UI: ${e}`, 'error'); alert('Falha ao criar a interface do bookmarklet.'); }
        }

        function toggleMenu() { menuVisible = !menuVisible; if (menuPanel) menuPanel.classList.toggle('visible', menuVisible); if (menuVisible) { logPanel?.classList.remove('visible'); logPanelVisible = false; } }
        async function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

        async function insertTextIntoTextarea(parentElement, textToInsert, fieldName) {
            const operation = textToInsert === '' ? 'limpar' : 'inserir';
            const shortText = textToInsert.substring(0,20).replace(/\n/g, ' ');
            logToMemory(`Tentando ${operation} ${fieldName} ('${shortText}...').`, 'debug');
            updateStatus(`${operation === 'limpar' ? 'Limpando' : 'Inserindo'} ${fieldName}...`);

            const textarea = parentElement.querySelector('textarea:not([aria-hidden="true"])');
            if (!textarea) {
                updateStatus(`Erro: Textarea para ${fieldName} não encontrado.`, 'error', true);
                logToMemory(`Textarea para ${fieldName} não encontrado dentro do parentElement.`, 'error');
                return false;
            }

            let success = false;
            const originalValue = textarea.value;

            try {
                logToMemory(`M1: Direto+Eventos [${fieldName}]`, 'debug');
                textarea.focus();
                textarea.value = textToInsert;
                textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                textarea.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                await delay(80);
                textarea.blur();
                await delay(130);
                if (textarea.value === textToInsert) success = true;
            } catch (e) {
                logToMemory(`Erro M1 [${fieldName}]: ${e.message}`, 'error');
                textarea.value = originalValue;
            }

            if (success) {
                logToMemory(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} (M1).`, 'success');
                updateStatus(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} com sucesso.`);
                return true;
            }

            try {
                logToMemory(`M2: ReactProps [${fieldName}]`, 'debug');
                const reactPropsKey = Object.keys(textarea).find(key => key.startsWith('__reactProps$') || key.startsWith('__reactEventHandlers$'));
                if (reactPropsKey) {
                    const props = textarea[reactPropsKey];
                    if (props && typeof props.onChange === 'function') {
                        textarea.focus();
                        props.onChange({ target: { value: textToInsert }, currentTarget: { value: textToInsert }, preventDefault: () => {}, stopPropagation: () => {} });
                        await delay(180);
                        textarea.blur();
                        await delay(80);
                        if (textarea.value === textToInsert) success = true;
                    } else {
                         logToMemory(`M2 [${fieldName}]: onChange não é função ou props ausente.`, 'debug');
                    }
                } else {
                    logToMemory(`M2 [${fieldName}]: Chave ReactProps não encontrada.`, 'debug');
                }
            } catch (e) {
                logToMemory(`Erro M2 [${fieldName}]: ${e.message}`, 'error');
                textarea.value = originalValue;
            }

            if (success) {
                logToMemory(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} (M2).`, 'success');
                updateStatus(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} com sucesso.`);
                return true;
            }

            try {
                logToMemory(`M3: InputEvent [${fieldName}]`, 'debug');
                textarea.focus();
                textarea.value = '';
                await delay(70);
                textarea.value = textToInsert;
                textarea.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, data: textToInsert, inputType: 'insertText' }));
                await delay(130);
                textarea.blur();
                await delay(130);
                if (textarea.value === textToInsert) success = true;
            } catch (e) {
                logToMemory(`Erro M3 [${fieldName}]: ${e.message}`, 'error');
                textarea.value = originalValue;
            }

            if (success) {
                logToMemory(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} (M3).`, 'success');
                updateStatus(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} com sucesso.`);
                return true;
            }

            await delay(250);
            if (textarea.value === textToInsert) {
                logToMemory(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} (Verificação Final).`, 'success');
                updateStatus(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} com sucesso.`);
                return true;
            } else {
                logToMemory(`Falha nos métodos interativos [${fieldName}]. Tentando valor direto como fallback.`, 'debug');
                textarea.value = textToInsert;
                await delay(100);
                textarea.blur();
                if (textarea.value === textToInsert) {
                    logToMemory(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} (Fallback Valor Direto).`, 'success');
                    updateStatus(`${fieldName} ${operation === 'limpar' ? 'limpo' : 'inserido'} (fallback).`);
                    return true;
                }
            }

            logToMemory(`Falha final ao ${operation} ${fieldName}. Valor atual: '${textarea.value.substring(0,20)}...' vs esperado: '${textToInsert.substring(0,20)}...'`, 'error');
            updateStatus(`Erro final ao ${operation} ${fieldName}. Verifique o console.`, 'error', true);
            textarea.value = originalValue;
            return false;
        }

        async function getAiResponse(prompt, operationDesc) {
            logToMemory(`API Req: ${operationDesc}`, 'api'); updateStatus(`IA: ${operationDesc}...`); let attempts = 0;
            while (attempts <= MAX_RETRIES) {
                attempts++; logToMemory(`API Tentativa ${attempts}/${MAX_RETRIES+1} para ${operationDesc}`, 'api');
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.65, topP: 0.95, topK: 40, maxOutputTokens: 8192 } // Temperatura um pouco mais baixa
                        }),
                    });
                    if (!response.ok) {
                        const errorBody = await response.text();
                        logToMemory(`API Erro ${response.status} (Tentativa ${attempts}): ${errorBody.substring(0,150)}...`, 'error');
                        if (attempts > MAX_RETRIES) throw new Error(`Falha na API (${response.status}) para ${MODEL_NAME}`);
                        updateStatus(`Erro API (${response.status}). Tentando ${attempts}/${MAX_RETRIES+1}...`, 'error');
                        await delay(1800 * attempts); continue;
                    }
                    const data = await response.json();
                    logToMemory(`API Resp OK (Tentativa ${attempts}): ${JSON.stringify(data).substring(0,100)}...`, 'debug');
                    const textContent = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!textContent) {
                        logToMemory(`API Resposta inválida (Tentativa ${attempts}): Ausência de texto.`, 'error');
                        if (attempts > MAX_RETRIES) throw new Error('Formato de resposta da API inválido.');
                        updateStatus(`Erro API (formato). Tentando ${attempts}/${MAX_RETRIES+1}...`, 'error');
                        await delay(1800 * attempts); continue;
                    }
                    logToMemory(`API ${operationDesc} SUCESSO (Tentativa ${attempts}). Len:${textContent.length}`, 'success');
                    updateStatus(`IA: ${operationDesc} concluído.`);
                    return textContent.trim();
                } catch (e) {
                    logToMemory(`Exceção na API ${operationDesc} (Tentativa ${attempts}): ${e.message}`, 'error');
                    if (attempts > MAX_RETRIES) { updateStatus(`Erro fatal na API: ${e.message}`, 'error', true); throw e; }
                    updateStatus(`Erro API. Tentando ${attempts}/${MAX_RETRIES+1}...`, 'error');
                    await delay(1800 * attempts);
                }
            }
            logToMemory(`API Falha final para ${operationDesc}.`, 'error');
            updateStatus(`Erro: Falha na API para ${operationDesc}.`, 'error', true);
            return null;
        }

        function extractPageContext() {
            logToMemory("Extraindo contexto da página...", 'info'); updateStatus("Extraindo contexto...");
            const context = {};
            const selectors = {
                coletanea: COLETANEA_SELECTOR,
                enunciado: ENUNCIADO_SELECTOR,
                generoTextual: GENERO_SELECTOR,
                criteriosAvaliacao: CRITERIOS_SELECTOR
            };
            let essentialDataMissing = false;

            for (const key in selectors) {
                try {
                    const element = document.querySelector(selectors[key]);
                    context[key] = element ? element.innerText.trim() : '';
                    if (!context[key]) {
                        logToMemory(`Contexto para '${key}' vazio ou não encontrado (Seletor: ${selectors[key]})`, 'debug');
                        if (key === 'enunciado') essentialDataMissing = true;
                    } else {
                        logToMemory(`Contexto '${key}': ${context[key].substring(0,70).replace(/\s+/g, ' ')}...`, 'debug');
                    }
                } catch (e) {
                    logToMemory(`Erro ao extrair contexto para '${key}': ${e.message}`, 'error');
                    if (key === 'enunciado') essentialDataMissing = true;
                }
            }

            if (essentialDataMissing || !context.enunciado) {
                logToMemory("Erro fatal na extração: Enunciado não encontrado ou vazio.", 'error');
                updateStatus("Erro: Enunciado não pôde ser extraído.", 'error', true);
                return null;
            }
            logToMemory("Extração de contexto concluída.", 'success');
            updateStatus("Contexto extraído com sucesso.");
            return context;
        }

         async function clearFieldsProcess() {
            logToMemory("Iniciando limpeza de campos...", 'info'); updateStatus("Limpando campos...");
            let titleCleared = false, bodyCleared = false;
            let titleFieldExists = false, bodyFieldExists = false;
            let titleTextareaParent = null;

            try {
                const titleParentCandidates = document.querySelectorAll(TITLE_TEXTAREA_PARENT_SELECTOR);
                if (titleParentCandidates.length > 0) {
                    titleTextareaParent = titleParentCandidates[0].parentElement;
                    if (titleTextareaParent) {
                        titleFieldExists = true;
                        logToMemory("Tentando limpar campo Título...", 'info');
                        titleCleared = await insertTextIntoTextarea(titleTextareaParent, '', "Título");
                    } else {
                         logToMemory("Elemento pai do Título não encontrado via seletor.", 'debug');
                    }
                } else {
                    logToMemory("Nenhum textarea para Título encontrado.", 'debug');
                }
                await delay(150);

                const bodyTextareaParents = Array.from(document.querySelectorAll(BODY_TEXTAREA_PARENT_SELECTOR)).map(el => el.parentElement);
                let bodyTextareaParentElement = null;

                if (bodyTextareaParents.length > 0) {
                    if (bodyTextareaParents.length > 1 && titleTextareaParent && bodyTextareaParents[0] === titleTextareaParent) {
                        bodyTextareaParentElement = bodyTextareaParents[1];
                    } else if (bodyTextareaParents.length > 0) {
                        bodyTextareaParentElement = bodyTextareaParents[bodyTextareaParents.length - 1];
                    }
                }

                if (bodyTextareaParentElement) {
                    bodyFieldExists = true;
                    logToMemory("Tentando limpar campo Corpo...", 'info');
                    bodyCleared = await insertTextIntoTextarea(bodyTextareaParentElement, '', "Corpo");
                } else {
                    logToMemory("Nenhum textarea para Corpo encontrado ou seu pai não foi localizado.", 'debug');
                }

                if (!titleFieldExists && !bodyFieldExists) {
                    updateStatus("Nenhum campo (Título/Corpo) encontrado para limpar.", 'error', true);
                    return;
                }

                if ((titleFieldExists && titleCleared) || (bodyFieldExists && bodyCleared) || (!titleFieldExists && bodyCleared) || (!bodyFieldExists && titleCleared) ) {
                    updateStatus("Campos limpos com sucesso!", 'success', true);
                } else {
                    let errorMsg = "Erro ao limpar ";
                    if (titleFieldExists && !titleCleared) errorMsg += "Título ";
                    if (bodyFieldExists && !bodyCleared) errorMsg += (titleFieldExists && !titleCleared ? "e " : "") + "Corpo ";
                    errorMsg += ".";
                    updateStatus(errorMsg, 'error', true);
                }

            } catch (e) {
                logToMemory(`Erro inesperado durante a limpeza: ${e.message}`, 'error');
                updateStatus("Erro inesperado ao limpar campos.", 'error', true);
            }
        }

        async function mainProcess() {
            logToMemory("Processo Principal Iniciado.", 'info');
            updateStatus("Verificando página de redação...");
            const identifierElement = document.querySelector(PAGE_IDENTIFIER_SELECTOR);
            if (!identifierElement || !identifierElement.textContent.includes(PAGE_IDENTIFIER_TEXT)) {
                logToMemory(`Verificação de página falhou. Seletor:'${PAGE_IDENTIFIER_SELECTOR}', Texto esperado:'${PAGE_IDENTIFIER_TEXT}'`, 'error');
                updateStatus(`Erro: Esta não parece ser a página de ${PAGE_IDENTIFIER_TEXT}.`, 'error', true);
                return;
            }
            logToMemory("Verificação de página OK.", 'success');
            updateStatus("Página de redação identificada.");
            await delay(150);

            const pageContext = extractPageContext();
            if (!pageContext) return;
            await delay(150);

            const initialPrompt = `**PROMPT OTIMIZADO V9 (FOCO ABSOLUTO EM LINGUAGEM FORMAL, NATURAL E ESTUDANTIL AUTÊNTICA - SEM GÍRIAS OU COLOQUIALISMOS)**

**Objetivo Primário:** Gerar um texto dissertativo-argumentativo que soe **extremamente natural e autêntico, como se escrito por um estudante de ensino médio/pré-vestibular dedicado, bem informado e que domina a norma culta da língua portuguesa**. A linguagem deve ser formal, mas fluida, precisa e acessível, **EVITANDO COMPLETAMENTE qualquer tipo de gíria, coloquialismo excessivo, contrações informais ou tom de conversa.** O título deve ser conciso e refletir a tese.

**Contexto da Tarefa (Coletânea, Enunciado, Gênero, Critérios Fornecidos):**
${JSON.stringify(pageContext, null, 1)}

**Instruções Detalhadas para a Geração (REGRAS RÍGIDAS DE LINGUAGEM):**

1.  **TÍTULO (OBRIGATÓRIO):**
    *   Crie um título **curto (3-7 palavras), direto, formal e informativo**.
    *   Deve **sintetizar a ideia central ou a tese** do texto.
    *   **EVITE:** Títulos que soem como manchetes, poéticos, ou excessivamente criativos. Deve ser sóbrio e acadêmico.

2.  **TEXTO (2000-2800 caracteres, idealmente ~2400):**
    *   **Estrutura:** Introdução, Desenvolvimento (2 ou 3 parágrafos), Conclusão.
    *   **Linguagem e Estilo (NÃO NEGOCIÁVEL - FORMALIDADE E NATURALIDADE ESTUDANTIL):**
        *   **NORMA CULTA PADRÃO OBRIGATÓRIA:** Utilizar vocabulário preciso, variado e adequado ao contexto formal de uma redação.
        *   **PROIBIDO TERMINANTEMENTE:**
            *   **GÍRIAS E EXPRESSÕES COLOQUIAIS:** Nenhuma gíria (ex: 'galera', 'grana', 'tá ligado', 'tipo assim', 'parada', 'rolê', 'massa', 'zoado', 'pegar leve', 'dar um jeito', 'ficar de boa', 'pra caramba', 'um monte de').
            *   **LINGUAGEM EXCESSIVAMENTE INFORMAL:** Evitar 'a gente' (preferir 'nós' ou construções impessoais/voz passiva), 'tá' (usar 'está'), 'pra' (usar 'para'), 'né?' (completamente proibido), 'tipo' como vício de linguagem, 'aí', 'então' como muletas.
            *   **OPINIÕES DIRETAS E PESSOALIZAÇÃO EXCESSIVA:** Evitar 'eu acho', 'na minha opinião', 'pra mim', 'acredito que'. Apresentar ideias como análises, constatações ou inferências lógicas.
        *   **VOCABULÁRIO:** Palavras de uso corrente na norma culta, com clareza e precisão. **SEM PEDANTISMO OU ARCAÍSMOS.** Evitar termos excessivamente rebuscados que soem artificiais para um estudante.
        *   **TERMOS A EVITAR (ou usar com extrema moderação e apenas se muito natural e necessário, buscando alternativas mais comuns):** 'outrossim', 'mormente', 'hodiernamente' (prefira 'atualmente', 'nos dias atuais'), 'precipuamente', 'salientar' (prefira 'destacar', 'ressaltar'), 'é mister', 'é premente', 'urge que', 'implementar' (prefira 'adotar', 'realizar'), 'mitigar' (prefira 'reduzir', 'amenizar'), 'diante disso', 'sob essa ótica', 'nesse ínterim', 'constata-se que', 'infere-se que', 'paradigma', 'intrínseco', 'corroborar', 'destarte', 'ademais', 'conquanto', 'por conseguinte'. **Priorize fluidez e naturalidade.**
        *   **Fluidez e Coesão:** Variar a estrutura das frases. Usar conectivos formais e variados (ex: mas, porém, contudo, todavia, no entanto, entretanto, assim, desse modo, por isso, além disso, ademais – com moderação, etc.) com naturalidade e precisão.
        *   **Inícios de Parágrafo/Frase:** DIVERSIFICAR OBRIGATORIAMENTE para evitar repetição e tom mecânico.
    *   **Introdução (FORMAL E NATURAL):**
        *   Deve soar como uma redação **humana, formal e autêntica, escrita por um estudante proficiente na língua**.
        *   Apresentar o tema e a tese de forma clara, objetiva. **FUJA DE CLICHÊS BATIDOS.**
        *   **NÃO USE:** "Desde os primórdios...", "É notório que...", "Hodiernamente, muito se discute...", "Em um mundo cada vez mais...".
        *   **BUSQUE:** Uma abordagem direta, contextualizada, por exemplo: "A problemática de [tema] suscita debates relevantes na sociedade contemporânea..." ou "O cenário de [tema] demanda uma reflexão acerca de...".
    *   **Desenvolvimento (ARGUMENTOS LÓGICOS E BEM FUNDAMENTADOS):**
        *   Construa parágrafos com argumentos lógicos, baseados em conhecimento geral e no contexto, **sem copiar trechos do material de apoio.**
        *   A profundidade deve ser adequada a um estudante bem informado, sem recorrer a jargões excessivos.
    *   **Pontuação:** Uso correto e predominante de PONTO FINAL (.) e VÍRGULA (,). Outros sinais (ponto e vírgula, dois pontos) devem ser usados com parcimônia e correção.

**Modelo de Resposta OBRIGATÓRIO (Estrutura Limpa e Direta):**
TITULO: [Título Conciso, Formal e Informativo Gerado]

TEXTO:
[Introdução formal, natural, contextualizada, com tom de autoria de estudante proficiente.]

[Parágrafo de Desenvolvimento 1, com argumento lógico, formal e bem explicado.]

[Parágrafo de Desenvolvimento 2, com outro argumento lógico, formal e bem explicado. Se necessário, um terceiro.]

[Conclusão coerente, retomando a tese e apresentando uma reflexão final concisa e formal.]

**Foco Final e Inegociável:** O texto DEVE soar como um estudante talentoso e proficiente na norma culta, NÃO uma IA, NÃO um especialista, e **DEFINITIVAMENTE NÃO alguém usando linguagem informal ou gírias.** Prioridade MÁXIMA na formalidade natural da introdução, argumentos lógicos, vocabulário culto e acessível, pontuação correta. Cumprir a faixa de caracteres.`;

            const rawApiResponse = await getAiResponse(initialPrompt, "Gerando texto base");
            if (!rawApiResponse) return;

            logToMemory("Analisando resposta inicial da IA...", 'info');
            updateStatus("IA: Analisando resposta...");
            let extractedTitle = "";
            let extractedText = "";

            try {
                // Parsing mais robusto da resposta
                const rawContent = rawApiResponse;
                let textMarker = rawContent.match(/(?:TEXTO|TEXTO PRINCIPAL)\s*:\s*/i); // Case-insensitive

                if (textMarker) {
                    extractedText = rawContent.substring(textMarker.index + textMarker[0].length).trim();
                    let titleSearchArea = rawContent.substring(0, textMarker.index);
                    let titleMatch = titleSearchArea.match(/(?:TITULO|TÍTULO|\*\*TÍTULO\*\*)\s*:\s*([\s\S]*)/i); // Case-insensitive
                    if (titleMatch && titleMatch[1]) {
                        extractedTitle = titleMatch[1].trim();
                    } else {
                        logToMemory("TEXT tag found, but TITLE not found before it or malformed.", "debug");
                    }
                } else {
                    // No TEXTO marker. Does it have TITULO?
                    let titleMatch = rawContent.match(/(?:TITULO|TÍTULO|\*\*TÍTULO\*\*)\s*:\s*([\s\S]*)/i);
                    if (titleMatch && titleMatch[1]) {
                        // Assume title is usually one line or short before the main text starts
                        const potentialTitle = titleMatch[1].split('\n')[0].trim(); // Get first line as potential title
                        extractedTitle = potentialTitle;

                        // The rest after the full title match (label + content) is potential text
                        let potentialTextAfterTitle = rawContent.substring(titleMatch.index + titleMatch[0].length).trim();
                        if (potentialTextAfterTitle) {
                            extractedText = potentialTextAfterTitle;
                            logToMemory("TITLE tag found, TEXT not. Assuming remainder as text.", "debug");
                        } else if (titleMatch[1].trim().length > potentialTitle.length) {
                            // If titleMatch[1] had multiple lines, the rest of it is the text
                            extractedText = titleMatch[1].substring(potentialTitle.length).trim();
                             logToMemory("TITLE tag found, TEXT not. Multiline title content assumed as text.", "debug");
                        }
                        else {
                             logToMemory("TITLE tag found, TEXT not. Multiline title content assumed as text.", "warn");
                        }
                    } else {
                        // No TEXTO and no TITULO recognizable. Assume whole response is text.
                        logToMemory("TITLE tag found, TEXT not. Multiline title content assumed as text..", "warn");
                        extractedText = rawContent.trim();
                    }
                }

                // Final checks and cleanup
                if (!extractedText && extractedTitle && extractedTitle.length > 300) { // If title is very long and text is empty
                    logToMemory("Long title detected without separate text. Assuming title as text and cleaning title.", "warn");
                    extractedText = extractedTitle;
                    extractedTitle = ""; // Clear title if it was likely the whole text
                }
                if (!extractedText && !extractedTitle && rawContent.trim()) {
                     extractedText = rawContent.trim();
                     logToMemory("Both title and text empty after parsing, but raw response not. Using raw as text.", "warn");
                }

                if (!extractedText && !extractedTitle) {
                     throw new Error("Falha crítica: Não foi possível extrair título nem texto da resposta da IA. Resposta bruta: " + rawApiResponse.substring(0, 200));
                }
                if (extractedTitle) logToMemory(`Título extraído: ${extractedTitle}`, 'success');
                else logToMemory(`Title not extracted or missing.`, 'debug');

                if (extractedText) logToMemory(`Texto extraído (início): ${extractedText.substring(0,80).replace(/\s+/g, ' ')}... | Comprimento: ${extractedText.length}`, 'success');
                else logToMemory(`Text not extracted or missing.`, 'error');


                if (!extractedText && extractedTitle) { // Critical if title exists but no body text
                     logToMemory("Alert: Title found, but no body text was extracted. AI may not have followed the format.", "error");
                     // Decide: should we proceed with just a title? For now, let's allow it but log error.
                }
                updateStatus("IA: Initial response analyzed.");
                await delay(150);

            } catch (e) {
                logToMemory(`Error parsing AI response: ${e.message}. Raw response (start): ${rawApiResponse.substring(0,200)}...`, 'error');
                updateStatus(`AI analysis error: ${e.message}`, 'error', true);
                return;
            }

            // Se não houver texto principal, não adianta prosseguir com o refinamento.
            if (!extractedText) {
                logToMemory("Refinement cancelled: Main text body not extracted.", 'error');
                updateStatus("Error: Body text not extracted.", 'error', true);
                return;
            }

            const humanizingPrompt = `**Tarefa CRÍTICA DE REFINAMENTO (FOCO TOTAL EM FORMALIDADE E NATURALIDADE ESTUDANTIL):** Revisar e polir o texto abaixo para assegurar **MÁXIMA NATURALIDADE, AUTENTICIDADE, FORMALIDADE (NORMA CULTA) e adequação ao perfil de um estudante de ensino médio/pré-vestibular bem preparado e articulado.** O texto deve ser integralmente refinado para **ELIMINAR QUALQUER VESTÍGIO de artificialidade, gírias, linguagem excessivamente coloquial, informalidades, tom professoral, clichês de IA ou erudição forçada.** O sentido original, argumentos e estrutura devem ser 100% preservados.

**Texto Original para Refinamento:**
${extractedTitle ? 'TITULO: ' + extractedTitle + '\n\nTEXTO:\n' + extractedText : 'TEXTO:\n' + extractedText}

**Ações OBRIGATÓRIAS de Refinamento (SEM EXCEÇÕES):**
1.  **LINGUAGEM E VOCABULÁRIO (PRIORIDADE MÁXIMA):**
    *   **SUBSTITUIR IMEDIATAMENTE E COMPLETAMENTE:** Qualquer gíria (ex: 'galera', 'grana', 'tá', 'né', 'tipo', 'parada', 'rolê', 'coisas', 'um monte de'), expressão coloquial, contração informal (ex: 'pra', 'tá').
    *   **NORMA CULTA E FORMALIDADE:** Garantir o uso correto da gramática e vocabulário formal. Substituir 'a gente' por 'nós' ou construções impessoais. Usar 'está' em vez de 'tá', 'para' em vez de 'pra'.
    *   **EVITAR OPINIÕES DIRETAS:** Remover ou reformular frases como 'eu acho', 'na minha opinião', 'pra mim'.
    *   **NATURALIDADE FORMAL:** O vocabulário deve ser culto, mas comum e fluido, sem pedantismo ou palavras excessivamente raras que um estudante não usaria naturalmente.
2.  **Introdução:** Garantir um início formal, objetivo, natural e engajador, típico de uma redação bem elaborada por um estudante proficiente, sem clichês.
3.  **Argumentos:** Verificar se são apresentados como reflexões e raciocínios lógicos formais, sem parecerem afirmações de um especialista ou opiniões casuais.
4.  **Conexões e Fluidez:** Suavizar transições entre frases e parágrafos com conectivos formais, variados e naturais.
5.  **Pontuação:** Uso correto e claro da pontuação, predominantemente ponto final e vírgula.
6.  **Tom Geral:** O texto DEVE soar **INEQUIVOCAMENTE como um estudante inteligente, dedicado e proficiente na norma culta**, sem afetação e sem qualquer informalidade.

**Formato do Retorno:** APENAS o corpo do texto final TOTALMENTE REFINADO, sem NENHUM comentário, tag, ou o título novamente (apenas o corpo do texto). Se o título original precisar de pequeno ajuste de formalidade, faça-o e inclua-o no início da resposta com "TITULO REFINADO: [novo título]". Caso contrário, apenas o texto.`;

            const humanizedResponse = await getAiResponse(humanizingPrompt, "Refinando texto (Formalizando/Humanizando)");
            if (!humanizedResponse) return;
            await delay(150);

            let finalTitle = extractedTitle;
            let finalText = humanizedResponse;

            if (humanizedResponse.toUpperCase().startsWith("REFINED TITLE:")) {
                const parts = humanizedResponse.split('\n');
                finalTitle = parts[0].substring("REFINED TITLE:".length).trim();
                finalText = parts.slice(1).join('\n').trim();
                logToMemory(`AI-refined title: ${finalTitle}`, 'debug');
            }


            logToMemory("Locating Title field for insertion...", 'info');
            updateStatus("Inserting Title...");
            const titleTextareaParentCandidates = document.querySelectorAll(TITLE_TEXTAREA_PARENT_SELECTOR);
            let titleTextareaParent = null;
            if (titleTextareaParentCandidates.length > 0) {
                 titleTextareaParent = titleTextareaParentCandidates[0].parentElement;
            }

            if (!titleTextareaParent && finalTitle) { // Só erro se tiver título para inserir
                logToMemory("Erro: Elemento pai do campo de Título não encontrado.", 'error');
                updateStatus("Error: Title field not found.", "error", true);
                return;
            }
            if (finalTitle && titleTextareaParent) {
                const titleInserted = await insertTextIntoTextarea(titleTextareaParent, finalTitle, "Título");
                if (!titleInserted) return;
                await delay(400);
            } else if (!finalTitle) {
                logToMemory("No title to enter or field not found.", "debug");
            }


            logToMemory("Locating Body field for insertion...", 'info');
            updateStatus("Inserting Body Text...");

            const allTextareaParents = Array.from(document.querySelectorAll(BODY_TEXTAREA_PARENT_SELECTOR)).map(el => el.parentElement);
            let bodyTextareaParentElement = null;

            if (allTextareaParents.length > 1 && titleTextareaParent && allTextareaParents[0] === titleTextareaParent) {
                bodyTextareaParentElement = allTextareaParents[1];
            } else if (allTextareaParents.length === 1 && (!titleTextareaParent || allTextareaParents[0] !== titleTextareaParent)) {
                bodyTextareaParentElement = allTextareaParents[0];
            } else if (allTextareaParents.length > 0) {
                bodyTextareaParentElement = allTextareaParents.find(p => p !== titleTextareaParent) || allTextareaParents[allTextareaParents.length -1];
            }


            if (!bodyTextareaParentElement) {
                logToMemory("Error: Parent element of Body Text field not found.", 'error');
                updateStatus("Error: Body Text field not found.", "error", true);
                return;
            }

            const bodyInserted = await insertTextIntoTextarea(bodyTextareaParentElement, finalText, "Corpo do Texto");
            if (!bodyInserted) return;

            logToMemory("Generation and insertion process completed successfully!", 'success');
            updateStatus("Writing generated and inserted successfully!", 'success', true);
        }

         async function clearFieldsProcessWrapper() {
            if (isRunning || isClearing) { logToMemory("Cleanup action ignored: another operation in progress.", "debug"); return; }
            isClearing = true; if (runButton) runButton.disabled = true; if (clearButton) clearButton.disabled = true;
            logToMemory("==== Field Clearing Started ====", 'info');
            updateStatus("Cleaning fields...", 'info');
            try { await clearFieldsProcess(); }
            catch (e) { logToMemory(`Error in cleanup wrapper: ${e.message}`, 'error'); console.error(`${SCRIPT_NAME} Erro na Limpeza:`, e); updateStatus(`Erro ao limpar: ${e.message}`, 'error', true); }
            finally { isClearing = false; if (runButton) runButton.disabled = false; if (clearButton) clearButton.disabled = false; updateStatus("Pronto.", "info"); logToMemory("==== Limpeza de Campos Finalizada ====", 'info'); }
        }

         async function mainProcessWrapper() {
            if (isRunning || isClearing) { logToMemory("Ação de geração ignorada: outra operação em curso.", "debug"); return; }
            isRunning = true; if (runButton) runButton.disabled = true; if (clearButton) clearButton.disabled = true;
            logToMemory("==== Geração de Redação Iniciada ====", 'info');
            updateStatus("Iniciando geração...", 'info');
            try { await mainProcess(); }
            catch (e) { logToMemory(`Erro no wrapper de geração: ${e.message}`, 'error'); console.error(`${SCRIPT_NAME} Erro na Geração:`, e); updateStatus(`Erro fatal: ${e.message}`, 'error', true); }
            finally { isRunning = false; if (runButton) runButton.disabled = false; if (clearButton) clearButton.disabled = false; updateStatus("Pronto.", "info"); logToMemory("==== Geração de Redação Finalizada ====", 'info'); }
        }

        function initialize() {
// Ativa automaticamente o modo escuro ao iniciar o script
const darkCSS = `
    html, body {
        background-color: #121212 !important;
        color: #e0e0e0 !important;
    }
    * {
        background-color: transparent !important;
        color: #e0e0e0 !important;
        border-color: #444 !important;
    }
    a, a * {
        color: #9cf !important;
    }
    input, textarea, select {
        background-color: #1e1e1e !important;
        color: #eee !important;
        border: 1px solid #555 !important;
    }
`;
const darkModeStyleEl = document.createElement('style');
darkModeStyleEl.id = 'hck-dark-mode-style';
darkModeStyleEl.textContent = darkCSS;
document.head.appendChild(darkModeStyleEl);

            logToMemory("initializing..", 'info');
            addBookmarkletStyles();
            createUI();
            const translateToEnglishButton = document.createElement('button');
translateToEnglishButton.textContent = 'Traduzir para Inglês';
translateToEnglishButton.style.marginTop = '4px';
translateToEnglishButton.style.padding = '9px 10px';
translateToEnglishButton.style.border = '1px solid #fff';
translateToEnglishButton.style.backgroundColor = 'transparent';
translateToEnglishButton.style.color = '#f0f0f0';
translateToEnglishButton.style.borderRadius = '7px';
translateToEnglishButton.style.fontSize = '12.5px';
translateToEnglishButton.style.fontWeight = '500';
translateToEnglishButton.style.cursor = 'pointer';
translateToEnglishButton.style.transition = 'background-color 0.2s ease-out, transform 0.1s ease-out';
translateToEnglishButton.style.width = '100%';
translateToEnglishButton.onclick = () => {
    const translations = {
        "Ver Projetos": "Check My Projects.",
        "Modo Claro": "Light Mode",
        "Modo Escuro": "Dark Mode",
        "Gerar Redação": "Generate Essay",
        "Limpar Campos": "Clear Fields",
        "Ver Logs": "View Logs",
        "Pronto.": "Ready.",
        "Logs Detalhados": "Detailed Logs",
        "Limpar": "Clear",
        "Fechar": "Close"
    };
    document.querySelectorAll('*').forEach(el => {
        if (el.innerText && translations[el.innerText]) {
            el.innerText = translations[el.innerText];
        }
    });
    showToast("Interface translated to English!", "success");
};
menuPanel.appendChild(translateToEnglishButton);

            const translateButton = document.createElement('button');
translateButton.textContent = 'Traduzir para Português';
translateButton.style.marginTop = '4px';
translateButton.style.padding = '9px 10px';
translateButton.style.border = '1px solid #fff';
translateButton.style.backgroundColor = 'transparent';
translateButton.style.color = '#f0f0f0';
translateButton.style.borderRadius = '7px';
translateButton.style.fontSize = '12.5px';
translateButton.style.fontWeight = '500';
translateButton.style.cursor = 'pointer';
translateButton.style.transition = 'background-color 0.2s ease-out, transform 0.1s ease-out';
translateButton.style.width = '100%';
translateButton.onclick = () => {
    const translations = {
        "Check My Projects.": "Ver Projetos",
        "Light Mode": "Modo Claro",
        "Dark Mode": "Modo Escuro",
        "Generate Essay": "Gerar Redação",
        "Clear Fields": "Limpar Campos",
        "View Logs": "Ver Logs",
        "Ready.": "Pronto.",
        "Detailed Logs": "Logs Detalhados",
        "Clear": "Limpar",
        "Close": "Fechar"
    };
    document.querySelectorAll('*').forEach(el => {
        if (el.innerText && translations[el.innerText]) {
            el.innerText = translations[el.innerText];
        }
    });
    showToast("Interface traduzida com sucesso!", "success");
};
menuPanel.appendChild(translateButton);

const projetosButton = document.createElement('button');
projetosButton.textContent = 'Check My Projects.';
projetosButton.style.marginTop = '4px';
projetosButton.style.padding = '9px 10px';
projetosButton.style.border = '1px solid #fff';
projetosButton.style.borderRadius = '7px';
projetosButton.style.fontSize = '12.5px';
projetosButton.style.fontWeight = '500';
projetosButton.style.cursor = 'pointer';
projetosButton.style.width = '100%';
projetosButton.style.background = 'linear-gradient(90deg, red, orange, blue, indigo, violet)';
projetosButton.style.backgroundSize = '400% 100%';
projetosButton.style.color = '#fff';
projetosButton.style.animation = 'rgbFlow 6s linear infinite';

projetosButton.onclick = function() {
    window.open('https://seulink.com/projetos', '_blank'); // Troque pelo seu link real
};

const rgbAnimationStyle = document.createElement('style');
rgbAnimationStyle.textContent = `
@keyframes rgbFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
}`;
document.head.appendChild(rgbAnimationStyle);

menuPanel.appendChild(projetosButton);

const lightModeButton = document.createElement('button');
lightModeButton.textContent = 'Light Mode';
lightModeButton.style.marginTop = '4px';
lightModeButton.style.padding = '9px 10px';
lightModeButton.style.border = '1px solid #fff';
lightModeButton.style.backgroundColor = 'transparent';
lightModeButton.style.color = '#f0f0f0';
lightModeButton.style.borderRadius = '7px';
lightModeButton.style.fontSize = '12.5px';
lightModeButton.style.fontWeight = '500';
lightModeButton.style.cursor = 'pointer';
lightModeButton.style.transition = 'background-color 0.2s ease-out, transform 0.1s ease-out';
lightModeButton.style.width = '100%';

lightModeButton.onclick = function() {
    const styleEl = document.getElementById('hck-dark-mode-style');
    if (styleEl) {
        styleEl.remove();
        showToast("Light Mode activated.", "success");
    } else {
        showToast("It is already in light mode.", "info");
    }
};

menuPanel.appendChild(lightModeButton);

const darkModeButton = document.createElement('button');
darkModeButton.textContent = 'Dark Mode';
darkModeButton.style.marginTop = '4px';
darkModeButton.style.padding = '9px 10px';
darkModeButton.style.border = '1px solid #fff';
darkModeButton.style.backgroundColor = 'transparent';
darkModeButton.style.color = '#f0f0f0';
darkModeButton.style.borderRadius = '7px';
darkModeButton.style.fontSize = '12.5px';
darkModeButton.style.fontWeight = '500';
darkModeButton.style.cursor = 'pointer';
darkModeButton.style.transition = 'background-color 0.2s ease-out, transform 0.1s ease-out';
darkModeButton.style.width = '100%';

darkModeButton.onclick = function() {
    const darkCSS = `
        html, body {
            background-color: #121212 !important;
            color: #e0e0e0 !important;
        }
        * {
            background-color: transparent !important;
            color: #e0e0e0 !important;
            border-color: #444 !important;
        }
        a, a * {
            color: #9cf !important;
        }
        input, textarea, select {
            background-color: #1e1e1e !important;
            color: #eee !important;
            border: 1px solid #555 !important;
        }
    `;
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'hck-dark-mode-style');
    styleEl.textContent = darkCSS;
    document.head.appendChild(styleEl);
    showToast("Dark Mode activated!", "success");

  
};

menuPanel.appendChild(darkModeButton);
            if (document.getElementById('hck-toggle-button')) {
                updateStatus("Pronto.");
                logToMemory("Ready UI.", 'info');
                showToast(`${SCRIPT_NAME} Loaded!`, 'success', 2500);
            } else {
                 logToMemory("Initial UI creation failed.", "error");
                 setTimeout(createUI, 600);
            }
        }

        if (document.readyState === 'loading') {
            logToMemory("Documento ainda carregando. Aguardando DOMContentLoaded.", 'debug');
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            logToMemory("DOM já carregado. Inicializando com pequeno delay.", 'debug');
            setTimeout(initialize, 300);
        }

    } catch (globalError) {
        console.error('Erro na inicialização do script!', globalError);
        if (typeof logToMemory === 'function') {
            logToMemory(`Erro global catastrófico no script: ${globalError.message} \nStack: ${globalError.stack}`, 'error');
        }
        alert(`Erro crítico no script: ${globalError.message}. Check F12.`);
    }
  function makeDraggable(element) {
    let isDragging = false, offsetX = 0, offsetY = 0;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.cursor = 'grabbing';
        element.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
        }
    });
}

window.addEventListener('load', () => {
    const toggleButton = document.getElementById('hck-toggle-button');
    const menuPanel = document.getElementById('hck-menu-panel');

    if (toggleButton) {
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.width = '50px';
        toggleButton.style.height = '50px';
        toggleButton.style.padding = '0';
        toggleButton.style.display = 'flex';
        toggleButton.style.alignItems = 'center';
        toggleButton.style.justifyContent = 'center';
        toggleButton.innerText = '☰';
        makeDraggable(toggleButton);
    }

    if (menuPanel) {
        makeDraggable(menuPanel);
    }
});

})();
