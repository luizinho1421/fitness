/* ==========================================================================
   FITSTUDIO - SISTEMA DE APLICAÇÃO & GERENCIAMENTO DE TREINOS
   Persistência em LocalStorage & Regras de Negócio
   ========================================================================== */

// Chaves de armazenamento do LocalStorage
const KEYS = {
  USERS: 'fitstudio_users',
  WORKOUTS: 'fitstudio_workouts',
  SESSION: 'fitstudio_session',
  LOGS: 'fitstudio_logs'
};

// Catálogo Predefinido de Exercícios para agilizar a criação pelo Admin
const EXERCISE_PRESETS = [
  // Peito
  { name: 'Supino Reto com Barra', category: 'Peito', defaultSets: 4, defaultReps: '10 a 12', defaultLoad: 'Carga moderada / Descanso 60s' },
  { name: 'Supino Inclinado com Halteres', category: 'Peito', defaultSets: 4, defaultReps: '10 a 12', defaultLoad: 'Carga moderada' },
  { name: 'Crossover na Polia Alta', category: 'Peito', defaultSets: 3, defaultReps: '12 a 15', defaultLoad: 'Pico de contração' },
  { name: 'Peitoral Voador (Pec Deck)', category: 'Peito', defaultSets: 3, defaultReps: '12', defaultLoad: 'Controlado' },
  
  // Costas
  { name: 'Puxada Frontal Aberta', category: 'Costas', defaultSets: 4, defaultReps: '10 a 12', defaultLoad: 'Foco na dorsal' },
  { name: 'Remada Curvada com Barra', category: 'Costas', defaultSets: 4, defaultReps: '8 a 10', defaultLoad: 'Carga progressiva' },
  { name: 'Remada Baixa Triângulo', category: 'Costas', defaultSets: 3, defaultReps: '12', defaultLoad: 'Segurar 1s na contração' },
  { name: 'Pulldown com Corda', category: 'Costas', defaultSets: 3, defaultReps: '15', defaultLoad: 'Carga leve/moderada' },

  // Pernas / Quadríceps / Posterior
  { name: 'Agachamento Livre com Barra', category: 'Pernas', defaultSets: 4, defaultReps: '8 a 10', defaultLoad: 'Cadência 2x2' },
  { name: 'Leg Press 45°', category: 'Pernas', defaultSets: 4, defaultReps: '10 a 12', defaultLoad: 'Amplitude total' },
  { name: 'Cadeira Extensora', category: 'Pernas', defaultSets: 3, defaultReps: '12 a 15', defaultLoad: 'Drop-set na última' },
  { name: 'Mesa Flexora (Posterior)', category: 'Pernas', defaultSets: 4, defaultReps: '10 a 12', defaultLoad: 'Foco no posterior' },
  { name: 'Stiff com Halteres', category: 'Pernas', defaultSets: 3, defaultReps: '10', defaultLoad: 'Alongar bem o posterior' },
  { name: 'Gêmeos Sentado (Panturrilha)', category: 'Pernas', defaultSets: 4, defaultReps: '15 a 20', defaultLoad: 'Pausa de 2s no topo' },

  // Ombros
  { name: 'Desenvolvimento com Halteres', category: 'Ombros', defaultSets: 4, defaultReps: '10', defaultLoad: 'Sem bater halteres' },
  { name: 'Elevação Lateral na Polia ou Halter', category: 'Ombros', defaultSets: 4, defaultReps: '12 a 15', defaultLoad: 'Movimento limpo' },
  { name: 'Elevação Frontal com Anilha', category: 'Ombros', defaultSets: 3, defaultReps: '12', defaultLoad: 'Até a linha dos olhos' },
  { name: 'Crucifixo Invertido (Deltoide Posterior)', category: 'Ombros', defaultSets: 4, defaultReps: '15', defaultLoad: 'Carga moderada' },

  // Tríceps
  { name: 'Tríceps Pulley Corda', category: 'Tríceps', defaultSets: 4, defaultReps: '12 a 15', defaultLoad: 'Abrir no final' },
  { name: 'Tríceps Testa com Barra W', category: 'Tríceps', defaultSets: 3, defaultReps: '10 a 12', defaultLoad: 'Cotovelo fechado' },
  { name: 'Tríceps Coice na Polia', category: 'Tríceps', defaultSets: 3, defaultReps: '12', defaultLoad: 'Unilateral' },

  // Bíceps
  { name: 'Rosca Direta com Barra W', category: 'Bíceps', defaultSets: 4, defaultReps: '10 a 12', defaultLoad: 'Sem roubar na coluna' },
  { name: 'Rosca Alternada com Halteres', category: 'Bíceps', defaultSets: 3, defaultReps: '10 cada braço', defaultLoad: 'Rotação de punho' },
  { name: 'Rosca Martelo com Corda', category: 'Bíceps', defaultSets: 3, defaultReps: '12', defaultLoad: 'Foco em braquial' },

  // Abdômen e Cardio
  { name: 'Abdominal Infra na Barra Fixa', category: 'Abdômen', defaultSets: 3, defaultReps: '15 a 20', defaultLoad: 'Controlar descida' },
  { name: 'Prancha Isométrica', category: 'Abdômen', defaultSets: 3, defaultReps: '45 segundos', defaultLoad: 'Corpo alinhado' },
  { name: 'Esteira / Ergométrica (HIIT)', category: 'Cardio', defaultSets: 1, defaultReps: '20 minutos', defaultLoad: 'Intercalar 1min rápido / 1min leve' }
];

