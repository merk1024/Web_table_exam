import { useState, useEffect, useRef } from 'react';

// ══════════════════════════════════════════════════════════
//  LOCAL STORAGE ENGINE  (replaces backend API)
// ══════════════════════════════════════════════════════════
const LS = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

// ── SEED DATA ─────────────────────────────────────────────
const SEED_COURSES = [
  {
    id: 1, code: 'CS101', name: 'Programming Language 2',
    description: 'Advanced OOP, design patterns, data structures and algorithm complexity analysis.',
    credits: 6, semester: 'Spring 2025-2026', teacher: 'Azhar Kazakbaeva',
    color: '#1a56db', icon: '💻',
    topics: [
      { id: 't1', week: 1, title: 'OOP Fundamentals',       desc: 'Classes, inheritance, polymorphism, encapsulation.' },
      { id: 't2', week: 2, title: 'Design Patterns',         desc: 'Singleton, Factory, Observer, Strategy.' },
      { id: 't3', week: 3, title: 'Data Structures',         desc: 'Stacks, queues, linked lists.' },
      { id: 't4', week: 4, title: 'Sorting Algorithms',      desc: 'Bubble, merge, quicksort — time complexity.' },
      { id: 't5', week: 5, title: 'Recursion & Backtracking',desc: 'Recursive problem solving techniques.' },
      { id: 't6', week: 6, title: 'Graph Algorithms',        desc: 'BFS, DFS, Dijkstra shortest path.' },
      { id: 't7', week: 7, title: 'Midterm Review',          desc: 'Comprehensive review of weeks 1–6.' },
      { id: 't8', week: 8, title: 'Database Integration',    desc: 'CRUD operations, ORM basics.' },
      { id: 't9', week: 9, title: 'REST API Design',         desc: 'HTTP, JSON, building simple APIs.' },
      { id: 't10',week:10, title: 'Testing & Debugging',     desc: 'Unit tests, integration tests.' },
      { id: 't11',week:11, title: 'Concurrency',             desc: 'Threads, async/await patterns.' },
      { id: 't12',week:12, title: 'Final Project',           desc: 'Full-stack group application.' },
    ],
    materials: [
      { id: 'm1', title: 'Lecture 1 — OOP Slides',     type: 'pptx', size: '2.4 MB', date: '2026-02-01' },
      { id: 'm2', title: 'Lab Manual — Data Structures',type: 'pdf',  size: '1.1 MB', date: '2026-02-05' },
      { id: 'm3', title: 'Course Introduction Video',   type: 'video',size: '—',      date: '2026-01-28', url: 'https://youtube.com' },
    ],
  },
  {
    id: 2, code: 'MATH201', name: 'Calculus 2',
    description: 'Integrals, differential equations, series and multivariable calculus fundamentals.',
    credits: 5, semester: 'Spring 2025-2026', teacher: 'Hussien Chebsi',
    color: '#7c3aed', icon: '📐',
    topics: [
      { id: 't20', week: 1, title: 'Definite Integrals',      desc: 'Riemann sums, Fundamental Theorem.' },
      { id: 't21', week: 2, title: 'Techniques of Integration',desc: 'Substitution, parts, partial fractions.' },
      { id: 't22', week: 3, title: 'Applications of Integration',desc: 'Area, volume, arc length.' },
      { id: 't23', week: 4, title: 'Differential Equations',  desc: 'Separable and first-order linear ODEs.' },
      { id: 't24', week: 5, title: 'Sequences & Series',      desc: 'Convergence tests, power series.' },
      { id: 't25', week: 6, title: 'Multivariable Calculus',  desc: 'Partial derivatives, gradients.' },
    ],
    materials: [
      { id: 'm20', title: 'Formula Sheet', type: 'pdf', size: '0.5 MB', date: '2026-02-01' },
    ],
  },
  {
    id: 3, code: 'CS201', name: 'Data Structures & Algorithms',
    description: 'Trees, heaps, hash tables, graphs. Algorithm design and complexity proofs.',
    credits: 6, semester: 'Spring 2025-2026', teacher: 'Azhar Kazakbaeva',
    color: '#059669', icon: '🔗',
    topics: [
      { id: 't30', week: 1, title: 'Arrays & Strings',   desc: 'Two-pointer and sliding window techniques.' },
      { id: 't31', week: 2, title: 'Binary Trees',       desc: 'BST, traversals, balancing.' },
      { id: 't32', week: 3, title: 'Heaps & Priority Queues', desc: 'Min/max heap, heap sort.' },
      { id: 't33', week: 4, title: 'Hash Tables',        desc: 'Collision resolution, open addressing.' },
      { id: 't34', week: 5, title: 'Dynamic Programming',desc: 'Memoization, tabulation, classic DP problems.' },
    ],
    materials: [],
  },
  {
    id: 4, code: 'WEB101', name: 'Web Development',
    description: 'HTML5, CSS3, JavaScript ES6+, React, REST APIs and deployment.',
    credits: 4, semester: 'Spring 2025-2026', teacher: 'Мария Преподавателева',
    color: '#dc2626', icon: '🌐',
    topics: [
      { id: 't40', week: 1, title: 'HTML & Semantics',   desc: 'Document structure, accessibility.' },
      { id: 't41', week: 2, title: 'CSS & Layouts',      desc: 'Flexbox, Grid, responsive design.' },
      { id: 't42', week: 3, title: 'JavaScript Basics',  desc: 'Variables, functions, DOM manipulation.' },
      { id: 't43', week: 4, title: 'React Fundamentals', desc: 'Components, props, state, hooks.' },
    ],
    materials: [],
  },
  {
    id: 5, code: 'CYB101', name: 'Cybersecurity Foundation',
    description: 'Network security fundamentals, cryptography, ethical hacking and vulnerability assessment.',
    credits: 4, semester: 'Spring 2025-2026', teacher: 'Mr. Ruslan Amanov',
    color: '#d97706', icon: '🔒',
    topics: [
      { id: 't50', week: 1, title: 'Security Fundamentals', desc: 'CIA triad, threat landscape.' },
      { id: 't51', week: 2, title: 'Cryptography',          desc: 'Symmetric, asymmetric, hashing.' },
      { id: 't52', week: 3, title: 'Network Security',      desc: 'Firewalls, IDS/IPS, VPNs.' },
      { id: 't53', week: 4, title: 'Ethical Hacking Intro', desc: 'Penetration testing methodology.' },
    ],
    materials: [],
  },
  {
    id: 6, code: 'PY101', name: 'Programming with Python',
    description: 'Python syntax, libraries (numpy, pandas), automation scripts and data analysis basics.',
    credits: 4, semester: 'Spring 2025-2026', teacher: 'Ms. Zhibek Namatova',
    color: '#0369a1', icon: '🐍',
    topics: [
      { id: 't60', week: 1, title: 'Python Basics',    desc: 'Variables, data types, control flow.' },
      { id: 't61', week: 2, title: 'Functions & Modules', desc: 'Lambda, decorators, standard library.' },
      { id: 't62', week: 3, title: 'File I/O',         desc: 'Reading/writing files, JSON, CSV.' },
      { id: 't63', week: 4, title: 'NumPy & Pandas',   desc: 'Arrays, dataframes, data analysis.' },
    ],
    materials: [],
  },
  {
    id: 7, code: 'MKT101', name: 'Digital Marketing Technologies',
    description: 'SEO, social media marketing, Google Analytics, content strategy and paid advertising.',
    credits: 3, semester: 'Spring 2025-2026', teacher: 'Ms. Meerim Chukaeva',
    color: '#be185d', icon: '📱',
    topics: [
      { id: 't70', week: 1, title: 'Digital Marketing Fundamentals', desc: 'Channels, funnel, KPIs.' },
      { id: 't71', week: 2, title: 'SEO & Content',  desc: 'On-page, off-page, keyword research.' },
      { id: 't72', week: 3, title: 'Social Media',   desc: 'Instagram, LinkedIn, TikTok strategy.' },
    ],
    materials: [],
  },
  {
    id: 8, code: 'ENT101', name: 'Startup: From Idea to Launch',
    description: 'Business model canvas, MVP development, pitching to investors, fundraising basics.',
    credits: 3, semester: 'Spring 2025-2026', teacher: 'Mr. Radmir Gumerov',
    color: '#f59e0b', icon: '🚀',
    topics: [
      { id: 't80', week: 1, title: 'Ideation & Validation', desc: 'Customer discovery, problem-solution fit.' },
      { id: 't81', week: 2, title: 'Business Model Canvas', desc: 'Nine blocks, value proposition design.' },
      { id: 't82', week: 3, title: 'MVP & Product',        desc: 'Lean startup, iteration cycles.' },
      { id: 't83', week: 4, title: 'Pitching & Funding',   desc: 'Pitch deck, seed funding, VCs.' },
    ],
    materials: [],
  },
];

