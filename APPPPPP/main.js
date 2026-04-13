// main.js - Vanilla JS Logic for Band Harmony (Korean Default)

// 기본 모의 데이터베이스 (기본값)
const defaultDB = {
  schedules: [
    { date: '10월 15일', time: '19:00 PM', venue: '스튜디오 A (홍대)', dDay: 'D-2', type: '합주' },
    { date: '10월 20일', time: '18:00 PM', venue: '롤링홀', dDay: 'D-7', type: '공연' },
    { date: '10월 25일', time: '20:00 PM', venue: '스튜디오 C (강남)', dDay: 'D-12', type: '합주' }
  ],
  feed: [
    { id: 1, user: 'Alex V.', time: '2시간 전', title: '보컬 연습 - Let It Be', img: 'https://images.unsplash.com/photo-1516280440502-31d77a877be1?w=800&q=80', comments: 3, views: 142, tags: ['#보컬', '#어쿠스틱'], liked: false },
    { id: 2, user: 'John B.', time: '5시간 전', title: '베이스 슬랩 라인 데모', img: 'https://images.unsplash.com/photo-1513349626233-28929729ca94?w=800&q=80', comments: 1, views: 89, tags: ['#베이스', '#그루브'], liked: false },
    { id: 3, user: 'Sam D.', time: '1일 전', title: '드럼 필인 아이디어', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', comments: 6, views: 304, tags: ['#드럼', '#비트'], liked: false }
  ]
};

// 데이터베이스 초기화 (로컬 스토리지 유지)
let DB = localStorage.getItem('bandHarmonyDB') 
  ? JSON.parse(localStorage.getItem('bandHarmonyDB')) 
  : JSON.parse(JSON.stringify(defaultDB));

// 강제 언어 마이그레이션 (기존 영어 캐시 초기화)
if (DB.schedules.some(s => s.date.includes('Oct')) || DB.feed.some(f => f.time.includes('ago'))) {
  DB = JSON.parse(JSON.stringify(defaultDB));
  localStorage.setItem('bandHarmonyDB', JSON.stringify(DB));
}

const persistDB = () => {
  localStorage.setItem('bandHarmonyDB', JSON.stringify(DB));
};

// --- 상호작용 로직 ---

window.toggleLike = (btn, feedId) => {
  const feedItem = DB.feed.find(f => f.id === feedId);
  const icon = btn.querySelector('i');
  
  if (icon.classList.contains('ph-fill')) {
    icon.className = 'ph ph-heart';
    btn.style.color = 'var(--text-secondary)';
    icon.style.color = '';
    if (feedItem) feedItem.liked = false;
  } else {
    icon.className = 'ph-fill ph-heart';
    btn.style.color = 'var(--inst-vocal)';
    icon.style.color = 'var(--inst-vocal)';
    if (feedItem) feedItem.liked = true;
  }
  
  persistDB();
};

window.executeSearch = (query) => {
  const searchTerm = query !== null ? query : document.getElementById('feed-search-input').value;
  if (!searchTerm || searchTerm.trim() === '') return;
  
  const results = DB.feed.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.tags && f.tags.some(t => t.toLowerCase() === searchTerm.toLowerCase()))
  );

  const modal = document.createElement('div');
  modal.className = 'search-overlay';
  
  let resultsHtml = '';
  if (results.length > 0) {
    resultsHtml = results.map(item => `
      <div class="feed-card glass-panel" style="margin-bottom: 24px;">
        <div class="feed-user" style="padding-bottom: 12px;">
          <div class="user-avatar-wrapper">
            <div class="user-avatar"><i class="ph-fill ph-user"></i></div>
          </div>
          <div>
            <strong>${item.user}</strong>
            <small>${item.time}</small>
          </div>
        </div>
        <div class="feed-video-placeholder" style="background-image: url('${item.img}'); height: 180px; border-radius: 12px;">
          <div class="play-btn" onclick="this.style.color='var(--accent-secondary)';"><i class="ph-fill ph-play-circle"></i></div>
        </div>
        <div class="feed-content" style="padding: 12px 0 0 0;">
          <h3 style="font-size: 16px;">${item.title}</h3>
          ${item.tags ? `<div class="feed-tags">${item.tags.map(t => `<span class="feed-tag-sm" onclick="this.closest('.search-overlay').remove(); window.executeSearch('${t}')">${t}</span>`).join('')}</div>` : ''}
        </div>
      </div>
    `).join('');
  } else {
    resultsHtml = `<p style="text-align: center; color: var(--text-secondary); margin-top: 60px;">"${searchTerm}" 검색 결과가 없습니다.</p>`;
  }

  modal.innerHTML = `
    <div class="search-overlay-header">
      <button style="background: none; border: none; color: white; cursor: pointer; display: flex; align-items: center;" onclick="this.closest('.search-overlay').remove()">
        <i class="ph ph-arrow-left" style="font-size: 24px;"></i>
      </button>
      <input type="text" class="styled-textarea" style="flex: 1; height: 40px; min-height: 40px; margin: 0 12px; padding: 4px 16px; border-radius: 20px;" value="${searchTerm}" onkeypress="if(event.key === 'Enter') { this.closest('.search-overlay').remove(); window.executeSearch(this.value); }">
      <button style="background: none; border: none; color: var(--accent-color); font-weight: 600; cursor: pointer; padding: 8px;" onclick="this.closest('.search-overlay').remove(); window.executeSearch(this.previousElementSibling.value)">검색</button>
    </div>
    <div class="search-overlay-content">
      <h3 style="margin-bottom: 24px; color: var(--text-secondary);">"${searchTerm}" 검색 결과 (${results.length})</h3>
      <div class="feed-list">
        ${resultsHtml}
      </div>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  setTimeout(() => modal.classList.add('active'), 10);
};

window.showCommentsModal = (feedId) => {
  const feedItem = DB.feed.find(f => f.id === feedId);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 20px;">'${feedItem?.title || ''}' 댓글</h3>
      <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
        <div style="margin-bottom: 16px; font-size: 14px;"><strong>Jane (Ky):</strong> 분위기 너무 좋아요!</div>
        <div style="margin-bottom: 16px; font-size: 14px;"><strong>Mike (Eg):</strong> 다음 합주 때 이 라인 템포 좀만 올리죠.</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <input type="text" class="styled-textarea" style="min-height:40px; flex: 1; padding: 10px;" placeholder="댓글을 입력하세요...">
        <button class="btn-primary" style="padding: 10px 16px;" onclick="alert('댓글이 등록되었습니다!'); this.closest('.modal-backdrop').remove();">등록</button>
      </div>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">닫기</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.showAddEventModal = (day) => {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()" style="max-height: 90vh; overflow-y: auto;">
      <h3 style="margin-bottom: 20px; color: var(--text-primary);">10월 ${day}일 일정 추가</h3>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">일정 제목</label>
      <input type="text" id="ev-title" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 20px;" placeholder="예: 보컬 녹음">
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">시간</label>
      <input type="time" id="ev-time" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 24px;" value="19:00">
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">세션 (악기 선택 및 멤버 입력)</label>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="v" data-type="V"><div class="session-badge sess-var-v">V</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="v" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="보컬 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="eg" data-type="Eg"><div class="session-badge sess-var-eg">Eg</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="eg" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="기타리스트 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="b" data-type="B"><div class="session-badge sess-var-b">B</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="b" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="베이시스트 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="d" data-type="D"><div class="session-badge sess-var-d">D</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="d" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="드러머 이름">
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button class="sess-toggle-btn" onclick="this.classList.toggle('active')" data-inst="k" data-type="K"><div class="session-badge sess-var-k">K</div></button>
          <input type="text" class="styled-textarea inst-name" data-inst="k" style="height:36px; min-height:36px; padding: 4px 10px;" placeholder="키보디스트 이름">
        </div>
      </div>
      
      <button class="btn-primary w-100" onclick="window.saveNewEvent(${day}, this.closest('.modal-backdrop'))">저장</button>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">취소</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.saveNewEvent = (day, modalEl) => {
  const title = modalEl.querySelector('#ev-title').value || '새 세션';
  const time = modalEl.querySelector('#ev-time').value || '19:00';
  
  const assigned = [];
  modalEl.querySelectorAll('.sess-toggle-btn.active').forEach(btn => {
     const inst = btn.getAttribute('data-inst');
     const type = btn.getAttribute('data-type');
     const nameInput = modalEl.querySelector('.inst-name[data-inst="' + inst + '"]').value || '미정';
     assigned.push({ type: type, inst: inst, name: nameInput });
  });

  const diff = day - 13;
  const dDay = diff > 0 ? 'D-' + diff : 'D-Day';
  const dayFmt = day < 10 ? '0'+day : day;

  const newEvent = {
    date: '10월 ' + dayFmt + '일',
    time: time,
    venue: title,
    dDay: dDay,
    type: '합주',
    members: assigned
  };
  
  DB.schedules.push(newEvent);
  DB.schedules.sort((a, b) => parseInt(a.date.split(' ')[1]) - parseInt(b.date.split(' ')[1]));
  persistDB(); // 동기화
  
  modalEl.remove();

  window.showToast('일정이 성공적으로 등록되었습니다!');
  window.handleDateSelect(day);
  
  const dateCell = Array.from(document.querySelectorAll('.cal-date')).find(el => parseInt(el.innerText) === day);
  if (dateCell && !dateCell.querySelector('.cal-dot')) {
    dateCell.innerHTML += '<div class="cal-dot"></div>';
  }
};

window.showUploadModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()">
      <h3 style="margin-bottom: 20px; color: var(--text-primary);">연습 영상 업로드</h3>
      
      <div style="width: 100%; height: 120px; background: rgba(0,0,0,0.3); border: 1px dashed var(--stroke-color); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 20px; cursor: pointer; color: var(--text-secondary);">
        <i class="ph ph-video-camera" style="font-size: 32px; margin-bottom: 8px;"></i>
        <span>비디오 파일을 선택하려면 탭하세요</span>
      </div>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">설명/제목</label>
      <textarea id="upload-desc" class="styled-textarea" style="min-height:80px; margin-top: 8px; margin-bottom: 20px;" placeholder="오늘은 무엇을 연습하셨나요?"></textarea>
      
      <label style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">태그 (쉼표로 구분)</label>
      <input type="text" id="upload-tags" class="styled-textarea" style="min-height:40px; margin-top: 8px; margin-bottom: 30px;" placeholder="예: #보컬, #개인연습">
      
      <button class="btn-primary w-100" onclick="window.saveFeedUpload(this.closest('.modal-backdrop'))"><i class="ph ph-upload-simple"></i> 영상 게시</button>
      <button class="btn-secondary w-100 mt-20" onclick="this.closest('.modal-backdrop').remove()">취소</button>
    </div>
  `;
  document.getElementById('app').appendChild(modal);
  
  modal.onclick = () => modal.remove();
  setTimeout(() => modal.classList.add('active'), 10);
};