/* ==========================================================================
   INICIALIZAÇÃO DE DADOS DEFAULT (SEED)
   ========================================================================== */
function initData() {
  // Garante a existência do Administrador Padrão ("luizinho" / "362511")
  let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  
  const adminExists = users.some(u => u.login === 'luizinho');
  if (!adminExists) {
    users.push({
      id: 'admin_1',
      name: 'Luizinho (Administrador)',
      login: 'luizinho',
      password: '362511',
      role: 'admin',
      createdAt: new Date().toISOString()
    });
  }

  // Cria alunos demo caso o sistema esteja vazio
  const studentDemoExists = users.some(u => u.role === 'aluno');
  if (!studentDemoExists) {
    const student1 = {
      id: 'st_1',
      name: 'João Silva',
      login: 'joaosilva',
      password: '123',
      role: 'aluno',
      createdAt: new Date().toISOString()
    };
    const student2 = {
      id: 'st_2',
      name: 'Maria Oliveira',
      login: 'maria',
      password: '123',
      role: 'aluno',
      createdAt: new Date().toISOString()
    };
    users.push(student1, student2);

    // Cria treinos padrão para os alunos de demonstração
    let workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
    
    workouts['st_1'] = [
      {
        id: 'split_a',
        name: 'Treino A',
        title: 'Peito, Tríceps e Ombros',
        exercises: [
          { id: 'ex_1', name: 'Supino Reto com Barra', category: 'Peito', sets: 4, reps: '10 a 12', loadNotes: '30kg cada lado | Descanso 60s', completed: false, studentLoad: '30kg' },
          { id: 'ex_2', name: 'Supino Inclinado com Halteres', category: 'Peito', sets: 4, reps: '10', loadNotes: 'Halter de 22kg', completed: false, studentLoad: '' },
          { id: 'ex_3', name: 'Desenvolvimento com Halteres', category: 'Ombros', sets: 4, reps: '10 a 12', loadNotes: 'Halter de 14kg', completed: false, studentLoad: '' },
          { id: 'ex_4', name: 'Elevação Lateral na Polia', category: 'Ombros', sets: 3, reps: '15', loadNotes: '10kg na polia', completed: false, studentLoad: '' },
          { id: 'ex_5', name: 'Tríceps Corda', category: 'Tríceps', sets: 4, reps: '12 a 15', loadNotes: '25kg | Foco na extensão', completed: false, studentLoad: '' }
        ]
      },
      {
        id: 'split_b',
        name: 'Treino B',
        title: 'Costas, Bíceps e Trapézio',
        exercises: [
          { id: 'ex_6', name: 'Puxada Frontal Aberta', category: 'Costas', sets: 4, reps: '10 a 12', loadNotes: '45kg na máquina', completed: false, studentLoad: '' },
          { id: 'ex_7', name: 'Remada Curvada com Barra', category: 'Costas', sets: 4, reps: '10', loadNotes: '20kg cada lado', completed: false, studentLoad: '' },
          { id: 'ex_8', name: 'Rosca Direta Barra W', category: 'Bíceps', sets: 4, reps: '10 a 12', loadNotes: '10kg cada lado', completed: false, studentLoad: '' },
          { id: 'ex_9', name: 'Rosca Martelo', category: 'Bíceps', sets: 3, reps: '12', loadNotes: 'Halter de 12kg', completed: false, studentLoad: '' }
        ]
      },
      {
        id: 'split_c',
        name: 'Treino C',
        title: 'Pernas Completas e Abdômen',
        exercises: [
          { id: 'ex_10', name: 'Agachamento Livre com Barra', category: 'Pernas', sets: 4, reps: '8 a 10', loadNotes: '35kg cada lado', completed: false, studentLoad: '' },
          { id: 'ex_11', name: 'Leg Press 45°', category: 'Pernas', sets: 4, reps: '10 a 12', loadNotes: '160kg total', completed: false, studentLoad: '' },
          { id: 'ex_12', name: 'Cadeira Extensora', category: 'Pernas', sets: 3, reps: '12 a 15', loadNotes: '40kg', completed: false, studentLoad: '' },
          { id: 'ex_13', name: 'Abdominal Infra na Barra', category: 'Abdômen', sets: 3, reps: '15', loadNotes: 'Peso do corpo', completed: false, studentLoad: '' }
        ]
      }
    ];

    // Clona para Maria
    workouts['st_2'] = JSON.parse(JSON.stringify(workouts['st_1']));

    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  }

  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// Executa a inicialização ao carregar o script
initData();

/* ==========================================================================
   UTILITÁRIOS E GERENCIAMENTO DE SESSÃO
   ========================================================================== */
function getSession() {
  return JSON.parse(localStorage.getItem(KEYS.SESSION) || 'null');
}

function setSession(user) {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(KEYS.SESSION);
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'warning' ? 'toast-warning' : ''}`;
  
  const icon = type === 'error' ? '⚠️' : type === 'warning' ? '🔔' : '✅';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ==========================================================================
   ROTEAMENTO E PROTEÇÃO DE PÁGINAS
   ========================================================================== */
function checkPageAuth(requiredRole = null) {
  const session = getSession();
  const currentPath = window.location.pathname.toLowerCase();

  // Se estiver na tela de login
  if (currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
    if (session) {
      if (session.role === 'admin') {
        window.location.href = 'admin.html';
      } else if (session.role === 'aluno') {
        window.location.href = 'aluno.html';
      }
    }
    return;
  }

  // Se estiver em páginas protegidas e não houver sessão
  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  // Se o perfil da sessão for diferente do exigido na página
  if (requiredRole && session.role !== requiredRole) {
    if (session.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'aluno.html';
    }
  }
}

function logout() {
  clearSession();
  showToast('Sessão encerrada com sucesso!');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

/* ==========================================================================
   LÓGICA DA TELA DE LOGIN (index.html)
   ========================================================================== */
function handleLoginSubmit(event) {
  event.preventDefault();
  
  const loginInput = document.getElementById('loginUsername').value.trim();
  const passwordInput = document.getElementById('loginPassword').value.trim();

  if (!loginInput || !passwordInput) {
    showToast('Por favor, informe seu usuário e senha.', 'warning');
    return;
  }

  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  
  // Busca o usuário pelas credenciais
  const user = users.find(u => u.login.toLowerCase() === loginInput.toLowerCase() && u.password === passwordInput);

  if (!user) {
    showToast('Usuário ou senha incorretos. Tente novamente.', 'error');
    return;
  }

  // Sucesso na autenticação
  setSession({
    id: user.id,
    name: user.name,
    login: user.login,
    role: user.role
  });

  showToast(`Bem-vindo(a), ${user.name}!`);

  setTimeout(() => {
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'aluno.html';
    }
  }, 600);
}

/* ==========================================================================
   LÓGICA DO PAINEL ADMINISTRATIVO (admin.html)
   ========================================================================== */
let currentEditingStudentId = null;
let currentSelectedStudentForWorkout = null;

function initAdminPanel() {
  checkPageAuth('admin');
  
  const session = getSession();
  const adminNameElem = document.getElementById('adminNameDisplay');
  if (adminNameElem && session) {
    adminNameElem.innerText = session.name;
  }

  // Renderiza Estatísticas do Dashboard
  renderAdminStats();
  
  // Renderiza Lista de Alunos e Dropdowns
  renderStudentsTable();
  populateStudentDropdowns();

  // Prepara formulário de inclusão rápida de exercícios
  renderExercisePresets();
}

function renderAdminStats() {
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');

  const students = users.filter(u => u.role === 'aluno');
  let totalExercises = 0;
  let totalSplits = 0;

  Object.values(workouts).forEach(userWorkouts => {
    if (Array.isArray(userWorkouts)) {
      totalSplits += userWorkouts.length;
      userWorkouts.forEach(split => {
        if (split.exercises) {
          totalExercises += split.exercises.length;
        }
      });
    }
  });

  const statStudents = document.getElementById('statTotalStudents');
  const statWorkouts = document.getElementById('statTotalWorkouts');
  const statExercises = document.getElementById('statTotalExercises');

  if (statStudents) statStudents.innerText = students.length;
  if (statWorkouts) statWorkouts.innerText = totalSplits;
  if (statExercises) statExercises.innerText = totalExercises;
}

// Cadastra um novo Aluno com opção de copiar treinos existentes
function handleRegisterStudentSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('newStudentName').value.trim();
  const login = document.getElementById('newStudentLogin').value.trim().toLowerCase();
  const password = document.getElementById('newStudentPassword').value.trim();
  const copyFromStudentId = document.getElementById('copyWorkoutFromStudentSelect').value;

  if (!name || !login || !password) {
    showToast('Preencha todos os campos obrigatórios.', 'warning');
    return;
  }

  let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');

  // Verifica se login já existe
  if (users.some(u => u.login === login)) {
    showToast('Este nome de usuário já está em uso por outro aluno.', 'error');
    return;
  }

  const newStudentId = 'st_' + Date.now();
  const newStudent = {
    id: newStudentId,
    name,
    login,
    password,
    role: 'aluno',
    createdAt: new Date().toISOString()
  };

  users.push(newStudent);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  // Cópia de Treinos caso selecionado na criação
  if (copyFromStudentId) {
    const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
    if (workouts[copyFromStudentId]) {
      // Clona de forma profunda os treinos para o novo aluno
      workouts[newStudentId] = JSON.parse(JSON.stringify(workouts[copyFromStudentId]));
      // Reseta status de concluído de cada exercício
      workouts[newStudentId].forEach(s => {
        if (s.exercises) {
          s.exercises.forEach(e => {
            e.completed = false;
            e.studentLoad = '';
          });
        }
      });
      localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
      showToast(`Aluno cadastrado e treinos copiados com sucesso!`);
    } else {
      showToast(`Aluno cadastrado! (Aluno de origem não possuía treinos cadastrados)`, 'warning');
    }
  } else {
    showToast(`Aluno ${name} cadastrado com sucesso!`);
  }

  // Reseta formulário
  document.getElementById('registerStudentForm').reset();

  // Atualiza painel
  renderAdminStats();
  renderStudentsTable();
  populateStudentDropdowns();
}

function renderStudentsTable(filterText = '') {
  const tableBody = document.getElementById('studentsTableBody');
  if (!tableBody) return;

  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');

  const students = users.filter(u => u.role === 'aluno' && 
    (u.name.toLowerCase().includes(filterText.toLowerCase()) || 
     u.login.toLowerCase().includes(filterText.toLowerCase()))
  );

  if (students.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted" style="padding: 2rem;">
          Nenhum aluno cadastrado ou encontrado na busca.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = students.map(s => {
    const studentWorkouts = workouts[s.id] || [];
    const splitsCount = studentWorkouts.length;
    const dateFormatted = new Date(s.createdAt).toLocaleDateString('pt-BR');

    return `
      <tr>
        <td>
          <div class="flex items-center gap-2">
            <div class="user-avatar">${s.name.charAt(0).toUpperCase()}</div>
            <div>
              <strong style="color: #FFF;">${s.name}</strong>
              <div class="text-muted" style="font-size: 0.75rem;">Cadastrado em ${dateFormatted}</div>
            </div>
          </div>
        </td>
        <td><code style="color: var(--primary); font-size: 0.85rem;">${s.login}</code></td>
        <td>
          <span class="badge ${splitsCount > 0 ? 'badge-green' : 'badge-gray'}">
            ${splitsCount} ${splitsCount === 1 ? 'Treino' : 'Treinos'}
          </span>
        </td>
        <td>
          <code style="color: var(--text-muted); font-size: 0.85rem;">${s.password}</code>
        </td>
        <td class="text-right">
          <div class="flex items-center justify-between gap-2" style="justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="selectStudentForWorkout('${s.id}')" title="Montar/Editar Treino">
              🏋️ Treino
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openCopyWorkoutModal('${s.id}')" title="Copiar treino para outro aluno">
              📋 Copiar
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}', '${s.name}')" title="Excluir aluno">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function populateStudentDropdowns() {
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const students = users.filter(u => u.role === 'aluno');

  // Dropdown no form de cadastro
  const copySelect = document.getElementById('copyWorkoutFromStudentSelect');
  if (copySelect) {
    copySelect.innerHTML = `<option value="">-- Não copiar (Criar sem treinos) --</option>` +
      students.map(s => `<option value="${s.id}">Copiar de: ${s.name} (${s.login})</option>`).join('');
  }

  // Dropdown na aba de Montagem de Treino
  const selectStudentWorkout = document.getElementById('selectStudentForWorkout');
  if (selectStudentWorkout) {
    const currentVal = selectStudentWorkout.value;
    selectStudentWorkout.innerHTML = `<option value="">-- Selecione um Aluno --</option>` +
      students.map(s => `<option value="${s.id}">${s.name} (${s.login})</option>`).join('');
    
    if (currentVal && students.some(s => s.id === currentVal)) {
      selectStudentWorkout.value = currentVal;
    }
  }
}