// ── LOCAL DB HELPERS ──────────────────────────────────────
function initDB() {
  if (!LS.get('lms_courses')) {
    LS.set('lms_courses', SEED_COURSES);
    LS.set('lms_enrollments', {});   // { userId: [courseId, ...] }
    LS.set('lms_progress', {});      // { userId_courseId: { pct, done: [] } }
  }
}

function getCourses()           { return LS.get('lms_courses', SEED_COURSES); }
function saveCourses(arr)       { LS.set('lms_courses', arr); }
function getEnrollments(uid)    { return (LS.get('lms_enrollments', {}))[uid] || []; }
function enroll(uid, cid) {
  const e = LS.get('lms_enrollments', {}); e[uid] = [...new Set([...(e[uid]||[]), cid])]; LS.set('lms_enrollments', e);
}
function unenroll(uid, cid) {
  const e = LS.get('lms_enrollments', {}); e[uid] = (e[uid]||[]).filter(x=>x!==cid); LS.set('lms_enrollments', e);
}
function getProgress(uid, cid) { return (LS.get('lms_progress', {})[`${uid}_${cid}`]) || { pct:0, done:[] }; }
function saveProgress(uid, cid, prog) {
  const all = LS.get('lms_progress', {}); all[`${uid}_${cid}`] = prog; LS.set('lms_progress', all);
}

