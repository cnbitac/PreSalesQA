(function () {
    const storageKeys = {
        feedback: "pdm_sales_feedback",
        noAnswer: "pdm_sales_no_answer",
        ratings: "pdm_sales_ratings",
        drafts: "pdm_sales_drafts",
        imports: "pdm_sales_imports"
    };

    let selectResult = undefined;

    const rawState = {
        query: "",
        role: "",
        objection: "",
        device: "",
        industry: "",
        systems: [],
        selectedId: "",
        adminOpen: false
    };

    const onStateChange = async (key, oldVal, newVal) => {
        const params = structuredClone(rawState)
        await render(params)
    };

    // 创建代理监听
    const state = new Proxy(rawState, {
        set(target, key, value) {
            const old = Reflect.get(target, key);
            if (JSON.stringify(old) === JSON.stringify(value)) return true;
            const success = Reflect.set(target, key, value);
            onStateChange(key, old, value);
            return success;
        }
    });

    const $ = (id) => document.getElementById(id);
    const els = {
        queryInput: $("queryInput"),
        clearQuery: $("clearQuery"),
        roleChips: $("roleChips"),
        objectionChips: $("objectionChips"),
        deviceChips: $("deviceChips"),
        industrySelect: $("industrySelect"),
        roleSelect: $("roleSelect"),
        deviceSelect: $("deviceSelect"),
        objectionSelect: $("objectionSelect"),
        systemChecks: $("systemChecks"),
        resetContext: $("resetContext"),
        guardrailCard: $("guardrailCard"),
        resultCount: $("resultCount"),
        resultsList: $("resultsList"),
        emptyAnswer: $("emptyAnswer"),
        answerCard: $("answerCard"),
        answerCategory: $("answerCategory"),
        answerQuestion: $("answerQuestion"),
        sensitiveNotice: $("sensitiveNotice"),
        oneLine: $("oneLine"),
        talkTrack: $("talkTrack"),
        followUps: $("followUps"),
        shareSummary: $("shareSummary"),
        sourceMeta: $("sourceMeta"),
        copyAll: $("copyAll"),
        rateGood: $("rateGood"),
        rateBad: $("rateBad"),
        feedbackForm: $("feedbackForm"),
        feedbackQuestion: $("feedbackQuestion"),
        feedbackWords: $("feedbackWords"),
        feedbackCompetitor: $("feedbackCompetitor"),
        feedbackNotes: $("feedbackNotes"),
        feedbackToast: $("feedbackToast"),
        adminToggle: $("adminToggle"),
        adminPanel: $("adminPanel"),
        closeAdmin: $("closeAdmin"),
        metricKnowledge: $("metricKnowledge"),
        metricPending: $("metricPending"),
        metricNoAnswer: $("metricNoAnswer"),
        metricLowRating: $("metricLowRating"),
        importFile: $("importFile"),
        importStatus: $("importStatus"),
        reviewQueue: $("reviewQueue"),
        draftList: $("draftList")
    };

    function readStore(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeStore(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function normalize(text) {
        return String(text || "").toLowerCase().replace(/\s+/g, "");
    }

    function unique(values) {
        return Array.from(new Set(values.filter(Boolean)));
    }

    function formatDateTime(date) {
        const pad = (num) => String(num).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function createId() {
        if (window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function buildChips(type, values, container) {
        container.innerHTML = "";
        values.forEach((value) => {
            const button = document.createElement("button");
            button.className = "chip";
            button.type = "button";
            button.textContent = value;
            button.dataset.type = type;
            button.dataset.value = value;
            container.appendChild(button);
        });
    }

    function buildSelect(select, values, emptyText) {
        select.innerHTML = "";
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = emptyText;
        select.appendChild(empty);
        values.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function buildSystems() {
        els.systemChecks.innerHTML = "";
        FACETS.systems.forEach((system) => {
            const label = document.createElement("label");
            label.className = "check-pill";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = system;
            label.append(input, document.createTextNode(system));
            els.systemChecks.appendChild(label);
        });
    }

    function bindEvents() {
        els.queryInput.addEventListener("input", () => {
            state.query = els.queryInput.value.trim();
        });

        els.clearQuery.addEventListener("click", () => {
            state.query = "";
            els.queryInput.value = "";
        });

        document.querySelectorAll(".chip").forEach((button) => {
            button.addEventListener("click", () => {
                const type = button.dataset.type;
                const value = button.dataset.value;
                state[type] = state[type] === value ? "" : value;
            });
        });

        els.industrySelect.addEventListener("change", () => {
            state.industry = els.industrySelect.value;
        });
        els.roleSelect.addEventListener("change", () => {
            state.role = els.roleSelect.value;
        });
        els.deviceSelect.addEventListener("change", () => {
            state.device = els.deviceSelect.value;
        });
        els.objectionSelect.addEventListener("change", () => {
            state.objection = els.objectionSelect.value;
        });
        els.systemChecks.addEventListener("change", () => {
            state.systems = Array.from(els.systemChecks.querySelectorAll("input:checked")).map((input) => input.value);
        });

        els.resetContext.addEventListener("click", () => {
            state.query = "";
            state.role = "";
            state.objection = "";
            state.device = "";
            state.industry = "";
            state.systems = "";
            state.selectedId = "";
        });

        els.resultsList.addEventListener("click", (event) => {
            const card = event.target.closest("[data-id]");
            if (!card) return;
            state.selectedId = card.dataset.id;
        });

        document.querySelectorAll("[data-copy-target]").forEach((button) => {
            button.addEventListener("click", () => copySection(button.dataset.copyTarget));
        });
        els.copyAll.addEventListener("click", copyAll);
        els.rateGood.addEventListener("click", () => rateSelected("good"));
        els.rateBad.addEventListener("click", () => rateSelected("bad"));

        els.feedbackForm.addEventListener("submit", submitFeedback);
        els.adminToggle.addEventListener("click", () => {
            state.adminOpen = !state.adminOpen;
            renderAdmin();
        });
        els.closeAdmin.addEventListener("click", () => {
            state.adminOpen = false;
        });
        els.importFile.addEventListener("change", handleImport);
        els.reviewQueue.addEventListener("click", handleReviewAction);
    }

    function syncContextControls() {
        els.industrySelect.value = state.industry;
        els.roleSelect.value = state.role;
        els.deviceSelect.value = state.device;
        els.objectionSelect.value = state.objection;
        els.systemChecks.querySelectorAll("input").forEach((input) => {
            input.checked = state.systems.includes(input.value);
        });
        document.querySelectorAll(".chip").forEach((button) => {
            button.classList.toggle("active", state[button.dataset.type] === button.dataset.value);
        });
    }

    async function render(values) {
        const data = await loadKnowledgeData(values);
        syncContextControls();

        if (!state.selectedId) {
            state.selectedId = data[0].id;
        }

        const answer = data.filter((item) => item.id === state.selectedId).pop();
        selectResult = answer;

        renderResults(data);
        renderAnswer(answer);
        renderGuardrails(data);
        renderAdmin();
    }

    function renderResults(matches) {
        els.resultCount.textContent = matches.length;
        els.resultsList.innerHTML = "";

        if (matches.length === 0) {
            recordNoAnswer();
            const empty = document.createElement("div");
            empty.className = "no-result";
            empty.innerHTML = "<strong>未找到已审核资料</strong><p>不要临场编造价格、案例、认证或承诺。建议提交现场问题，由产品/售前确认后补充到知识库。</p>";
            els.resultsList.appendChild(empty);
            return;
        }

        matches.forEach((item) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "result-card";
            card.dataset.id = item.id;
            if (item.id === state.selectedId) card.classList.add("selected");

            const tags = unique([item.category, ...item.roles.slice(0, 2), ...item.objections.slice(0, 1)])
                .map((tag) => `<span>${tag}</span>`)
                .join("");

            card.innerHTML = `
        <div class="result-title">${escapeHtml(item.question)}</div>
        <p>${escapeHtml(item.core)}</p>
        <div class="tag-row">${tags}</div>
      `;
            els.resultsList.appendChild(card);
        });
    }

    function renderAnswer(answer) {
        if (!answer) {
            els.emptyAnswer.hidden = false;
            els.answerCard.hidden = true;
            return;
        }

        const composed = composeAnswer(answer);
        els.emptyAnswer.hidden = true;
        els.answerCard.hidden = false;
        els.answerCategory.textContent = answer.category;
        els.answerQuestion.textContent = answer.question;
        els.oneLine.textContent = composed.oneLine;
        els.talkTrack.textContent = composed.talkTrack;
        els.followUps.innerHTML = "";
        composed.followUps.forEach((text) => {
            const li = document.createElement("li");
            li.textContent = text;
            els.followUps.appendChild(li);
        });
        els.shareSummary.textContent = composed.shareSummary;
        els.sourceMeta.textContent = `来源：${answer.source} / ${answer.version} / ${answer.updatedAt}`;

        const notice = getSensitiveNotice(answer);
        els.sensitiveNotice.hidden = !notice;
        els.sensitiveNotice.textContent = notice;
    }

    function composeAnswer(answer) {
        const role = state.role || firstOrDefault(answer.roles, "客户");
        const industry = state.industry || "客户现场";
        const device = state.device || firstOrDefault(answer.devices, "关键设备");
        const systemsText = state.systems.length ? `，并结合客户已有的${state.systems.join("、")}` : "";
        const lead = `如果对方是${role}，可以先把重点落在${device}的真实运行状态上`;
        const proofText = answer.proof.slice(0, 3).join("；");
        const talkTrack = `${lead}。基于已审核资料，我们可以这样沟通：${answer.core}${systemsText}。具体来看，${proofText}。建议先用小范围试点或现场台账验证，再进入报价、实施和验收细节。`;
        const contextFollowUps = [];

        if (!state.industry) contextFollowUps.push("客户属于哪个行业，是否有同类工况或案例诉求？");
        if (!state.device) contextFollowUps.push("这次优先想解决哪类设备的停机或维修问题？");
        if (state.systems.length) contextFollowUps.push(`现有${state.systems.join("、")}里哪些数据可以开放只读接口？`);

        return {
            oneLine: answer.core,
            talkTrack,
            followUps: unique([...answer.follow_ups, ...contextFollowUps]).slice(0, 5),
            shareSummary: `您好，针对${industry}${device}场景，${answer.share}涉及价格、证书、案例或合同承诺时，我们会提供正式审核资料。`
        };
    }

    function getSensitiveNotice(item) {
        const q = normalize(state.query);
        const sensitiveWords = ["具体价格", "报价", "合同", "承诺", "保证", "认证编号", "客户名单", "补贴", "质保", "免费"];
        const hitByQuery = sensitiveWords.some((word) => q.includes(normalize(word)));
        if (!item.sensitive.length && !hitByQuery) return "";
        const topics = unique([...item.sensitive, ...(hitByQuery ? ["敏感问法"] : [])]).join("、");
        return `风控提醒：${topics}只能引用已审核资料；不要承诺具体价格、案例、认证编号、补贴结果或 SLA，正式口径以售前/产品确认文件为准。`;
    }

    function renderGuardrails(matches) {
        const notices = [];
        const query = state.query.trim();
        if (query && matches.length === 0) {
            notices.push("未找到已审核知识时，应提交待审核问题，不要自由生成对外承诺。");
        }
        if (/(报价|价格|合同|认证编号|补贴|质保|客户名单|保证|承诺)/.test(query)) {
            notices.push("敏感内容需使用正式资料：价格、认证、案例、补贴和 SLA 不由模型自由生成。");
        }
        if (!state.role || !state.device) {
            notices.push("补充客户角色和设备类型后，话术会更贴近现场。");
        }

        els.guardrailCard.hidden = notices.length === 0;
        els.guardrailCard.innerHTML = notices.map((notice) => `<p>${escapeHtml(notice)}</p>`).join("");
    }

    function copySection(target) {
        if (!selectResult) return;
        const composed = composeAnswer(selectResult);
        const map = {
            oneLine: composed.oneLine,
            talkTrack: composed.talkTrack,
            followUps: composed.followUps.map((text, index) => `${index + 1}. ${text}`).join("\n"),
            shareSummary: composed.shareSummary
        };
        copyText(map[target] || "");
    }

    function copyAll() {
        if (!selectResult) return;
        const composed = composeAnswer(selectResult);
        const text = [
            `问题：${selectResult.question}`,
            `一句话回答：${composed.oneLine}`,
            `展开话术：${composed.talkTrack}`,
            `建议追问：${composed.followUps.map((value, index) => `${index + 1}. ${value}`).join(" ")}`,
            `可转发摘要：${composed.shareSummary}`
        ].join("\n");
        copyText(text);
    }

    function copyText(text) {
        if (!text) return;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
            return;
        }
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
    }

    function rateSelected(value) {
        if (!state.selectedId) return;
        const ratings = readStore(storageKeys.ratings, []);
        ratings.push({
            id: createId(),
            knowledgeId: state.selectedId,
            value,
            query: state.query,
            context: getContextSnapshot(),
            createdAt: new Date().toISOString()
        });
        writeStore(storageKeys.ratings, ratings);
        renderAdmin();
    }

    function submitFeedback(event) {
        event.preventDefault();
        const question = els.feedbackQuestion.value.trim();
        if (!question) {
            els.feedbackToast.textContent = "请先填写客户原问题。";
            return;
        }

        const list = readStore(storageKeys.feedback, []);
        list.unshift({
            id: createId(),
            question,
            words: els.feedbackWords.value.trim(),
            competitor: els.feedbackCompetitor.value.trim(),
            notes: els.feedbackNotes.value.trim(),
            status: "待审核",
            context: getContextSnapshot(),
            createdAt: new Date().toISOString()
        });
        writeStore(storageKeys.feedback, list);
        els.feedbackForm.reset();
        els.feedbackToast.textContent = "已提交，等待产品/售前审核。";
        renderAdmin();
    }

    function getContextSnapshot() {
        return {
            role: state.role,
            objection: state.objection,
            device: state.device,
            industry: state.industry,
            systems: state.systems.slice()
        };
    }

    function recordNoAnswer() {
        const query = state.query.trim();
        if (query.length < 2) return;
        const list = readStore(storageKeys.noAnswer, []);
        const last = list[0];
        if (last && last.query === query) return;
        list.unshift({
            id: createId(),
            query,
            context: getContextSnapshot(),
            createdAt: new Date().toISOString()
        });
        writeStore(storageKeys.noAnswer, list.slice(0, 100));
    }

    async function renderAdmin() {
        els.adminPanel.hidden = !state.adminOpen;
        els.adminToggle.classList.toggle("active", state.adminOpen);

        let count = 0;
        if (state.adminOpen) {
            const d = await countKnowledge()
            count = d.total;
        }

        const feedback = readStore(storageKeys.feedback, []);
        const noAnswer = readStore(storageKeys.noAnswer, []);
        const ratings = readStore(storageKeys.ratings, []);
        const drafts = readStore(storageKeys.drafts, []);
        const imports = readStore(storageKeys.imports, []);
        const pending = feedback.filter((item) => item.status !== "已审核");
        const lowRatings = ratings.filter((item) => item.value === "bad");

        els.metricKnowledge.textContent = count;
        els.metricPending.textContent = pending.length;
        els.metricNoAnswer.textContent = noAnswer.length;
        els.metricLowRating.textContent = lowRatings.length;

        els.importStatus.innerHTML = imports.length
            ? imports.map((item) => `<div class="admin-item"><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.status)} / ${formatDateTime(new Date(item.createdAt))}</p></div>`).join("")
            : "<p class=\"muted\">暂无上传记录</p>";

        els.reviewQueue.innerHTML = pending.length
            ? pending.map((item) => `
        <div class="admin-item">
          <strong>${escapeHtml(item.question)}</strong>
          <p>${escapeHtml(item.words || item.notes || "无补充上下文")}</p>
          <div class="admin-actions">
            <button type="button" data-action="approve" data-id="${item.id}">标记已审核</button>
            <button type="button" data-action="draft" data-id="${item.id}">生成知识草稿</button>
          </div>
        </div>
      `).join("")
            : "<p class=\"muted\">暂无待审核问题</p>";

        els.draftList.innerHTML = drafts.length
            ? drafts.map((item) => `<div class="admin-item"><strong>${escapeHtml(item.question)}</strong><p>${escapeHtml(item.core || "待补充标准答案")}</p></div>`).join("")
            : "<p class=\"muted\">暂无知识草稿</p>";
    }

    function handleReviewAction(event) {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const feedback = readStore(storageKeys.feedback, []);
        const item = feedback.find((entry) => entry.id === button.dataset.id);
        if (!item) return;

        if (button.dataset.action === "approve") {
            item.status = "已审核";
            item.reviewedAt = new Date().toISOString();
            writeStore(storageKeys.feedback, feedback);
        }

        if (button.dataset.action === "draft") {
            const drafts = readStore(storageKeys.drafts, []);
            drafts.unshift({
                id: createId(),
                question: item.question,
                core: "",
                source: "销售提交",
                status: "草稿",
                context: item.context,
                createdAt: new Date().toISOString()
            });
            item.status = "已转草稿";
            item.reviewedAt = new Date().toISOString();
            writeStore(storageKeys.drafts, drafts);
            writeStore(storageKeys.feedback, feedback);
        }

        renderAdmin();
    }

    function handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        const imports = readStore(storageKeys.imports, []);
        const record = {
            id: createId(),
            name: file.name,
            status: "已接收，等待解析",
            createdAt: new Date().toISOString()
        };

        if (/\.(txt|md)$/i.test(file.name)) {
            const reader = new FileReader();
            reader.onload = () => {
                const parsed = parseFaqText(String(reader.result || ""));
                const drafts = readStore(storageKeys.drafts, []);
                parsed.forEach((item) => drafts.unshift(item));
                writeStore(storageKeys.drafts, drafts);
                record.status = `已解析 ${parsed.length} 条问答草稿`;
                imports.unshift(record);
                writeStore(storageKeys.imports, imports);
                renderAdmin();
            };
            reader.readAsText(file, "utf-8");
            return;
        }

        if (/\.docx$/i.test(file.name)) {
            record.status = "DOCX 已入队，需后台解析服务拆分 FAQ";
        }
        imports.unshift(record);
        writeStore(storageKeys.imports, imports);
        renderAdmin();
    }

    function parseFaqText(text) {
        const chunks = text.split(/(?=问题[:：])/g);
        return chunks.map((chunk) => {
            const questionMatch = chunk.match(/问题[:：]\s*([\s\S]*?)(?=解答[:：]|$)/);
            const answerMatch = chunk.match(/解答[:：]\s*([\s\S]*)/);
            if (!questionMatch) return null;
            return {
                id: createId(),
                question: questionMatch[1].trim().slice(0, 160),
                core: answerMatch ? answerMatch[1].trim().slice(0, 240) : "",
                source: "文档解析",
                status: "草稿",
                createdAt: new Date().toISOString()
            };
        }).filter(Boolean);
    }

    function firstOrDefault(values, fallback) {
        return values && values.length ? values[0] : fallback;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    async function loadKnowledgeData(query) {
        try {
            const params = new URLSearchParams(query);
            const res = await fetch(`/api/knowledge?${params}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            });
            const json = await res.json();
            return json.data || [];
        } catch (err) {
            console.error("接口拉取知识失败", err);
            return false;
        }
    }

    async function countKnowledge() {
        try {
            const res = await fetch("/api/knowledge/count", {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            });
            const json = await res.json();
            return json.data || [];
        } catch (err) {
            console.error("接口拉取知识库记录条数失败", err);
            return false;
        }
    }

    document.addEventListener("DOMContentLoaded", async function () {
        buildChips("role", FACETS.roles, els.roleChips);
        buildChips("objection", FACETS.objections, els.objectionChips);
        buildChips("device", FACETS.devices, els.deviceChips);

        buildSelect(els.industrySelect, FACETS.industries, "不限行业");
        buildSelect(els.roleSelect, FACETS.roles, "不限角色");
        buildSelect(els.deviceSelect, FACETS.devices, "不限设备");
        buildSelect(els.objectionSelect, FACETS.objections, "不限异议");
        buildSystems();
        bindEvents();

        await render()
    });
})();