// Exclusão de Aluno
function deleteStudent(studentId, studentName) {
  if (!confirm(`Tem certeza que deseja excluir o aluno "${studentName}"? Todos os seus treinos serão removidos permanentemente.`)) {
    return;
  }

  let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  users = users.filter(u => u.id !== studentId);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));

  let workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  delete workouts[studentId];
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

  showToast(`Aluno ${studentName} removido com sucesso.`);

  if (currentSelectedStudentForWorkout === studentId) {
    currentSelectedStudentForWorkout = null;
    document.getElementById('workoutEditorArea').classList.add('hidden');
  }

  renderAdminStats();
  renderStudentsTable();
  populateStudentDropdowns();
}

/* ==========================================================================
   MONTAGEM DE TREINOS DO ADMIN
   ========================================================================== */
function selectStudentForWorkout(studentId) {
  currentSelectedStudentForWorkout = studentId;

  const selectElem = document.getElementById('selectStudentForWorkout');
  if (selectElem) selectElem.value = studentId;

  // Alterna para a aba de montagem de treinos
  switchAdminTab('tabMontarTreino');
  renderWorkoutBuilder();
}

function handleStudentSelectChange(event) {
  currentSelectedStudentForWorkout = event.target.value;
  renderWorkoutBuilder();
}