// ── FILE TYPE ICONS ───────────────────────────────────────
const TYPE_ICON = { pdf:'📄', video:'🎬', pptx:'📊', link:'🔗', docx:'📝', other:'📎' };

// ── PROGRESS RING ─────────────────────────────────────────
function Ring({ pct=0, size=52, stroke=6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const col = pct >= 80 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6';
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:'stroke-dashoffset .5s' }}/>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size*.2} fontWeight="700" fill={col}>{pct}%</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════
//  COURSE CARD
// ══════════════════════════════════════════════════════════
function CourseCard({ course, enrolled, progress, isStudent, onOpen, onEnroll, onUnenroll, idx }) {
  return (
    <div className="cv-card" onClick={onOpen}
      style={{ '--cc': course.color, animationDelay: `${idx * 0.06}s` }}>
      <div className="cv-card-stripe" />
      <div className="cv-card-top">
        <span className="cv-card-icon">{course.icon}</span>
        {isStudent && enrolled && <Ring pct={progress?.pct || 0} size={46} stroke={5}/>}
        {!isStudent && (
          <span className="cv-card-code">{course.code}</span>
        )}
      </div>
      <div className="cv-card-body">
        {isStudent && <div className="cv-card-code">{course.code}</div>}
        <div className="cv-card-name">{course.name}</div>
        <div className="cv-card-desc">{course.description}</div>
      </div>
      <div className="cv-card-footer">
        <div className="cv-card-meta">
          <span>👩‍🏫 {course.teacher}</span>
          <span>📚 {course.credits} cr</span>
          <span>📋 {course.topics.length} weeks</span>
        </div>
        {isStudent && (
          <button
            className={enrolled ? 'cv-btn-leave' : 'cv-btn-join'}
            onClick={e => { e.stopPropagation(); enrolled ? onUnenroll() : onEnroll(); }}
          >
            {enrolled ? '✕ Leave' : '+ Enroll'}
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  COURSE DETAIL
// ══════════════════════════════════════════════════════════
function CourseDetail({ course, userId, userRole, onBack, onUpdate }) {
  const [tab,       setTab]       = useState('syllabus');
  const [progress,  setProgress]  = useState(() => getProgress(userId, course.id));
  const [topicForm, setTopicForm] = useState(false);
  const [matForm,   setMatForm]   = useState(false);
  const [newTopic,  setNewTopic]  = useState({ week: 1, title: '', desc: '' });
  const [newMat,    setNewMat]    = useState({ title: '', type: 'pdf', url: '', size: '' });
  const [localCourse, setLocalCourse] = useState(course);
  const canEdit = userRole === 'admin' || userRole === 'teacher';

  const syncCourse = (updated) => {
    const all = getCourses().map(c => c.id === updated.id ? updated : c);
    saveCourses(all);
    setLocalCourse(updated);
    onUpdate?.();
  };

  // Toggle topic done (student)
  const toggleTopic = (topicId) => {
    if (canEdit) return;
    const done = progress.done.includes(topicId)
      ? progress.done.filter(x => x !== topicId)
      : [...progress.done, topicId];
    const pct = Math.round((done.length / localCourse.topics.length) * 100);
    const next = { pct, done };
    saveProgress(userId, course.id, next);
    setProgress(next);
  };

  // Add topic
  const addTopic = (e) => {
    e.preventDefault();
    const topic = { id: `t${Date.now()}`, week: +newTopic.week, title: newTopic.title, desc: newTopic.desc };
    syncCourse({ ...localCourse, topics: [...localCourse.topics, topic] });
    setNewTopic({ week: 1, title: '', desc: '' });
    setTopicForm(false);
  };

  const deleteTopic = (tid) => {
    syncCourse({ ...localCourse, topics: localCourse.topics.filter(t => t.id !== tid) });
  };

  // Add material (local only — no real file storage, just metadata)
  const addMaterial = (e) => {
    e.preventDefault();
    const mat = {
      id: `m${Date.now()}`,
      title: newMat.title,
      type:  newMat.type,
      size:  newMat.size || '—',
      url:   newMat.url || null,
      date:  new Date().toISOString().split('T')[0],
    };
    syncCourse({ ...localCourse, materials: [...localCourse.materials, mat] });
    setNewMat({ title: '', type: 'pdf', url: '', size: '' });
    setMatForm(false);
  };

  const deleteMat = (mid) => {
    syncCourse({ ...localCourse, materials: localCourse.materials.filter(m => m.id !== mid) });
  };

  // Group topics by week
  const weeks = [...new Set(localCourse.topics.map(t => t.week))].sort((a,b) => a-b);

  return (
    <div className="cd-wrap">
      {/* HEADER */}
      <div className="cd-hero" style={{ '--cc': localCourse.color }}>
        <button className="cd-back" onClick={onBack}>← Back to Courses</button>
        <div className="cd-hero-inner">
          <div className="cd-hero-left">
            <div className="cd-hero-icon">{localCourse.icon}</div>
            <div>
              <div className="cd-hero-code">{localCourse.code} · {localCourse.semester}</div>
              <h2 className="cd-hero-name">{localCourse.name}</h2>
              <div className="cd-hero-meta">
                <span>👩‍🏫 {localCourse.teacher}</span>
                <span>📚 {localCourse.credits} credits</span>
                <span>📋 {localCourse.topics.length} weeks</span>
                <span>📁 {localCourse.materials.length} materials</span>
              </div>
            </div>
          </div>
          {userRole === 'student' && (
            <div className="cd-hero-ring">
              <Ring pct={progress.pct} size={76} stroke={7}/>
              <div className="cd-ring-label">Progress</div>
            </div>
          )}
        </div>
        <p className="cd-hero-desc">{localCourse.description}</p>
      </div>

      {/* TABS */}
      <div className="cd-tabs">
        {[
          { id:'syllabus',  lbl:'📋 Syllabus',    count: localCourse.topics.length },
          { id:'materials', lbl:'📁 Materials',   count: localCourse.materials.length },
        ].map(t => (
          <button key={t.id} className={`cd-tab ${tab===t.id?'active':''}`}
            onClick={() => setTab(t.id)}>
            {t.lbl}
            <span className="cd-tab-count">{t.count}</span>
          </button>
        ))}
        {userRole === 'student' && (
          <div className="cd-progress-bar-wrap">
            <div className="cd-progress-bar" style={{ width: `${progress.pct}%`, background: localCourse.color }}/>
          </div>
        )}
      </div>

      <div className="cd-body">

        {/* ── SYLLABUS ── */}
        {tab === 'syllabus' && (
          <div>
            {userRole === 'student' && (
              <div className="cd-hint">☝️ Click a topic to mark it as completed</div>
            )}

            {canEdit && (
              <button className="cd-add-btn" onClick={() => setTopicForm(!topicForm)}>
                {topicForm ? '✕ Cancel' : '＋ Add Topic'}
              </button>
            )}

            {topicForm && (
              <form className="cd-inline-form" onSubmit={addTopic}>
                <div className="cd-form-grid">
                  <label>
                    <span>Week</span>
                    <input type="number" min="1" max="18" value={newTopic.week}
                      onChange={e=>setNewTopic(p=>({...p,week:e.target.value}))} />
                  </label>
                  <label style={{gridColumn:'span 2'}}>
                    <span>Title *</span>
                    <input required value={newTopic.title}
                      onChange={e=>setNewTopic(p=>({...p,title:e.target.value}))}
                      placeholder="Topic title" />
                  </label>
                  <label style={{gridColumn:'span 3'}}>
                    <span>Description</span>
                    <input value={newTopic.desc}
                      onChange={e=>setNewTopic(p=>({...p,desc:e.target.value}))}
                      placeholder="Short description" />
                  </label>
                </div>
                <div className="cd-form-actions">
                  <button type="button" className="cd-btn-sec" onClick={()=>setTopicForm(false)}>Cancel</button>
                  <button type="submit" className="cd-btn-pri">Add Topic</button>
                </div>
              </form>
            )}

            {weeks.map(week => (
              <div key={week} className="cd-week-block">
                <div className="cd-week-label">
                  <span className="cd-week-num">Week {week}</span>
                  <span className="cd-week-done">
                    {localCourse.topics.filter(t=>t.week===week&&progress.done.includes(t.id)).length}
                    /{localCourse.topics.filter(t=>t.week===week).length} done
                  </span>
                </div>
                {localCourse.topics.filter(t => t.week === week).map(topic => {
                  const done = progress.done.includes(topic.id);
                  return (
                    <div key={topic.id}
                      className={`cd-topic-row ${done?'done':''} ${!canEdit?'clickable':''}`}
                      onClick={() => toggleTopic(topic.id)}>
                      <div className="cd-topic-check">{done ? '✅' : <span className="cd-check-empty"/>}</div>
                      <div className="cd-topic-text">
                        <div className="cd-topic-title">{topic.title}</div>
                        {topic.desc && <div className="cd-topic-desc">{topic.desc}</div>}
                      </div>
                      {canEdit && (
                        <button className="cd-row-del"
                          onClick={e=>{e.stopPropagation();deleteTopic(topic.id);}}>✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {localCourse.topics.length === 0 && (
              <div className="cd-empty">No topics added yet.</div>
            )}
          </div>
        )}

        {/* ── MATERIALS ── */}
        {tab === 'materials' && (
          <div>
            {canEdit && (
              <button className="cd-add-btn" onClick={() => setMatForm(!matForm)}>
                {matForm ? '✕ Cancel' : '＋ Add Material'}
              </button>
            )}

            {matForm && (
              <form className="cd-inline-form" onSubmit={addMaterial}>
                <div className="cd-form-grid">
                  <label style={{gridColumn:'span 2'}}>
                    <span>Title *</span>
                    <input required value={newMat.title}
                      onChange={e=>setNewMat(p=>({...p,title:e.target.value}))}
                      placeholder="e.g. Lecture 3 — Design Patterns" />
                  </label>
                  <label>
                    <span>Type</span>
                    <select value={newMat.type} onChange={e=>setNewMat(p=>({...p,type:e.target.value}))}>
                      {['pdf','pptx','video','docx','link','other'].map(t=>(
                        <option key={t} value={t}>{TYPE_ICON[t]} {t.toUpperCase()}</option>
                      ))}
                    </select>
                  </label>
                  {newMat.type === 'link' ? (
                    <label style={{gridColumn:'span 2'}}>
                      <span>URL</span>
                      <input type="url" value={newMat.url}
                        onChange={e=>setNewMat(p=>({...p,url:e.target.value}))}
                        placeholder="https://..." />
                    </label>
                  ) : (
                    <label style={{gridColumn:'span 2'}}>
                      <span>File size (optional)</span>
                      <input value={newMat.size}
                        onChange={e=>setNewMat(p=>({...p,size:e.target.value}))}
                        placeholder="e.g. 2.4 MB" />
                    </label>
                  )}
                </div>
                <div className="cd-form-actions">
                  <button type="button" className="cd-btn-sec" onClick={()=>setMatForm(false)}>Cancel</button>
                  <button type="submit" className="cd-btn-pri">Add Material</button>
                </div>
              </form>
            )}

            {localCourse.materials.length === 0 && (
              <div className="cd-empty">No materials uploaded yet.</div>
            )}

            <div className="cd-mat-grid">
              {localCourse.materials.map(mat => (
                <div key={mat.id} className="cd-mat-card">
                  <div className="cd-mat-type-badge">{mat.type.toUpperCase()}</div>
                  <div className="cd-mat-icon">{TYPE_ICON[mat.type] || '📎'}</div>
                  <div className="cd-mat-title">{mat.title}</div>
                  <div className="cd-mat-info">
                    {mat.size && mat.size !== '—' && <span>{mat.size}</span>}
                    <span>{mat.date}</span>
                  </div>
                  <div className="cd-mat-actions">
                    {mat.url ? (
                      <a href={mat.url} target="_blank" rel="noreferrer" className="cd-mat-open"
                        onClick={e=>e.stopPropagation()}>Open ↗</a>
                    ) : (
                      <span className="cd-mat-local">Stored locally</span>
                    )}
                    {canEdit && (
                      <button className="cd-mat-del" onClick={()=>deleteMat(mat.id)}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function CoursesPage({ user }) {
  const [courses,    setCourses]    = useState([]);
  const [enrollments,setEnrollments]= useState([]);
  const [view,       setView]       = useState('catalog'); // 'catalog'|'mine'|'detail'
  const [detailId,   setDetailId]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newC,       setNewC]       = useState({ code:'', name:'', description:'', credits:4, semester:'Spring 2025-2026', color:'#1a56db', icon:'📚' });
  const [toast,      setToast]      = useState(null);

  const isStudent = user?.role === 'student';
  const canEdit   = user?.role === 'admin' || user?.role === 'teacher';
  const uid       = user?.id || 'guest';

  const notify = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 2600);
  };

  const load = () => {
    initDB();
    setCourses(getCourses());
    setEnrollments(getEnrollments(uid));
  };

  useEffect(() => { load(); }, [uid]);

  const isEnrolled = (cid) => enrollments.includes(cid);
  const getProgress = (cid) => {
    const raw = LS.get('lms_progress', {})[`${uid}_${cid}`];
    return raw || { pct: 0, done: [] };
  };

  const handleEnroll = (cid) => {
    enroll(uid, cid);
    load();
    notify('Enrolled! ✓');
  };
  const handleUnenroll = (cid) => {
    unenroll(uid, cid);
    load();
    notify('Unenrolled', 'info');
  };

  const createCourse = (e) => {
    e.preventDefault();
    const all = getCourses();
    const created = { ...newC, id: Date.now(), credits: +newC.credits, topics: [], materials: [] };
    saveCourses([...all, created]);
    load();
    setCreateOpen(false);
    setNewC({ code:'', name:'', description:'', credits:4, semester:'Spring 2025-2026', color:'#1a56db', icon:'📚' });
    notify('Course created ✓');
  };

  const detailCourse = courses.find(c => c.id === detailId);

  const filtered = (view === 'mine' ? courses.filter(c => isEnrolled(c.id)) : courses)
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.teacher.toLowerCase().includes(search.toLowerCase())
    );

  const ICONS  = ['📚','💻','🔬','📐','🌐','🔒','🐍','📱','🚀','📊','🧠','🎨','⚡','🔭','🎯'];
  const COLORS = ['#1a56db','#7c3aed','#059669','#dc2626','#d97706','#0369a1','#be185d','#f59e0b','#0891b2','#16a34a','#7f1d1d'];

  // ── DETAIL VIEW ─────────────────────────────────────────
  if (view === 'detail' && detailCourse) {
    return (
      <>
        <CourseDetail
          course={detailCourse}
          userId={uid}
          userRole={user?.role}
          onBack={() => setView('catalog')}
          onUpdate={load}
        />
        {toast && <div className={`lms-toast lms-toast-${toast.type}`}>{toast.msg}</div>}
      </>
    );
  }

  // ── CATALOG / MY COURSES ─────────────────────────────────
  return (
    <div className="lms-courses">

      {/* HEADER */}
      <div className="lms-header">
        <div className="lms-header-left">
          <h2 className="lms-title">📚 Courses</h2>
          <p className="lms-sub">
            {isStudent ? 'Enroll and track your progress' : 'Manage course catalog'}
          </p>
        </div>
        {canEdit && (
          <button className="lms-create-btn" onClick={() => setCreateOpen(true)}>＋ New Course</button>
        )}
      </div>

      {/* CONTROLS */}
      <div className="lms-controls">
        {isStudent && (
          <div className="lms-tabs">
            <button className={`lms-tab ${view==='catalog'?'active':''}`} onClick={()=>setView('catalog')}>
              🌍 All Courses <span className="lms-tab-badge">{courses.length}</span>
            </button>
            <button className={`lms-tab ${view==='mine'?'active':''}`} onClick={()=>setView('mine')}>
              ✅ My Courses <span className="lms-tab-badge">{enrollments.length}</span>
            </button>
          </div>
        )}
        <input className="lms-search" placeholder="Search by name, code, teacher…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* STATS ROW */}
      {!isStudent && (
        <div className="lms-stats">
          {[
            { icon:'📚', val: courses.length,   lbl:'Courses'    },
            { icon:'📋', val: courses.reduce((s,c)=>s+c.topics.length,0), lbl:'Topics total' },
            { icon:'📁', val: courses.reduce((s,c)=>s+c.materials.length,0), lbl:'Materials'  },
          ].map(s => (
            <div key={s.lbl} className="lms-stat">
              <span className="lms-stat-icon">{s.icon}</span>
              <span className="lms-stat-val">{s.val}</span>
              <span className="lms-stat-lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* STUDENT PROGRESS OVERVIEW */}
      {isStudent && view === 'mine' && enrollments.length > 0 && (
        <div className="lms-progress-strip">
          {courses.filter(c=>isEnrolled(c.id)).map(c => {
            const p = getProgress(c.id);
            return (
              <div key={c.id} className="lms-pstrip-item" style={{'--cc':c.color}}
                onClick={() => { setDetailId(c.id); setView('detail'); }}>
                <div className="lms-pstrip-icon">{c.icon}</div>
                <div className="lms-pstrip-info">
                  <div className="lms-pstrip-name">{c.name}</div>
                  <div className="lms-pstrip-bar">
                    <div className="lms-pstrip-fill" style={{ width:`${p.pct}%`, background:c.color }}/>
                  </div>
                </div>
                <div className="lms-pstrip-pct" style={{color:c.color}}>{p.pct}%</div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="lms-empty">
          {view === 'mine' ? "You haven't enrolled in any courses yet." : "No courses found."}
        </div>
      ) : (
        <div className="lms-grid">
          {filtered.map((c, i) => (
            <CourseCard key={c.id} course={c} idx={i}
              enrolled={isEnrolled(c.id)}
              progress={getProgress(c.id)}
              isStudent={isStudent}
              onOpen={() => { setDetailId(c.id); setView('detail'); }}
              onEnroll={() => handleEnroll(c.id)}
              onUnenroll={() => handleUnenroll(c.id)}
            />
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {createOpen && (
        <div className="lms-overlay" onClick={() => setCreateOpen(false)}>
          <div className="lms-modal" onClick={e => e.stopPropagation()}>
            <div className="lms-modal-hd">
              <h3>📚 Create Course</h3>
              <button className="lms-modal-x" onClick={() => setCreateOpen(false)}>✕</button>
            </div>
            <form onSubmit={createCourse} className="lms-modal-body">
              <div className="lms-field-row">
                <label className="lms-field">
                  <span>Code *</span>
                  <input required value={newC.code} placeholder="CS301"
                    onChange={e=>setNewC(p=>({...p,code:e.target.value}))} />
                </label>
                <label className="lms-field" style={{flex:2}}>
                  <span>Name *</span>
                  <input required value={newC.name} placeholder="Course name"
                    onChange={e=>setNewC(p=>({...p,name:e.target.value}))} />
                </label>
              </div>
              <label className="lms-field">
                <span>Description</span>
                <textarea rows={2} value={newC.description}
                  onChange={e=>setNewC(p=>({...p,description:e.target.value}))}
                  placeholder="What will students learn?" />
              </label>
              <div className="lms-field-row">
                <label className="lms-field">
                  <span>Credits</span>
                  <input type="number" min="1" max="10" value={newC.credits}
                    onChange={e=>setNewC(p=>({...p,credits:e.target.value}))} />
                </label>
                <label className="lms-field" style={{flex:2}}>
                  <span>Semester</span>
                  <input value={newC.semester}
                    onChange={e=>setNewC(p=>({...p,semester:e.target.value}))} />
                </label>
              </div>
              <label className="lms-field">
                <span>Icon</span>
                <div className="lms-icon-row">
                  {ICONS.map(ic => (
                    <button key={ic} type="button"
                      className={`lms-icon-btn ${newC.icon===ic?'sel':''}`}
                      onClick={()=>setNewC(p=>({...p,icon:ic}))}>{ic}</button>
                  ))}
                </div>
              </label>
              <label className="lms-field">
                <span>Color</span>
                <div className="lms-color-row">
                  {COLORS.map(col => (
                    <button key={col} type="button"
                      className={`lms-color-btn ${newC.color===col?'sel':''}`}
                      style={{background:col}}
                      onClick={()=>setNewC(p=>({...p,color:col}))} />
                  ))}
                </div>
              </label>
              <div className="lms-modal-ft">
                <button type="button" className="lms-btn-sec" onClick={()=>setCreateOpen(false)}>Cancel</button>
                <button type="submit" className="lms-btn-pri">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`lms-toast lms-toast-${toast.type}`}>
          {toast.type==='success'?'✓':'ℹ'} {toast.msg}
        </div>
      )}
    </div>
  );
}
