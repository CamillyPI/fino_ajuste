const API_BASE = "http://localhost:8000";

// Senha simples do painel ADM (apenas para esconder de visitantes
// NÃO é segurança real, a validação deve ser feita no backend
const ADM_SENHA = "finoajuste2026";
let admAutenticado = false;

// Navegação por abas
function showTab(tabId, linkEl) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    const alvo = document.getElementById(tabId);
    if (alvo) alvo.classList.add('active');

    // Atualiza o link ativo no menu
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = linkEl || document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    if (link) link.classList.add('active');

    // Fecha o menu mobile, se aberto
    document.getElementById('mainNav')?.classList.remove('open');
    const toggle = document.getElementById('navToggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');

    // Sobe a página
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ao abrir ADM, mostra login ou painel conforme o estado
    if (tabId === 'adm') {
        if (admAutenticado) {
            mostrarPainelAdm();
        } else {
            document.getElementById('admLogin').classList.remove('hidden');
            document.getElementById('admPainel').classList.add('hidden');
        }
    }
}

// Menu (mobile)
document.getElementById('navToggle')?.addEventListener('click', () => {
    const nav = document.getElementById('mainNav');
    const aberto = nav.classList.toggle('open');
    document.getElementById('navToggle').setAttribute('aria-expanded', aberto ? 'true' : 'false');
});


// Carrossel da página inicial
let slideAtual = 0;
let carrosselTimer = null;
const totalSlides = 3;

function atualizarCarrossel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    track.style.transform = `translateX(-${slideAtual * 100}%)`;
    document.querySelectorAll('#carouselDots .dot').forEach((d, i) => {
        d.classList.toggle('active', i === slideAtual);
    });
}

function moverCarrossel(dir) {
    slideAtual = (slideAtual + dir + totalSlides) % totalSlides;
    atualizarCarrossel();
    reiniciarAutoplay();
}

function irParaSlide(i) {
    slideAtual = i;
    atualizarCarrossel();
    reiniciarAutoplay();
}

function reiniciarAutoplay() {
    clearInterval(carrosselTimer);
    carrosselTimer = setInterval(() => moverCarrossel(1), 6000);
}

reiniciarAutoplay();

// Carregamento do forms
function showStatus(elementId, message, tipo) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `form-status ${tipo}`; // 'sucesso' | 'erro' | 'carregando'
    el.classList.remove('hidden');
}

function hideStatus(elementId) {
    document.getElementById(elementId)?.classList.add('hidden');
}

function setLoadingBtn(loading) {
    const btn = document.getElementById('btnEnviar');
    const texto = document.getElementById('btnTexto');
    const loader = document.getElementById('btnLoader');
    btn.disabled = loading;
    texto.classList.toggle('hidden', loading);
    loader.classList.toggle('hidden', !loading);
}


// Envio do Formulário — fluxo em 2 etapas:
//   1. POST /clientes/ -> cria o cliente e recebe cliente_id
//   2. POST /orcamentos/ -> cria o orçamento com cliente_id + medidas
document.getElementById('formOrcamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus('formStatus');

    // Validação simples do cliente
    const form = document.getElementById('formOrcamento');
    if (!form.checkValidity()) {
        showStatus('formStatus', '⚠️ Por favor, preencha todos os campos antes de enviar.', 'erro');
        form.reportValidity();
        return;
    }

    setLoadingBtn(true);

    const nome = document.getElementById('nome').value.trim();
    const sobrenome = document.getElementById('sobrenome').value.trim();

    const clienteData = {
        nome_completo: `${nome} ${sobrenome}`.trim(),
        cpf: document.getElementById('cpf').value.trim(),
        contato: document.getElementById('contato').value.trim(),
        cep: document.getElementById('cep').value.trim(),
        rua: document.getElementById('rua').value.trim(),
        numero: document.getElementById('numero').value.trim(),
        bairro: document.getElementById('bairro').value.trim(),
        cidade: document.getElementById('cidade').value.trim(),
        pais: document.getElementById('pais').value.trim(),
    };

    const orcamentoData = {
        cor: document.getElementById('cor').value.trim(),
        material: document.getElementById('material').value.trim(),
        corte: document.getElementById('corte').value.trim(),
        quadril: document.getElementById('quadril').value.trim(),
        ombros: document.getElementById('ombros').value.trim(),
        comp_tronco: document.getElementById('comp_tronco').value.trim(),
        comp_perna: document.getElementById('comp_perna').value.trim(),
        comp_bracos: document.getElementById('comp_bracos').value.trim(),
    };

    try {
        // Etapa 1 — Criar cliente
        showStatus('formStatus', '⏳ Registrando dados do cliente...', 'carregando');
        const resCliente = await fetch(`${API_BASE}/clientes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });

        if (!resCliente.ok) {
            const err = await resCliente.json().catch(() => ({}));
            throw new Error(extrairErro(err) || `Erro ao registrar cliente (${resCliente.status})`);
        }

        const cliente = await resCliente.json();

        // Etapa 2 — Criar orçamento vinculado ao cliente
        showStatus('formStatus', '⏳ Registrando orçamento...', 'carregando');
        const resOrcamento = await fetch(`${API_BASE}/orcamentos/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...orcamentoData, cliente_id: cliente.id })
        });

        if (!resOrcamento.ok) {
            const err = await resOrcamento.json().catch(() => ({}));
            throw new Error(extrairErro(err) || `Erro ao registrar orçamento (${resOrcamento.status})`);
        }

        showStatus('formStatus', '✅ Orçamento enviado com sucesso! Entraremos em contato em breve.', 'sucesso');
        form.reset();

    } catch (error) {
        console.error('Erro no envio:', error);
        showStatus('formStatus',
            `❌ ${error.message || 'Erro de conexão com o servidor. Verifique se o backend está rodando.'}`,
            'erro');
    } finally {
        setLoadingBtn(false);
    }
});