function renderWorkoutBuilder() {
  const container = document.getElementById('workoutEditorArea');
  if (!container) return;

  if (!currentSelectedStudentForWorkout) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const student = users.find(u => u.id === currentSelectedStudentForWorkout);

  const studentTitleElem = document.getElementById('selectedStudentTitle');
  if (studentTitleElem && student) {
    studentTitleElem.innerText = `Editando Treinos de: ${student.name}`;
  }

  // Renderiza as divisões de treino (Splits: Treino A, B, C...)
  renderWorkoutSplits();
}

let activeSplitIndex = 0;

function renderWorkoutSplits() {
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const studentSplits = workouts[currentSelectedStudentForWorkout] || [];

  const splitsTabsContainer = document.getElementById('splitsTabsContainer');
  const splitContentContainer = document.getElementById('splitContentContainer');

  if (!splitsTabsContainer || !splitContentContainer) return;

  if (studentSplits.length === 0) {
    splitsTabsContainer.innerHTML = `<span class="text-muted" style="font-size: 0.85rem;">Nenhuma divisão criada ainda.</span>`;
    splitContentContainer.innerHTML = `
      <div class="card text-center" style="padding: 3rem 1.5rem;">
        <h3 class="mb-2">Este aluno ainda não possui treinos</h3>
        <p class="text-muted mb-4">Clique no botão abaixo para adicionar a primeira divisão de treino (ex: Treino A).</p>
        <button class="btn btn-primary" onclick="addNewSplitModal()">
          ➕ Criar Treino A
        </button>
      </div>
    `;
    return;
  }

  if (activeSplitIndex >= studentSplits.length) {
    activeSplitIndex = 0;
  }

  // Renderiza botões de aba
  splitsTabsContainer.innerHTML = studentSplits.map((split, index) => `
    <button class="tab-btn ${index === activeSplitIndex ? 'active' : ''}" onclick="switchSplitTab(${index})">
      <span>${split.name}</span>
      <span style="font-size: 0.75rem; opacity: 0.8;">(${split.exercises ? split.exercises.length : 0})</span>
    </button>
  `).join('') + `
    <button class="btn btn-secondary btn-sm" onclick="addNewSplitModal()" style="margin-left: 0.5rem;" title="Adicionar nova divisão de treino">
      ➕ Nova Divisão
    </button>
  `;

  // Renderiza o conteúdo do Split Ativo
  const currentSplit = studentSplits[activeSplitIndex];
  const exercises = currentSplit.exercises || [];

  splitContentContainer.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${currentSplit.name} - ${currentSplit.title || 'Sem título'}</h3>
          <span class="text-muted" style="font-size: 0.8rem;">${exercises.length} exercícios cadastrados nesta divisão</span>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-secondary btn-sm" onclick="openExercisePresetModal()">
            ⚡ Biblioteca de Exercícios
          </button>
          <button class="btn btn-primary btn-sm" onclick="openAddExerciseModal()">
            ➕ Novo Exercício
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteCurrentSplit(${activeSplitIndex})" title="Excluir este treino">
            🗑️ Excluir Treino
          </button>
        </div>
      </div>

      ${exercises.length === 0 ? `
        <div class="text-center" style="padding: 2.5rem 1rem;">
          <p class="text-muted mb-4">Nenhum exercício cadastrado no ${currentSplit.name}.</p>
          <div class="flex gap-2" style="justify-content: center;">
            <button class="btn btn-primary" onclick="openAddExerciseModal()">➕ Adicionar Manualmente</button>
            <button class="btn btn-secondary" onclick="openExercisePresetModal()">⚡ Escolher do Catálogo</button>
          </div>
        </div>
      ` : `
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Exercício</th>
                <th>Grupo</th>
                <th>Séries</th>
                <th>Repetições</th>
                <th>Carga / Observações</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${exercises.map((ex, exIdx) => `
                <tr>
                  <td><strong style="color: #FFF;">${ex.name}</strong></td>
                  <td><span class="badge badge-blue">${ex.category || 'Geral'}</span></td>
                  <td><strong>${ex.sets}x</strong></td>
                  <td>${ex.reps}</td>
                  <td><span class="text-muted">${ex.loadNotes || '-'}</span></td>
                  <td class="text-right">
                    <button class="btn btn-danger btn-sm" onclick="removeExerciseFromSplit(${activeSplitIndex}, ${exIdx})">
                      🗑️
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

function switchSplitTab(index) {
  activeSplitIndex = index;
  renderWorkoutSplits();
}

function addNewSplitModal() {
  const name = prompt('Nome da Divisão (ex: Treino A, Treino B, Treino Pernas):', 'Treino ' + String.fromCharCode(65 + (getStudentSplits().length)));
  if (!name) return;

  const title = prompt('Foco / Músculos Principais (ex: Peito, Tríceps e Ombros):', 'Peito e Tríceps');

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  if (!workouts[currentSelectedStudentForWorkout]) {
    workouts[currentSelectedStudentForWorkout] = [];
  }

  workouts[currentSelectedStudentForWorkout].push({
    id: 'split_' + Date.now(),
    name: name.trim(),
    title: title ? title.trim() : '',
    exercises: []
  });

  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  activeSplitIndex = workouts[currentSelectedStudentForWorkout].length - 1;
  
  showToast(`Divisão "${name}" adicionada.`);
  renderWorkoutSplits();
  renderAdminStats();
  renderStudentsTable();
}

function deleteCurrentSplit(splitIdx) {
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const studentSplits = workouts[currentSelectedStudentForWorkout] || [];

  if (!studentSplits[splitIdx]) return;

  if (!confirm(`Excluir o "${studentSplits[splitIdx].name}"?`)) return;

  studentSplits.splice(splitIdx, 1);
  workouts[currentSelectedStudentForWorkout] = studentSplits;
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

  activeSplitIndex = 0;
  showToast(`Divisão removida.`);
  renderWorkoutSplits();
  renderAdminStats();
  renderStudentsTable();
}

function getStudentSplits() {
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  return workouts[currentSelectedStudentForWorkout] || [];
}

// Modal e Inclusão de Exercício Manual
function openAddExerciseModal() {
  document.getElementById('modalAddExercise').classList.add('active');
}

function closeAddExerciseModal() {
  document.getElementById('modalAddExercise').classList.remove('active');
  document.getElementById('formAddExercise').reset();
}

function handleAddExerciseSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('exName').value.trim();
  const category = document.getElementById('exCategory').value;
  const sets = parseInt(document.getElementById('exSets').value) || 4;
  const reps = document.getElementById('exReps').value.trim() || '10 a 12';
  const loadNotes = document.getElementById('exLoad').value.trim();

  if (!name) {
    showToast('Informe o nome do exercício.', 'warning');
    return;
  }

  addExerciseToActiveSplit({
    id: 'ex_' + Date.now(),
    name,
    category,
    sets,
    reps,
    loadNotes,
    completed: false,
    studentLoad: ''
  });

  closeAddExerciseModal();
  showToast(`Exercício "${name}" adicionado.`);
}

function addExerciseToActiveSplit(exerciseObj) {
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const studentSplits = workouts[currentSelectedStudentForWorkout] || [];

  if (!studentSplits[activeSplitIndex]) return;

  if (!studentSplits[activeSplitIndex].exercises) {
    studentSplits[activeSplitIndex].exercises = [];
  }

  studentSplits[activeSplitIndex].exercises.push(exerciseObj);
  workouts[currentSelectedStudentForWorkout] = studentSplits;
  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

  renderWorkoutSplits();
  renderAdminStats();
}

function removeExerciseFromSplit(splitIdx, exIdx) {
  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const studentSplits = workouts[currentSelectedStudentForWorkout] || [];

  if (studentSplits[splitIdx] && studentSplits[splitIdx].exercises) {
    studentSplits[splitIdx].exercises.splice(exIdx, 1);
    workouts[currentSelectedStudentForWorkout] = studentSplits;
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

    renderWorkoutSplits();
    renderAdminStats();
    showToast('Exercício removido.');
  }
}

// Catálogo / Presets de Exercícios
function renderExercisePresets() {
  const container = document.getElementById('presetsListContainer');
  if (!container) return;

  container.innerHTML = EXERCISE_PRESETS.map((p, idx) => `
    <div class="card" style="padding: 0.85rem; background: var(--bg-surface); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
      <div>
        <strong style="color: #FFF; font-size: 0.9rem;">${p.name}</strong>
        <div style="font-size: 0.75rem;" class="text-muted">
          <span class="badge badge-gray" style="font-size: 0.65rem; padding: 0.1rem 0.4rem;">${p.category}</span>
          ${p.defaultSets}x ${p.defaultReps}
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="addPresetToSplit(${idx})">
        ➕ Add
      </button>
    </div>
  `).join('');
}

function addPresetToSplit(presetIdx) {
  const preset = EXERCISE_PRESETS[presetIdx];
  if (!preset) return;

  addExerciseToActiveSplit({
    id: 'ex_' + Date.now(),
    name: preset.name,
    category: preset.category,
    sets: preset.defaultSets,
    reps: preset.defaultReps,
    loadNotes: preset.defaultLoad,
    completed: false,
    studentLoad: ''
  });

  showToast(`"${preset.name}" adicionado ao treino!`);
}

function openExercisePresetModal() {
  document.getElementById('modalPresets').classList.add('active');
}

function closeExercisePresetModal() {
  document.getElementById('modalPresets').classList.remove('active');
}

// Modal Cópia de Treinos entre Alunos Existentes
let sourceCopyStudentId = null;

function openCopyWorkoutModal(sourceStudentId) {
  sourceCopyStudentId = sourceStudentId;
  const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  const sourceStudent = users.find(u => u.id === sourceStudentId);

  const modalTitle = document.getElementById('copyModalTitle');
  if (modalTitle && sourceStudent) {
    modalTitle.innerText = `Copiar Treinos de: ${sourceStudent.name}`;
  }

  const targetSelect = document.getElementById('targetStudentForCopy');
  if (targetSelect) {
    const otherStudents = users.filter(u => u.role === 'aluno' && u.id !== sourceStudentId);
    if (otherStudents.length === 0) {
      targetSelect.innerHTML = `<option value="">Nenhum outro aluno cadastrado</option>`;
    } else {
      targetSelect.innerHTML = `<option value="">-- Selecione o Aluno de Destino --</option>` +
        otherStudents.map(s => `<option value="${s.id}">${s.name} (${s.login})</option>`).join('');
    }
  }

  document.getElementById('modalCopyWorkout').classList.add('active');
}

function closeCopyWorkoutModal() {
  document.getElementById('modalCopyWorkout').classList.remove('active');
}

function handleCopyWorkoutSubmit(event) {
  event.preventDefault();

  const targetStudentId = document.getElementById('targetStudentForCopy').value;
  if (!targetStudentId) {
    showToast('Selecione um aluno de destino.', 'warning');
    return;
  }

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const sourceWorkouts = workouts[sourceCopyStudentId] || [];

  if (sourceWorkouts.length === 0) {
    showToast('O aluno de origem não possui treinos cadastrados.', 'error');
    return;
  }

  // Clona treinos
  workouts[targetStudentId] = JSON.parse(JSON.stringify(sourceWorkouts));
  // Reseta status de concluído
  workouts[targetStudentId].forEach(s => {
    if (s.exercises) {
      s.exercises.forEach(e => {
        e.completed = false;
        e.studentLoad = '';
      });
    }
  });

  localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

  closeCopyWorkoutModal();
  showToast('Treinos copiados com sucesso para o aluno selecionado!');

  renderAdminStats();
  renderStudentsTable();
}

function switchAdminTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));

  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  const activeSection = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeSection) activeSection.classList.remove('hidden');
}

