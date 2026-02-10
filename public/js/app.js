// ============================================================
//  WhatsApp Bulk Messenger — Frontend Application Logic
// ============================================================

const API = '';  // Same origin

// ==================== STATE ====================
let allContacts = [];
let allTemplates = [];
let allCampaigns = [];
let selectedTemplate = null;
let campaignContacts = [];
let activeCampaignId = null;
let pollTimer = null;

// ==================== NAVIGATION ====================
function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const section = document.getElementById('page-' + page);
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);

    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');

    const titles = {
        dashboard: '📊 Dashboard',
        contacts: '👥 Contacts',
        templates: '📝 Message Templates',
        campaigns: '🚀 Campaigns',
        'create-campaign': '➕ Create New Campaign',
        logs: '📋 Message Logs',
        settings: '⚙️ Settings'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Load page-specific data
    if (page === 'dashboard') loadDashboard();
    if (page === 'contacts') loadContacts();
    if (page === 'templates') loadTemplates();
    if (page === 'campaigns') loadCampaigns();
    if (page === 'create-campaign') loadCreateCampaign();
    if (page === 'logs') loadLogs();
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==================== MODAL ====================
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ==================== API HELPERS ====================
async function apiGet(path) {
    try {
        const res = await fetch(API + path);
        return await res.json();
    } catch (e) {
        console.error('API GET error:', e);
        return { success: false, error: e.message };
    }
}

async function apiPost(path, body) {
    try {
        const res = await fetch(API + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (e) {
        console.error('API POST error:', e);
        return { success: false, error: e.message };
    }
}

async function apiDelete(path) {
    try {
        const res = await fetch(API + path, { method: 'DELETE' });
        return await res.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function apiUpload(path, formData) {
    try {
        const res = await fetch(API + path, { method: 'POST', body: formData });
        return await res.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    const [contactsRes, campaignsRes] = await Promise.all([
        apiGet('/api/contacts'),
        apiGet('/api/campaigns')
    ]);

    allContacts = contactsRes.contacts || [];
    allCampaigns = campaignsRes.campaigns || [];

    document.getElementById('statContacts').textContent = allContacts.length;
    document.getElementById('statCampaigns').textContent = allCampaigns.length;

    let totalSent = 0, totalFailed = 0;
    allCampaigns.forEach(c => {
        totalSent += c.sentCount || 0;
        totalFailed += c.failedCount || 0;
    });

    document.getElementById('statSent').textContent = totalSent;
    document.getElementById('statFailed').textContent = totalFailed;

    // Recent campaigns
    const container = document.getElementById('recentCampaigns');
    if (allCampaigns.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🚀</div>
        <h3>No campaigns yet</h3>
        <p>Create your first campaign to start sending bulk messages.</p>
      </div>`;
        return;
    }

    const recent = allCampaigns.slice(0, 5);
    container.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr><th>Name</th><th>Template</th><th>Status</th><th>Sent</th><th>Failed</th><th>Date</th></tr>
        </thead>
        <tbody>
          ${recent.map(c => `
            <tr>
              <td style="font-weight:600;color:var(--text-primary)">${esc(c.name)}</td>
              <td><span class="badge badge-purple">${esc(c.templateName)}</span></td>
              <td>${statusBadge(c.status)}</td>
              <td style="color:var(--green);font-weight:600">${c.sentCount || 0}</td>
              <td style="color:var(--red);font-weight:600">${c.failedCount || 0}</td>
              <td style="color:var(--text-muted)">${formatDate(c.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// ==================== CONTACTS ====================
async function loadContacts() {
    const res = await apiGet('/api/contacts');
    allContacts = res.contacts || [];
    document.getElementById('contactCount').textContent = allContacts.length;

    const tbody = document.getElementById('contactsTableBody');
    if (allContacts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No contacts yet. Upload a CSV or add manually.</td></tr>`;
        return;
    }

    tbody.innerHTML = allContacts.map(c => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary);font-family:monospace">${esc(c.phone)}</td>
      <td>${esc(c.name)}</td>
      <td style="color:var(--text-muted)">${esc(c.email || '—')}</td>
      <td>${(c.variables || []).map(v => `<span class="badge badge-blue" style="margin:2px">${esc(v)}</span>`).join(' ') || '—'}</td>
      <td>${c.status === 'active' ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-red">' + esc(c.status) + '</span>'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteContact('${c._id}')">🗑️</button></td>
    </tr>
  `).join('');
}

async function addContact() {
    const phone = document.getElementById('addPhone').value.trim();
    const name = document.getElementById('addName').value.trim();
    const email = document.getElementById('addEmail').value.trim();

    if (!phone) return showToast('Phone number is required', 'error');

    const res = await apiPost('/api/contacts', { phone, name, email });
    if (res.success) {
        showToast(`Contact "${name || phone}" added!`, 'success');
        document.getElementById('addPhone').value = '';
        document.getElementById('addName').value = '';
        document.getElementById('addEmail').value = '';
        loadContacts();
    } else {
        showToast(res.error || 'Failed to add contact', 'error');
    }
}

async function deleteContact(id) {
    if (!confirm('Delete this contact?')) return;
    const res = await apiDelete(`/api/contacts/${id}`);
    if (res.success) {
        showToast('Contact deleted', 'success');
        loadContacts();
    }
}

function handleCSVUpload(input) {
    if (!input.files || !input.files[0]) return;
    const formData = new FormData();
    formData.append('csvFile', input.files[0]);

    const resultDiv = document.getElementById('uploadResult');
    resultDiv.innerHTML = '<p style="color:var(--yellow)">⏳ Uploading and processing...</p>';

    apiUpload('/api/contacts/upload', formData).then(res => {
        if (res.success) {
            resultDiv.innerHTML = `
        <div style="padding:16px;background:var(--green-bg);border:1px solid rgba(34,197,94,0.3);border-radius:var(--radius-sm)">
          <p style="color:var(--green);font-weight:600">✅ ${res.message}</p>
        </div>`;
            showToast(`${res.imported} contacts imported!`, 'success');
            loadContacts();
        } else {
            resultDiv.innerHTML = `
        <div style="padding:16px;background:var(--red-bg);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-sm)">
          <p style="color:var(--red)">❌ ${res.error || 'Upload failed'}</p>
        </div>`;
            showToast('Upload failed', 'error');
        }
    });

    input.value = '';
}

// ==================== TEMPLATES ====================
async function loadTemplates() {
    const res = await apiGet('/api/templates');
    allTemplates = res.templates || [];

    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = allTemplates.map((t, i) => `
    <div class="template-card ${selectedTemplate?.name === t.name ? 'selected' : ''}" 
         onclick="selectTemplate(${i})" id="tmpl-${i}">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
        <div class="template-name">${esc(t.name)}</div>
      </div>
      <div class="template-body">${highlightVars(esc(t.body))}</div>
      <div class="template-meta">
        <span class="badge badge-${categoryColor(t.category)}">${esc(t.category)}</span>
        <span class="badge badge-blue">${t.variableCount || 0} var${t.variableCount !== 1 ? 's' : ''}</span>
        <span class="badge badge-green">${esc(t.status)}</span>
      </div>
    </div>
  `).join('');
}

function selectTemplate(index) {
    selectedTemplate = allTemplates[index];

    // Highlight selected card
    document.querySelectorAll('.template-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById('tmpl-' + index);
    if (card) card.classList.add('selected');

    // Show details
    const details = document.getElementById('templateDetails');
    const t = selectedTemplate;
    details.innerHTML = `
    <div style="margin-bottom:16px">
      <h3 style="color:var(--text-primary);margin-bottom:4px">${esc(t.name)}</h3>
      <span class="badge badge-${categoryColor(t.category)}">${esc(t.category)}</span>
      <span class="badge badge-green">${esc(t.status)}</span>
    </div>
    <div class="form-group">
      <label class="form-label">Message Body</label>
      <div style="background:var(--bg-input);padding:14px;border-radius:var(--radius-sm);line-height:1.7;color:var(--text-secondary)">
        ${highlightVars(esc(t.body))}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Variables (${t.variableCount || 0})</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${(t.variables || []).map((v, i) => `
          <span class="badge badge-purple">{{${i + 1}}} = ${esc(v)}</span>
        `).join('')}
      </div>
    </div>
  `;

    // Phone preview
    const preview = document.getElementById('phoneMessage');
    let body = t.body;
    (t.variables || []).forEach((v, i) => {
        body = body.replace(`{{${i + 1}}}`, `<span class="msg-var">${esc(v)}</span>`);
    });
    preview.innerHTML = `<p>${body}</p><div class="msg-time">10:30 AM ✓✓</div>`;
}

// ==================== CREATE CAMPAIGN ====================
async function loadCreateCampaign() {
    // Load templates into dropdown
    if (allTemplates.length === 0) {
        const res = await apiGet('/api/templates');
        allTemplates = res.templates || [];
    }

    const select = document.getElementById('campaignTemplate');
    select.innerHTML = '<option value="">— Select a template —</option>';
    allTemplates.forEach((t, i) => {
        select.innerHTML += `<option value="${i}">${esc(t.name)} (${t.category})</option>`;
    });

    // Load contacts
    if (allContacts.length === 0) {
        const res = await apiGet('/api/contacts');
        allContacts = res.contacts || [];
    }
    updateCampaignContactCount();

    // Reset progress card
    document.getElementById('campaignProgressCard').hidden = true;
}

function onCampaignTemplateChange() {
    const idx = document.getElementById('campaignTemplate').value;
    if (idx === '') {
        selectedTemplate = null;
        document.getElementById('campaignTemplatePreview').innerHTML = '';
        document.getElementById('variableMappingCard').hidden = true;
        document.getElementById('campaignPhonePreview').innerHTML = '<p>Select a template to see preview...</p><div class="msg-time">10:30 AM ✓✓</div>';
        return;
    }

    selectedTemplate = allTemplates[parseInt(idx)];
    const t = selectedTemplate;

    document.getElementById('campaignTemplatePreview').innerHTML = `
    <div style="background:var(--bg-input);padding:14px;border-radius:var(--radius-sm);margin-top:12px;border-left:3px solid var(--whatsapp)">
      <p style="color:var(--text-secondary);line-height:1.7">${highlightVars(esc(t.body))}</p>
    </div>`;

    // Variable mapping
    if (t.variableCount > 0) {
        document.getElementById('variableMappingCard').hidden = false;
        let html = '<p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:16px">Map template variables to contact data. In demo mode, sample values are used.</p>';
        (t.variables || []).forEach((v, i) => {
            html += `
        <div class="form-group">
          <label class="form-label">{{${i + 1}}} — ${esc(v)}</label>
          <input class="form-input" id="varMap${i}" placeholder="e.g. ${esc(v)}" value="${esc(v)}">
        </div>`;
        });
        document.getElementById('variableMappingBody').innerHTML = html;
    } else {
        document.getElementById('variableMappingCard').hidden = true;
    }

    // Phone preview
    let body = t.body;
    (t.variables || []).forEach((v, i) => {
        body = body.replace(`{{${i + 1}}}`, `<span class="msg-var">${esc(v)}</span>`);
    });
    document.getElementById('campaignPhonePreview').innerHTML = `<p>${body}</p><div class="msg-time">10:30 AM ✓✓</div>`;
}

function onContactSourceChange() {
    const source = document.getElementById('contactSource').value;
    document.getElementById('campaignContactUpload').hidden = source !== 'upload';
    updateCampaignContactCount();
}

function updateCampaignContactCount() {
    const source = document.getElementById('contactSource').value;
    const el = document.getElementById('campaignContactCount');
    if (source === 'all') {
        el.innerHTML = `<span style="color:var(--green);font-weight:600">${allContacts.length}</span> contacts will receive this message`;
        campaignContacts = allContacts;
    } else {
        el.innerHTML = campaignContacts.length > 0
            ? `<span style="color:var(--green);font-weight:600">${campaignContacts.length}</span> contacts loaded from CSV`
            : 'Upload a CSV file to load contacts';
    }
}

function handleCampaignCSV(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            showToast('CSV must have at least a header and one row', 'error');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const phoneIdx = headers.findIndex(h => h === 'phone');
        const nameIdx = headers.findIndex(h => h === 'name');

        if (phoneIdx === -1) {
            showToast('CSV must have a "phone" column', 'error');
            return;
        }

        campaignContacts = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            const phone = (cols[phoneIdx] || '').replace(/[^0-9]/g, '');
            if (phone.length >= 10) {
                const vars = [];
                headers.forEach((h, idx) => {
                    if (h.startsWith('variable') || h.startsWith('var')) {
                        if (cols[idx]) vars.push(cols[idx]);
                    }
                });
                campaignContacts.push({
                    _id: `csv_${i}`,
                    phone,
                    name: cols[nameIdx] || 'Unknown',
                    variables: vars
                });
            }
        }

        showToast(`${campaignContacts.length} contacts loaded from CSV`, 'success');
        updateCampaignContactCount();
    };
    reader.readAsText(file);
}

async function launchCampaign() {
    const name = document.getElementById('campaignName').value.trim();
    if (!name) return showToast('Enter a campaign name', 'error');
    if (!selectedTemplate) return showToast('Select a template', 'error');

    const contacts = document.getElementById('contactSource').value === 'all' ? allContacts : campaignContacts;
    if (contacts.length === 0) return showToast('No contacts available. Add or upload contacts first.', 'error');

    // Add variable values to contacts if mapped
    const enrichedContacts = contacts.map(c => {
        const vars = [];
        if (selectedTemplate.variableCount > 0) {
            for (let i = 0; i < selectedTemplate.variableCount; i++) {
                const input = document.getElementById(`varMap${i}`);
                const mappedVal = input ? input.value : '';
                // Use contact's own variables if available, otherwise use mapped default
                vars.push((c.variables && c.variables[i]) || mappedVal || `Value${i + 1}`);
            }
        }
        return { ...c, variables: vars };
    });

    // Disable button
    const btn = document.getElementById('launchCampaignBtn');
    btn.disabled = true;
    btn.textContent = '⏳ Launching...';

    const res = await apiPost('/api/campaigns', {
        name,
        templateName: selectedTemplate.name,
        languageCode: 'en',
        contacts: enrichedContacts,
        demoMode: true
    });

    if (res.success) {
        activeCampaignId = res.campaignId;
        showToast('Campaign launched! 🚀', 'success');

        // Show progress card
        document.getElementById('campaignProgressCard').hidden = false;
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('progressPercent').textContent = '0%';
        document.getElementById('progressText').textContent = 'Starting...';
        document.getElementById('progSent').textContent = '0';
        document.getElementById('progFailed').textContent = '0';
        document.getElementById('campaignLogsList').innerHTML = '';

        // Poll for progress
        startProgressPolling(activeCampaignId);
    } else {
        showToast(res.error || 'Failed to launch campaign', 'error');
        btn.disabled = false;
        btn.textContent = '🚀 Launch Campaign';
    }
}

function startProgressPolling(campaignId) {
    if (pollTimer) clearInterval(pollTimer);

    pollTimer = setInterval(async () => {
        const res = await apiGet(`/api/campaigns/${campaignId}/progress`);
        if (!res.success) return;

        const pct = res.total > 0 ? Math.round((res.current / res.total) * 100) : 0;

        document.getElementById('progressBar').style.width = pct + '%';
        document.getElementById('progressPercent').textContent = pct + '%';
        document.getElementById('progressText').textContent = `${res.current} / ${res.total} messages processed`;
        document.getElementById('progSent').textContent = res.sent;
        document.getElementById('progFailed').textContent = res.failed;

        // Update logs (show last 20)
        const logs = (res.logs || []).slice(-20).reverse();
        document.getElementById('campaignLogsList').innerHTML = logs.map(l => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border-color);font-size:0.8rem">
        <span>${l.status === 'sent' ? '✅' : '❌'}</span>
        <span style="color:var(--text-primary);font-family:monospace;min-width:110px">${esc(l.phone)}</span>
        <span style="color:var(--text-muted)">${esc(l.contactName || '')}</span>
        <span style="margin-left:auto;color:var(--text-muted);font-size:0.72rem">
          ${l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : ''}
        </span>
      </div>
    `).join('');

        // Campaign completed
        if (res.status === 'completed') {
            clearInterval(pollTimer);
            pollTimer = null;

            const btn = document.getElementById('launchCampaignBtn');
            btn.disabled = false;
            btn.textContent = '🚀 Launch Campaign';

            document.getElementById('progressText').textContent = `✅ Complete! ${res.sent} sent, ${res.failed} failed`;
            showToast(`Campaign finished — ${res.sent} sent, ${res.failed} failed`, 'success');
        }
    }, 500);
}

// ==================== CAMPAIGNS LIST ====================
async function loadCampaigns() {
    const res = await apiGet('/api/campaigns');
    allCampaigns = res.campaigns || [];

    const tbody = document.getElementById('campaignsTableBody');
    if (allCampaigns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No campaigns yet. Create one!</td></tr>`;
        return;
    }

    tbody.innerHTML = allCampaigns.map(c => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary)">${esc(c.name)}</td>
      <td><span class="badge badge-purple">${esc(c.templateName)}</span></td>
      <td>${statusBadge(c.status)}</td>
      <td style="color:var(--green);font-weight:600">${c.sentCount || 0}</td>
      <td style="color:var(--red);font-weight:600">${c.failedCount || 0}</td>
      <td style="color:var(--text-muted)">${formatDate(c.createdAt)}</td>
      <td><button class="btn btn-outline btn-sm" onclick="viewCampaign('${c._id}')">View</button></td>
    </tr>
  `).join('');
}

async function viewCampaign(id) {
    const res = await apiGet(`/api/campaigns/${id}`);
    if (!res.success) return showToast('Failed to load campaign details', 'error');

    const c = res.campaign;
    const logs = res.logs || [];

    document.getElementById('modalCampaignTitle').textContent = c?.name || 'Campaign Details';
    document.getElementById('modalCampaignBody').innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
      <div class="stat-card green" style="padding:14px">
        <div class="stat-label" style="font-size:0.7rem">Sent</div>
        <div class="stat-value" style="font-size:1.5rem">${c?.sentCount || 0}</div>
      </div>
      <div class="stat-card red" style="padding:14px">
        <div class="stat-label" style="font-size:0.7rem">Failed</div>
        <div class="stat-value" style="font-size:1.5rem">${c?.failedCount || 0}</div>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <span class="badge badge-purple">${esc(c?.templateName || '')}</span>
      ${statusBadge(c?.status || 'draft')}
    </div>
    ${logs.length > 0 ? `
      <h3 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px">Message Logs</h3>
      <div style="max-height:300px;overflow-y:auto">
        ${logs.map(l => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color);font-size:0.8rem">
            <span>${l.status === 'sent' ? '✅' : l.status === 'delivered' ? '📨' : l.status === 'read' ? '👁️' : '❌'}</span>
            <span style="font-family:monospace">${esc(l.phone)}</span>
            <span style="color:var(--text-muted)">${esc(l.contactName || '')}</span>
            <span class="badge badge-${l.status === 'sent' || l.status === 'delivered' || l.status === 'read' ? 'green' : 'red'}" style="margin-left:auto">${esc(l.status)}</span>
          </div>
        `).join('')}
      </div>
    ` : '<p style="color:var(--text-muted)">No logs available.</p>'}
  `;

    openModal('campaignModal');
}

// ==================== MESSAGE LOGS ====================
async function loadLogs() {
    // Collect logs from all campaigns
    const campaignsRes = await apiGet('/api/campaigns');
    const campaigns = campaignsRes.campaigns || [];
    let allLogs = [];

    for (const c of campaigns.slice(0, 5)) {
        const detail = await apiGet(`/api/campaigns/${c._id}`);
        if (detail.logs) {
            detail.logs.forEach(l => {
                l.campaignName = c.name;
                allLogs.push(l);
            });
        }
        // Also check progress store
        const progress = await apiGet(`/api/campaigns/${c._id}/progress`);
        if (progress.logs) {
            progress.logs.forEach(l => {
                l.campaignName = c.name;
                l.templateName = c.templateName;
            });
            allLogs = allLogs.concat(progress.logs);
        }
    }

    const tbody = document.getElementById('logsTableBody');
    if (allLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No message logs yet. Run a campaign first.</td></tr>`;
        return;
    }

    // Deduplicate by phone+timestamp and show latest first
    const seen = new Set();
    const unique = allLogs.filter(l => {
        const key = l.phone + (l.timestamp || l.sentAt || '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 50);

    tbody.innerHTML = unique.map(l => `
    <tr>
      <td style="font-family:monospace;color:var(--text-primary)">${esc(l.phone)}</td>
      <td>${esc(l.contactName || l.name || '—')}</td>
      <td><span class="badge badge-purple">${esc(l.templateName || l.campaignName || '—')}</span></td>
      <td>${statusBadge(l.status)}</td>
      <td style="font-family:monospace;font-size:0.72rem;color:var(--text-muted)">${esc((l.messageId || l.whatsappMsgId || '—').substring(0, 20))}</td>
      <td style="color:var(--text-muted);font-size:0.8rem">${l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
    </tr>
  `).join('');
}

// ==================== UTILITY FUNCTIONS ====================
function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function highlightVars(text) {
    return text.replace(/\{\{(\d+)\}\}/g, '<span style="background:rgba(37,211,102,0.15);color:#25D366;padding:1px 5px;border-radius:3px;font-weight:600">{{$1}}</span>');
}

function statusBadge(status) {
    const map = {
        draft: ['badge-yellow', '📝 Draft'],
        running: ['badge-blue', '🔄 Running'],
        completed: ['badge-green', '✅ Completed'],
        failed: ['badge-red', '❌ Failed'],
        paused: ['badge-yellow', '⏸️ Paused'],
        sent: ['badge-green', '✅ Sent'],
        delivered: ['badge-green', '📨 Delivered'],
        read: ['badge-blue', '👁️ Read'],
        queued: ['badge-yellow', '⏳ Queued'],
        active: ['badge-green', '✅ Active']
    };
    const [cls, label] = map[status] || ['badge-yellow', status || 'Unknown'];
    return `<span class="badge ${cls}">${label}</span>`;
}

function categoryColor(cat) {
    const map = { UTILITY: 'blue', AUTHENTICATION: 'yellow', MARKETING: 'purple' };
    return map[cat] || 'blue';
}

function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ==================== DRAG & DROP ====================
const dropZone = document.getElementById('csvDropZone');
if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const input = document.getElementById('csvFileInput');
        if (e.dataTransfer.files.length > 0) {
            input.files = e.dataTransfer.files;
            handleCSVUpload(input);
        }
    });
}

// ==================== INITIAL LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