// Extrai mensagem de erro do formato de validação do FastAPI/Pydantic
function extrairErro(err) {
    if (!err || !err.detail) return null;
    if (typeof err.detail === 'string') return err.detail;
    if (Array.isArray(err.detail)) {
        return err.detail.map(d => d.msg || JSON.stringify(d)).join(' · ');
    }
    return null;
}

// Login do painel ADM (proteção simples no frontend)
document.getElementById('formLogin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const senha = document.getElementById('admSenha').value;
    const erro = document.getElementById('loginErro');

    if (senha === ADM_SENHA) {
        admAutenticado = true;
        erro.classList.add('hidden');
        document.getElementById('admSenha').value = '';
        mostrarPainelAdm();
    } else {
        erro.classList.remove('hidden');
        document.getElementById('admSenha').value = '';
    }
});

function mostrarPainelAdm() {
    document.getElementById('admLogin').classList.add('hidden');
    document.getElementById('admPainel').classList.remove('hidden');
    carregarOrcamentos();
}

function logoutAdm() {
    admAutenticado = false;
    document.getElementById('admPainel').classList.add('hidden');
    document.getElementById('admLogin').classList.remove('hidden');
}

// Painel ADM
async function carregarOrcamentos() {
    const tbody = document.getElementById('tabelaAdmBody');
    tbody.innerHTML = '<tr><td colspan="18" style="text-align:center; opacity:0.6;">Carregando...</td></tr>';
    hideStatus('admStatus');

    try {
        const [resOrcamentos, resClientes] = await Promise.all([
            fetch(`${API_BASE}/orcamentos/`),
            fetch(`${API_BASE}/clientes/`)
        ]);

        if (!resOrcamentos.ok || !resClientes.ok) {
            throw new Error('Falha ao buscar dados do servidor.');
        }

        const orcamentos = await resOrcamentos.json();
        const clientes = await resClientes.json();

        const clienteMap = {};
        clientes.forEach(c => { clienteMap[c.id] = c; });

        tbody.innerHTML = '';

        if (orcamentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="18" style="text-align:center; opacity:0.6;">Nenhum orçamento registrado.</td></tr>';
            return;
        }

        orcamentos.forEach(orc => {
            const cliente = clienteMap[orc.cliente_id] || {};
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td contenteditable="true" data-field="nome_completo">${cliente.nome_completo || ''}</td>
                <td contenteditable="true" data-field="cpf">${cliente.cpf || ''}</td>
                <td contenteditable="true" data-field="contato">${cliente.contato || ''}</td>
                <td contenteditable="true" data-field="cep">${cliente.cep || ''}</td>
                <td contenteditable="true" data-field="rua">${cliente.rua || ''}</td>
                <td contenteditable="true" data-field="numero">${cliente.numero || ''}</td>
                <td contenteditable="true" data-field="bairro">${cliente.bairro || ''}</td>
                <td contenteditable="true" data-field="cidade">${cliente.cidade || ''}</td>
                <td contenteditable="true" data-field="pais">${cliente.pais || ''}</td>

                <td contenteditable="true" data-field="cor">${orc.cor || ''}</td>
                <td contenteditable="true" data-field="material">${orc.material || ''}</td>
                <td contenteditable="true" data-field="corte">${orc.corte || ''}</td>
                <td contenteditable="true" data-field="quadril">${orc.quadril || ''}</td>
                <td contenteditable="true" data-field="ombros">${orc.ombros || ''}</td>
                <td contenteditable="true" data-field="comp_tronco">${orc.comp_tronco || ''}</td>
                <td contenteditable="true" data-field="comp_perna">${orc.comp_perna || ''}</td>
                <td contenteditable="true" data-field="comp_bracos">${orc.comp_bracos || ''}</td>

                <td class="acoes-col">
                    <button class="btn-atualizar" onclick="salvarAtualizacao(this, ${cliente.id}, ${orc.id})">Atualizar</button>
                    <button class="btn-deletar" onclick="deletarOrcamento(${orc.id}, ${cliente.id}, this)">Deletar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        tbody.innerHTML = '';
        showStatus('admStatus', '❌ Erro de conexão com o servidor. Verifique se o backend está rodando.', 'erro');
    }
}

// Salvar atualização direta da tabela
async function salvarAtualizacao(btnEl, clienteId, orcamentoId) {
    const tr = btnEl.closest('tr');
    const getVal = (field) => tr.querySelector(`td[data-field="${field}"]`).innerText.trim();

    const clienteData = {
        nome_completo: getVal('nome_completo'),
        cpf: getVal('cpf'),
        contato: getVal('contato'),
        cep: getVal('cep'),
        rua: getVal('rua'),
        numero: getVal('numero'),
        bairro: getVal('bairro'),
        cidade: getVal('cidade'),
        pais: getVal('pais')
    };

    const orcamentoData = {
        cor: getVal('cor'),
        material: getVal('material'),
        corte: getVal('corte'),
        quadril: getVal('quadril'),
        ombros: getVal('ombros'),
        comp_tronco: getVal('comp_tronco'),
        comp_perna: getVal('comp_perna'),
        comp_bracos: getVal('comp_bracos')
    };

    btnEl.disabled = true;
    btnEl.textContent = 'Salvando...';

    try {
        const [resCliente, resOrcamento] = await Promise.all([
            fetch(`${API_BASE}/clientes/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            }),
            fetch(`${API_BASE}/orcamentos/${orcamentoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orcamentoData)
            })
        ]);

        if (resCliente.ok && resOrcamento.ok) {
            btnEl.textContent = 'Salvo! ✓';
            setTimeout(() => {
                btnEl.textContent = 'Atualizar';
                btnEl.disabled = false;
            }, 2000);
        } else {
            throw new Error('Erro na validação do servidor.');
        }

    } catch (error) {
        console.error('Erro na atualização:', error);
        alert('Erro ao atualizar os dados. Verifique a conexão e os formatos digitados.');
        btnEl.disabled = false;
        btnEl.textContent = 'Atualizar';
    }
}


// Deleta orçamento (primeiro orçamento, depois cliente)
async function deletarOrcamento(orcamentoId, clienteId, btnEl) {
    if (!confirm('Tem certeza que deseja deletar este orçamento e todos os dados do cliente associado?')) return;

    btnEl.disabled = true;
    btnEl.textContent = '...';

    try {
        // 1. Deleta a tabela filha primeiro (orçamento)
        const resOrcamento = await fetch(`${API_BASE}/orcamentos/${orcamentoId}`, {
            method: 'DELETE'
        });

        if (resOrcamento.ok || resOrcamento.status === 204) {

            // 2. Deleta a tabela pai na sequência (cliente)
            await fetch(`${API_BASE}/clientes/${clienteId}`, {
                method: 'DELETE'
            });

            // 3. Remove a linha da interface
            btnEl.closest('tr').remove();

            // Se a tabela ficar vazia, mostra a mensagem de "Nenhum orçamento"
            const tbody = document.getElementById('tabelaAdmBody');
            if (tbody.children.length === 0) {
                tbody.innerHTML = '<tr><td colspan="18" style="text-align:center; opacity:0.6;">Nenhum orçamento registrado.</td></tr>';
            }

        } else {
            const err = await resOrcamento.json().catch(() => ({}));
            alert(`Erro ao deletar: ${err.detail || resOrcamento.status}`);
            btnEl.disabled = false;
            btnEl.textContent = 'Deletar';
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro de conexão com o servidor ao tentar deletar.');
        btnEl.disabled = false;
        btnEl.textContent = 'Deletar';
    }
}