/* ==========================================================================
   LÓGICA DA ÁREA DO ALUNO (aluno.html)
   ========================================================================== */
let activeStudentSplitIdx = 0;

function initStudentPanel() {
  checkPageAuth('aluno');

  const session = getSession();
  const studentNameElem = document.getElementById('studentNameHeader');
  if (studentNameElem && session) {
    studentNameElem.innerText = session.name;
  }

  renderStudentWorkoutView();
}

function renderStudentWorkoutView() {
  const session = getSession();
  if (!session) return;

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const mySplits = workouts[session.id] || [];

  const splitsContainer = document.getElementById('studentSplitsContainer');
  const workoutContent = document.getElementById('studentWorkoutContent');

  if (!splitsContainer || !workoutContent) return;

  if (mySplits.length === 0) {
    splitsContainer.innerHTML = '';
    workoutContent.innerHTML = `
      <div class="card text-center" style="padding: 3rem 1.5rem;">
        <h2 class="mb-2">Nenhum treino disponível no momento</h2>
        <p class="text-muted">Seu instrutor/administrador ainda não cadastrou treinos para sua conta. Entre em contato com a academia.</p>
      </div>
    `;
    return;
  }

  if (activeStudentSplitIdx >= mySplits.length) {
    activeStudentSplitIdx = 0;
  }

  // Renderiza botões de abas
  splitsContainer.innerHTML = mySplits.map((s, idx) => `
    <button class="tab-btn ${idx === activeStudentSplitIdx ? 'active' : ''}" onclick="switchStudentSplit(${idx})">
      <span>${s.name}</span>
    </button>
  `).join('');

  const currentSplit = mySplits[activeStudentSplitIdx];
  const exercises = currentSplit.exercises || [];

  // Calcula progresso do treino
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(e => e.completed).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  workoutContent.innerHTML = `
    <!-- Cabeçalho do Treino Atual -->
    <div class="card mb-4">
      <div class="card-header" style="border: none; margin-bottom: 0; padding-bottom: 0;">
        <div>
          <span class="badge badge-green mb-2">${currentSplit.name}</span>
          <h2 style="font-size: 1.5rem;">${currentSplit.title || 'Treino Personalizado'}</h2>
        </div>
        <button class="btn btn-orange" onclick="startRestTimer(60)">
          ⏱️ Temporizador de Descanso
        </button>
      </div>
    </div>

    <!-- Barra de Progresso -->
    <div class="progress-container">
      <div class="progress-header">
        <span>Progresso do Treino</span>
        <strong style="color: var(--primary);">${completedExercises} de ${totalExercises} exercícios (${progressPercent}%)</strong>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
      </div>
    </div>

    <!-- Lista de Exercícios -->
    <div class="exercises-list">
      ${exercises.length === 0 ? `
        <div class="card text-center text-muted" style="padding: 2rem;">
          Nenhum exercício atribuído a esta divisão.
        </div>
      ` : exercises.map((ex, exIdx) => `
        <div class="exercise-card ${ex.completed ? 'completed' : ''}">
          <div class="exercise-checkbox-wrapper">
            <div class="custom-checkbox ${ex.completed ? 'checked' : ''}" onclick="toggleExerciseComplete(${activeStudentSplitIdx}, ${exIdx})">
              ✓
            </div>
          </div>
          <div class="exercise-details">
            <div class="exercise-title">
              <span style="${ex.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${ex.name}</span>
              <span class="badge badge-blue">${ex.category || 'Geral'}</span>
            </div>

            <div class="exercise-metrics">
              <div class="metric-pill">Séries: <strong>${ex.sets}x</strong></div>
              <div class="metric-pill">Repetições: <strong>${ex.reps}</strong></div>
              <div class="metric-pill">Obs / Carga Instruída: <strong>${ex.loadNotes || 'Padrão'}</strong></div>
            </div>

            <!-- Registro de Carga Utilizada Hoje pelo Aluno -->
            <div class="mt-4 flex items-center gap-2" style="max-width: 300px;">
              <span class="form-label" style="margin-bottom:0; font-size: 0.75rem;">Sua Carga Hoje:</span>
              <input type="text" class="form-control" style="padding: 0.35rem 0.65rem; font-size: 0.85rem;"
                placeholder="Ex: 25kg" value="${ex.studentLoad || ''}" 
                onchange="saveStudentLoadNote(${activeStudentSplitIdx}, ${exIdx}, this.value)" />
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Finalizar Treino Button -->
    <div class="card text-center mt-6" style="background: linear-gradient(145deg, var(--bg-card), var(--bg-surface));">
      <h3 class="mb-2">Concluiu os exercícios de hoje?</h3>
      <p class="text-muted mb-4">Clique no botão abaixo para registrar a conclusão do seu treino no seu histórico!</p>
      <div class="flex gap-4 justify-between" style="justify-content: center; flex-wrap: wrap;">
        <button class="btn btn-primary btn-lg" onclick="finishStudentWorkout()">
          🎉 Finalizar e Registrar Treino
        </button>
        <button class="btn btn-secondary btn-lg" onclick="resetStudentChecklist(${activeStudentSplitIdx})">
          🔄 Desmarcar Checkbox
        </button>
      </div>
    </div>
  `;
}

function switchStudentSplit(idx) {
  activeStudentSplitIdx = idx;
  renderStudentWorkoutView();
}

function toggleExerciseComplete(splitIdx, exIdx) {
  const session = getSession();
  if (!session) return;

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const mySplits = workouts[session.id] || [];

  if (mySplits[splitIdx] && mySplits[splitIdx].exercises && mySplits[splitIdx].exercises[exIdx]) {
    const currentState = mySplits[splitIdx].exercises[exIdx].completed;
    mySplits[splitIdx].exercises[exIdx].completed = !currentState;

    workouts[session.id] = mySplits;
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

    // Ativa pequeno timer de descanso ao marcar exercício como feito
    if (!currentState) {
      showToast('Exercício concluído! Inicie o descanso.');
    }

    renderStudentWorkoutView();
  }
}

function saveStudentLoadNote(splitIdx, exIdx, loadValue) {
  const session = getSession();
  if (!session) return;

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const mySplits = workouts[session.id] || [];

  if (mySplits[splitIdx] && mySplits[splitIdx].exercises && mySplits[splitIdx].exercises[exIdx]) {
    mySplits[splitIdx].exercises[exIdx].studentLoad = loadValue;
    workouts[session.id] = mySplits;
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
    showToast('Carga salva!');
  }
}

function resetStudentChecklist(splitIdx) {
  const session = getSession();
  if (!session) return;

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const mySplits = workouts[session.id] || [];

  if (mySplits[splitIdx] && mySplits[splitIdx].exercises) {
    mySplits[splitIdx].exercises.forEach(e => e.completed = false);
    workouts[session.id] = mySplits;
    localStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));

    showToast('Checklist reiniciado.');
    renderStudentWorkoutView();
  }
}

function finishStudentWorkout() {
  const session = getSession();
  if (!session) return;

  const workouts = JSON.parse(localStorage.getItem(KEYS.WORKOUTS) || '{}');
  const mySplits = workouts[session.id] || [];
  const currentSplit = mySplits[activeStudentSplitIdx];

  if (!currentSplit) return;

  // Salva no histórico
  let logs = JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]');
  logs.push({
    id: 'log_' + Date.now(),
    studentId: session.id,
    studentName: session.name,
    splitName: currentSplit.name,
    splitTitle: currentSplit.title,
    date: new Date().toLocaleString('pt-BR')
  });
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));

  // Exibe celebração
  alert(`🏆 Parabéns, ${session.name}!\nVocê concluiu o seu "${currentSplit.name} - ${currentSplit.title}".\nRegistro salvo com sucesso!`);

  resetStudentChecklist(activeStudentSplitIdx);
}

/* ==========================================================================
   TEMPORIZADOR DE DESCANSO (CRONÔMETRO DE ACADEMIA)
   ========================================================================== */
let timerInterval = null;
let timerSeconds = 60;

function startRestTimer(seconds = 60) {
  timerSeconds = seconds;

  let timerModal = document.getElementById('modalTimer');
  if (!timerModal) return;

  timerModal.classList.add('active');
  updateTimerDisplay();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      playTimerBeep();
      showToast('⏰ Tempo de descanso encerrado! Hora da próxima série!', 'warning');
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (!display) return;

  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function pauseTimer() {
  clearInterval(timerInterval);
}

function closeTimerModal() {
  clearInterval(timerInterval);
  const timerModal = document.getElementById('modalTimer');
  if (timerModal) timerModal.classList.remove('active');
}

function playTimerBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota Lá (A5)
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio Context não suportado ou bloqueado.');
  }
}