window.saveFeedUpload = (modalEl) => {
  const desc = modalEl.querySelector('#upload-desc').value || '새 연습 트랙';
  let rawTags = modalEl.querySelector('#upload-tags').value || '#연습';
  const tagList = rawTags.split(',').map(t => {
    let tr = t.trim();
    if (!tr.startsWith('#')) tr = '#' + tr;
    return tr;
  });

  const newFeed = {
    id: Date.now(),
    user: 'Alex Vocalist',
    time: '방금 전',
    title: desc,
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    comments: 0,
    views: 0,
    tags: tagList,
    liked: false
  };

  DB.feed.unshift(newFeed);
  persistDB(); // 동기화
  
  modalEl.remove();

  window.showToast('영상이 성공적으로 업로드되었습니다!');
  
  const pageFeed = document.getElementById('page-feed');
  if (pageFeed && pageFeed.classList.contains('active')) {
    pageFeed.innerHTML = renderFeedPage();
  }
};

window.showToast = (msg) => {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translate(-50%, -20px)';
  toast.style.background = 'var(--accent-color)';
  toast.style.color = 'white';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '24px';
  toast.style.boxShadow = '0 4px 12px var(--accent-glow)';
  toast.style.zIndex = '1000';
  toast.style.opacity = '0';
  toast.style.transition = 'all 0.3s ease';
  toast.innerText = msg;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.handleDateSelect = (day) => {
  document.querySelectorAll('.cal-date').forEach(el => el.classList.remove('active-date'));
  const target = Array.from(document.querySelectorAll('.cal-date')).find(el => parseInt(el.innerText) === day);
  if(target) target.classList.add('active-date');

  const container = document.getElementById('calendar-details-container');
  if(container) {
    container.innerHTML = renderDateDetails(day);
  }
};

const renderDateDetails = (day) => {
  const events = DB.schedules.filter(s => s.date === `10월 ${day}일` || s.date === `10월 ${day < 10 ? '0'+day : day}일`);
  if (events.length > 0) {
    return `
      <h2>10월 ${day}일 상세 일정</h2>
      ${events.map(ev => {
        let membersHtml = '';
        if (ev.members && ev.members.length > 0) {
           membersHtml = ev.members.map(m => `
             <div class="sess-item"><div class="session-badge sess-var-${m.inst}"> ${m.type} </div> ${m.name}</div>
           `).join('');
        } else {
           membersHtml = `
             <div class="sess-item"><div class="session-badge sess-var-v">V</div> Alex</div>
             <div class="sess-item"><div class="session-badge sess-var-eg">Eg</div> Mike</div>
             ${ev.type === '합주' ? `<div class="sess-item"><div class="session-badge sess-var-b">B</div> John</div>` : ''}
             ${ev.type === '공연' ? `<div class="sess-item"><div class="session-badge sess-var-d">D</div> Sam</div>` : ''}
           `;
        }
        return `
          <div class="glass-panel session-card mt-20">
            <h3>${ev.venue}</h3>
            <p class="time">${ev.time}</p>
            <div class="session-assignment mt-20">
              <h4 style="margin-bottom: 12px; color: var(--text-secondary);">참여 멤버</h4>
              <div class="session-list">
                ${membersHtml}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    `;
  } else {
    return `
      <h2>10월 ${day}일 상세 일정</h2>
      <div class="glass-panel mt-20" style="text-align: center; padding: 40px 20px;">
        <i class="ph ph-calendar-x" style="font-size: 40px; color: var(--text-secondary); margin-bottom: 12px;"></i>
        <p style="margin-bottom: 24px;">이 날짜에 계획된 일정이 없습니다.</p>
        <button class="btn-primary" style="margin: 0 auto;" onclick="window.showAddEventModal(${day})"><i class="ph ph-plus"></i> 일정 추가</button>
      </div>
    `;
  }
};

// --- Page Renderers ---

const renderHomePage = () => {
  return `
    <div class="home-header" style="margin-bottom: 24px;">
      <h1 style="font-size: 28px; line-height: 1.2;">안녕하세요, Alex<br><span style="color: var(--accent-color); font-size: 20px;">합주 준비 되셨나요?</span></h1>
    </div>

    <!-- Block 1: Band Status / Quick Stats -->
    <div class="glass-panel home-block" style="background: rgba(157, 78, 221, 0.1); border-left: 4px solid var(--accent-color); margin-bottom: 24px;">
      <h2 style="font-size: 14px; margin-bottom: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px;">밴드 현황</h2>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="font-size: 24px; font-weight: 700; color: white;">3</p>
          <p style="font-size: 12px; color: var(--text-secondary);">다가오는 일정</p>
        </div>
        <div>
          <p style="font-size: 24px; font-weight: 700; color: white;">12</p>
          <p style="font-size: 12px; color: var(--text-secondary);">새로운 피드백</p>
        </div>
        <div style="background: var(--accent-color); padding: 12px; border-radius: 12px; box-shadow: 0 4px 12px var(--accent-glow); display: flex;">
          <i class="ph-fill ph-play" style="color: white; font-size: 20px;"></i>
        </div>
      </div>
    </div>

    <!-- Block 2: Upcoming Schedules -->
    <div class="home-block" style="margin-bottom: 32px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
        <h2 style="margin: 0; font-size: 20px;">다가오는 일정</h2>
        <span style="color: var(--accent-color); font-size: 13px; font-weight: 600; cursor: pointer;" onclick="document.querySelector('.nav-item[data-target=\\'calendar\\']').click()">전체 보기</span>
      </div>
      <div class="schedule-grid">
        ${DB.schedules.slice(0, 2).map(item => `
          <div class="schedule-card glass-panel">
            <div class="card-top">
              <span class="badge badge-dday">${item.dDay}</span>
              <span class="card-type">${item.type}</span>
            </div>
            <h3 style="margin-top: 8px;">${item.venue}</h3>
            <div class="card-details">
              <p><i class="ph ph-calendar-blank"></i> ${item.date}</p>
              <p><i class="ph ph-clock"></i> ${item.time}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Block 3: Recent Feedback -->
    <div class="home-block">
      <h2 style="font-size: 20px; margin-bottom: 16px;">최근 팀 피드백</h2>
      <div class="glass-panel feedback-card">
        <p><strong>Manager Kim:</strong> "오늘 런 좋았습니다! 다음 롤링홀 공연을 대비해서 코러스 템포를 조금만 낮춰보죠."</p>
        <button class="btn-secondary w-100 mt-20" onclick="document.querySelector('.nav-item[data-target=\\'feed\\']').click()">피드로 이동</button>
      </div>
    </div>
  `;
};

const renderCalendarPage = () => {
  const daysInMonth = 31;
  const startEmpty = 2; // offset
  
  let daysHtml = '';
  // Empty blocks
  for(let i=0; i<startEmpty; i++) {
    daysHtml += `<div class="cal-date empty">${30-i}</div>`;
  }
  // Days
  for(let i=1; i<=daysInMonth; i++) {
    const dayStr1 = `10월 ${i}일`;
    const dayStr2 = `10월 ${i < 10 ? '0'+i : i}일`;
    let hasEvent = DB.schedules.some(s => s.date === dayStr1 || s.date === dayStr2) ? '<div class="cal-dot"></div>' : '';
    let active = i === 15 ? 'active-date' : '';
    daysHtml += `<div class="cal-date ${active}" onclick="window.handleDateSelect(${i})">${i}${hasEvent}</div>`;
  }
  
  return `
    <div class="calendar-header">
      <h1>합주 캘린더</h1>
    </div>
    <div class="calendar-comp glass-panel">
      <div class="calendar-weeks">
        <div class="cal-day">월</div><div class="cal-day">화</div><div class="cal-day">수</div>
        <div class="cal-day">목</div><div class="cal-day">금</div><div class="cal-day">토</div><div class="cal-day">일</div>
        ${daysHtml}
      </div>
    </div>

    <div id="calendar-details-container" class="date-details mt-40">
      ${renderDateDetails(15)}
    </div>
  `;
};

const renderFeedPage = () => {
  return `
    <div class="feed-header">
      <h1>연습 피드</h1>
    </div>

    <div class="search-bar">
      <input type="text" id="feed-search-input" placeholder="세션, 태그, 멤버 검색..." onkeypress="if(event.key === 'Enter') window.executeSearch(null)">
      <button onclick="window.executeSearch(null)" style="background: none; border: none; cursor: pointer; padding: 4px; display: flex;">
        <i class="ph ph-magnifying-glass" style="color: var(--text-secondary); font-size: 20px; transition: color var(--transition-fast);"></i>
      </button>
    </div>
    
    <div class="trending-tags">
      <span class="tag-pill active" onclick="window.executeSearch('')">#전체</span>
      <span class="tag-pill" onclick="window.executeSearch('#롤링홀 준비')">#롤링홀 준비</span>
      <span class="tag-pill" onclick="window.executeSearch('#보컬')">#보컬</span>
      <span class="tag-pill" onclick="window.executeSearch('#베이스')">#베이스</span>
      <span class="tag-pill" onclick="window.executeSearch('#자작곡')">#자작곡</span>
    </div>

    <div class="feed-list">
      ${DB.feed.map(item => `
        <div class="feed-card glass-panel">
          <div class="feed-user">
            <div class="user-avatar-wrapper">
              <div class="user-avatar"><i class="ph-fill ph-user"></i></div>
              <div class="online-indicator"></div>
            </div>
            <div>
              <strong>${item.user}</strong>
              <small>${item.time}</small>
            </div>
          </div>
          <div class="feed-video-placeholder" style="background-image: url('${item.img}')">
             <div class="play-btn" onclick="this.style.color='var(--accent-secondary)';"><i class="ph-fill ph-play-circle"></i></div>
          </div>
          <div class="feed-content">
            <h3>${item.title}</h3>
            ${item.tags ? `<div class="feed-tags">${item.tags.map(t => `<span class="feed-tag-sm" onclick="window.executeSearch('${t}')">${t}</span>`).join('')}</div>` : ''}

            <div class="feed-stats">
              <span><i class="ph ph-eye"></i> ${item.views} 조회수</span>
              <span><i class="ph ph-chat-circle"></i> ${item.comments} 댓글</span>
            </div>
          </div>
          <div class="feed-actions">
            <button class="action-btn" onclick="window.toggleLike(this, ${item.id})" style="color: ${item.liked ? 'var(--inst-vocal)' : 'var(--text-secondary)'}">
              <i class="${item.liked ? 'ph-fill ph-heart' : 'ph ph-heart'}" style="color: ${item.liked ? 'var(--inst-vocal)' : ''}"></i> 좋아요
            </button>
            <button class="action-btn" onclick="window.showCommentsModal(${item.id})"><i class="ph ph-chat-circle"></i> 댓글 작성</button>
            <button class="action-btn"><i class="ph ph-share-network"></i> 공유</button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="fab" id="fab-upload" onclick="window.showUploadModal()">
      <i class="ph ph-upload-simple"></i>
    </div>
  `;
};

const renderProfilePage = () => {
  return `
    <div class="profile-header">
      <div class="avatar-large">
        <i class="ph-fill ph-user"></i>
      </div>
      <h1>Alex Vocalist</h1>
      <p>@alex_vocal</p>
    </div>

    <div class="profile-section glass-panel mt-40">
      <h2>소개</h2>
      <textarea class="styled-textarea" placeholder="자기소개를 작성해주세요...">세계를 흔들 준비가 된 싱어! 이번 달 롤링홀 세트리스트 완벽하게 준비중입니다.</textarea>
    </div>

    <div class="profile-section glass-panel mt-20">
      <div class="settings-row">
        <span>새 피드백 알림</span>
        <label class="toggle-switch">
          <input type="checkbox" checked>
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="auth-buttons mt-40">
      <button class="btn-primary w-100" onclick="alert('변경사항이 저장되었습니다!')">변경사항 저장</button>
      <button class="btn-secondary w-100 mt-20" onclick="alert('로그아웃 되었습니다')">로그아웃</button>
    </div>
  `;
};

// --- App Initialization & Navigation ---

const appInit = () => {
  const mainContent = document.getElementById('main-content');
  const navItems = document.querySelectorAll('.nav-item');

  // Page structure holder
  const pages = {
    home: document.createElement('div'),
    calendar: document.createElement('div'),
    feed: document.createElement('div'),
    profile: document.createElement('div')
  };

  // Initialize Pages
  Object.keys(pages).forEach(key => {
    pages[key].className = 'page';
    pages[key].id = `page-${key}`;
    mainContent.appendChild(pages[key]);
  });

  // Render contents
  pages.home.innerHTML = renderHomePage();
  pages.calendar.innerHTML = renderCalendarPage();
  pages.feed.innerHTML = renderFeedPage();
  pages.profile.innerHTML = renderProfilePage();

  // Navigation Logic
  let activePage = null;

  const switchPage = (target) => {
    // Nav Items Update
    navItems.forEach(item => {
      const icon = item.querySelector('i');
      if (item.dataset.target === target) {
        item.classList.add('active');
        const baseClass = icon.className.split(' ').find(c => c.startsWith('ph-') && c !== 'ph-fill');
        if (baseClass) icon.className = `ph-fill ${baseClass}`;
      } else {
        item.classList.remove('active');
        const baseClass = icon.className.split(' ').find(c => c.startsWith('ph-') && c !== 'ph-fill');
        if (baseClass) icon.className = `ph ${baseClass}`;
      }
    });

    // Page Transition
    if (activePage && activePage !== target) {
      pages[activePage].classList.remove('active');
    }
    
    // Allow tiny dom buffer for re-render display flex transition
    setTimeout(() => {
      pages[target].classList.add('active');
    }, 10);

    mainContent.scrollTo(0, 0);
    activePage = target;
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if(activePage !== item.dataset.target) {
        switchPage(item.dataset.target);
      }
    });
  });

  // Init First Page
  switchPage('home');
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', appInit);
