// App Logic (Betting Platform Style)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Service Worker Registration for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker Registrado', reg))
            .catch(err => console.log('Erro no Service Worker', err));
    }

    // 2. Mock Matches Data for "Palpites"
    const matches = [
        { id: 1, date: 'Sáb, 16:00', stadium: 'MetLife Stadium', home: 'Brasil', homeFlag: '🇧🇷', away: 'França', awayFlag: '🇫🇷', multiplier: 2.0 },
        { id: 2, date: 'Dom, 13:00', stadium: 'AT&T Stadium', home: 'Argentina', homeFlag: '🇦🇷', away: 'Portugal', awayFlag: '🇵🇹', multiplier: 1.8, hScore: 2, aScore: 1 },
        { id: 3, date: 'Sáb, 21:00', stadium: 'SoFi Stadium', home: 'Alemanha', homeFlag: '🇩🇪', away: 'Japão', awayFlag: '🇯🇵', multiplier: 2.5 },
        { id: 4, date: 'Dom, 16:00', stadium: 'Mercedes-Benz Arena', home: 'Inglaterra', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away: 'Espanha', awayFlag: '🇪🇸', multiplier: 1.5 },
    ];

    // State of unsaved bets (Bet Slip)
    let pendingBets = {};
    let isSlipOpen = false;

    // 3. Navigation Logic (SPA)
    const contentArea = document.getElementById('app-content');
    const navButtons = document.querySelectorAll('.nav-btn');

    function navigateTo(targetId) {
        // Update nav active state
        navButtons.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.add('active');
                btn.classList.remove('text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-bright/10');
            } else {
                btn.classList.remove('active');
                btn.classList.add('text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-bright/10');
            }
        });

        // Load Template
        const template = document.getElementById(`tpl-${targetId}`);
        if (template) {
            contentArea.innerHTML = '';
            contentArea.appendChild(template.content.cloneNode(true));
            
            // Re-initialize specific views
            if (targetId === 'palpites') {
                renderMatches();
                updateProgressUI();
            } else if (targetId === 'home') {
                initHomeView();
            }
        }
    }

    // Attach click listeners to navigation
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.target);
        });
    });

    window.navigateTo = navigateTo;

    // Load initial route
    navigateTo('home');

    // 4. Bet Slip Drawer Event Handlers
    const betSlip = document.getElementById('bet-slip');
    const betSlipHeader = document.getElementById('bet-slip-header');
    const betSlipArrow = document.getElementById('bet-slip-arrow');
    const btnConfirmBets = document.getElementById('btn-confirm-bets');

    function toggleBetSlip(open = !isSlipOpen) {
        isSlipOpen = open;
        if (isSlipOpen) {
            betSlip.classList.add('open');
            betSlipArrow.style.transform = 'rotate(180deg)';
        } else {
            betSlip.classList.remove('open');
            betSlipArrow.style.transform = 'rotate(0deg)';
        }
    }

    betSlipHeader.addEventListener('click', () => toggleBetSlip());

    // 5. Bet Slip Logic
    function updateBetSlip() {
        const countBadge = document.getElementById('bet-slip-count');
        const emptyMsg = document.getElementById('bet-slip-empty');
        const contentContainer = document.getElementById('bet-slip-content');
        const payoutEl = document.getElementById('bet-slip-payout');

        const pendingIds = Object.keys(pendingBets);
        const count = pendingIds.length;

        // Update badges
        countBadge.innerText = count;
        if (count > 0) {
            countBadge.classList.remove('hidden');
            emptyMsg.classList.add('hidden');
        } else {
            emptyMsg.classList.remove('hidden');
        }

        // Render pending list
        let totalMaxPoints = 0;
        const html = pendingIds.map(id => {
            const match = matches.find(m => m.id == id);
            const bet = pendingBets[id];
            // Base reward is 10 points for exact match.
            // Estimated payout is 10 points * multiplier.
            const estimatedPayout = Math.round(10 * match.multiplier);
            totalMaxPoints += estimatedPayout;

            return `
                <div class="flex items-center justify-between p-3 rounded-lg bg-surface border border-white/5 text-sm">
                    <div class="flex flex-col flex-1">
                        <span class="font-bold text-white text-xs">${match.home} x ${match.away}</span>
                        <span class="text-on-surface-variant text-[10px] uppercase">Multiplicador: x${match.multiplier.toFixed(1)}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="bg-primary/20 text-primary px-2.5 py-1 rounded font-black text-sm border border-primary/20">
                            ${bet.hScore} - ${bet.aScore}
                        </span>
                        <button class="text-red-400 hover:text-red-500 flex items-center justify-center p-1" onclick="removePendingBet(${id})">
                            <span class="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        contentContainer.innerHTML = count > 0 ? html : `<p class="text-on-surface-variant text-center py-4 text-sm" id="bet-slip-empty">Nenhum palpite selecionado no momento.</p>`;
        payoutEl.innerText = `${totalMaxPoints} PTS`;

        // Automatically open the slip when a bet is added (if it wasn't already open)
        if (count > 0 && !isSlipOpen) {
            toggleBetSlip(true);
        } else if (count === 0 && isSlipOpen) {
            toggleBetSlip(false);
        }
    }

    // Expose remove handler
    window.removePendingBet = function(id) {
        delete pendingBets[id];
        updateBetSlip();
        // If on the palpites page, re-render to clear highlights/inputs
        const contentArea = document.getElementById('app-content');
        if (document.getElementById('matches-container')) {
            renderMatches();
        }
    };

    // Confirm all bets in slip
    btnConfirmBets.addEventListener('click', () => {
        const pendingIds = Object.keys(pendingBets);
        if (pendingIds.length === 0) return;

        // Apply changes to local mock matches array
        pendingIds.forEach(id => {
            const match = matches.find(m => m.id == id);
            if (match) {
                match.hScore = pendingBets[id].hScore;
                match.aScore = pendingBets[id].aScore;
            }
        });

        // Visual Success Feedback
        btnConfirmBets.innerText = '✓ PALPITES ENVIADOS!';
        btnConfirmBets.classList.remove('bg-primary');
        btnConfirmBets.classList.add('bg-emerald-500', 'text-white');

        setTimeout(() => {
            btnConfirmBets.innerText = 'Confirmar Palpites';
            btnConfirmBets.classList.add('bg-primary');
            btnConfirmBets.classList.remove('bg-emerald-500', 'text-white');
            
            pendingBets = {};
            updateBetSlip();
            toggleBetSlip(false);
            
            // If on palpites tab, refresh visual states
            if (document.getElementById('matches-container')) {
                renderMatches();
                updateProgressUI();
            }
            alert('Aposta confirmada! Seus palpites foram salvos com sucesso.');
        }, 1000);
    });

    // 6. Match Renderer (Sportsbook style)
    function renderMatches() {
        const container = document.getElementById('matches-container');
        if (!container) return;

        container.innerHTML = matches.map(m => {
            // Get score from pending if edited but unsaved, else from saved match
            const isPending = pendingBets[m.id] !== undefined;
            const hVal = isPending ? pendingBets[m.id].hScore : (m.hScore !== undefined ? m.hScore : '');
            const aVal = isPending ? pendingBets[m.id].aScore : (m.aScore !== undefined ? m.aScore : '');

            // Calculate active 1X2 buttons
            let active1X2 = '';
            if (hVal !== '' && aVal !== '') {
                const hNum = parseInt(hVal);
                const aNum = parseInt(aVal);
                if (hNum > aNum) active1X2 = '1';
                else if (hNum === aNum) active1X2 = 'X';
                else if (hNum < aNum) active1X2 = '2';
            }

            return `
                <div class="match-card glass-card p-5 rounded-xl transition-all duration-300 hover:border-primary/20">
                    <div class="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <span class="text-[10px] font-bold px-2 py-0.5 bg-surface-bright text-on-surface-variant rounded uppercase tracking-wider">${m.date} • ${m.stadium}</span>
                        <span class="bg-secondary/10 border border-secondary/20 text-secondary font-black px-2 py-0.5 rounded text-[10px] uppercase">Multiplicador: x${m.multiplier.toFixed(1)}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 py-2">
                        <!-- Home Team -->
                        <div class="flex flex-col items-center flex-1">
                            <div class="w-14 h-14 mb-2 flex items-center justify-center p-2 rounded-full bg-surface border border-white/10 text-2xl shadow-inner">
                                ${m.homeFlag}
                            </div>
                            <span class="text-xs font-bold text-center uppercase tracking-tight text-white">${m.home}</span>
                        </div>

                        <!-- Score Inputs -->
                        <div class="flex items-center gap-2">
                            <input type="number" 
                                   id="h-input-${m.id}"
                                   class="w-12 h-14 bg-surface-bright border border-white/10 rounded-lg text-center font-extrabold text-2xl text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                                   placeholder="0" 
                                   value="${hVal}"
                                   oninput="handleManualInput(${m.id})">
                            <span class="font-bold text-on-surface-variant">x</span>
                            <input type="number" 
                                   id="a-input-${m.id}"
                                   class="w-12 h-14 bg-surface-bright border border-white/10 rounded-lg text-center font-extrabold text-2xl text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                                   placeholder="0" 
                                   value="${aVal}"
                                   oninput="handleManualInput(${m.id})">
                        </div>

                        <!-- Away Team -->
                        <div class="flex flex-col items-center flex-1">
                            <div class="w-14 h-14 mb-2 flex items-center justify-center p-2 rounded-full bg-surface border border-white/10 text-2xl shadow-inner">
                                ${m.awayFlag}
                            </div>
                            <span class="text-xs font-bold text-center uppercase tracking-tight text-white">${m.away}</span>
                        </div>
                    </div>

                    <!-- Odds Selection 1X2 -->
                    <div class="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
                        <button class="odds-btn py-2.5 rounded-lg font-bold text-xs uppercase ${active1X2 === '1' ? 'active' : ''}" onclick="selectWinner(${m.id}, 'home')">CASA</button>
                        <button class="odds-btn py-2.5 rounded-lg font-bold text-xs uppercase ${active1X2 === 'X' ? 'active' : ''}" onclick="selectWinner(${m.id}, 'draw')">EMPATE</button>
                        <button class="odds-btn py-2.5 rounded-lg font-bold text-xs uppercase ${active1X2 === '2' ? 'active' : ''}" onclick="selectWinner(${m.id}, 'away')">FORA</button>
                    </div>
                </div>
            `;
        }).join('');

        // Apply focus behaviors
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function() {
                if(this.value.length > 2) this.value = this.value.slice(0,2);
            });
            input.addEventListener('focus', function() { this.select(); });
        });
    }

    // Interactive 1X2 Quick Selector Logic
    window.selectWinner = function(matchId, choice) {
        let hInput = document.getElementById(`h-input-${matchId}`);
        let aInput = document.getElementById(`a-input-${matchId}`);
        if (!hInput || !aInput) return;

        let homeVal = parseInt(hInput.value) || 0;
        let awayVal = parseInt(aInput.value) || 0;

        if (choice === 'home') {
            if (homeVal <= awayVal) {
                hInput.value = awayVal + 1;
            }
        } else if (choice === 'away') {
            if (awayVal <= homeVal) {
                aInput.value = homeVal + 1;
            }
        } else if (choice === 'draw') {
            const max = Math.max(homeVal, awayVal);
            hInput.value = max;
            aInput.value = max;
        }

        // Add to pending bets
        pendingBets[matchId] = {
            hScore: parseInt(hInput.value) || 0,
            aScore: parseInt(aInput.value) || 0
        };

        renderMatches(); // Re-render to update classes
        updateBetSlip();
    };

    window.handleManualInput = function(matchId) {
        let hInput = document.getElementById(`h-input-${matchId}`);
        let aInput = document.getElementById(`a-input-${matchId}`);
        if (!hInput || !aInput) return;

        if (hInput.value === '' && aInput.value === '') {
            delete pendingBets[matchId];
        } else {
            pendingBets[matchId] = {
                hScore: hInput.value === '' ? 0 : parseInt(hInput.value),
                aScore: aInput.value === '' ? 0 : parseInt(aInput.value)
            };
        }
        updateBetSlip();
    };

    // 7. Update progress indicator inside Palpites tab
    function updateProgressUI() {
        const progressText = document.getElementById('palpites-progress-text');
        const progressBar = document.getElementById('palpites-progress-bar');
        if (!progressText || !progressBar) return;

        // Calculate saved + pending
        const total = matches.length;
        let completed = 0;
        matches.forEach(m => {
            const isPending = pendingBets[m.id] !== undefined;
            const hVal = isPending ? pendingBets[m.id].hScore : m.hScore;
            if (hVal !== undefined) {
                completed++;
            }
        });

        progressText.innerText = `${completed} / ${total} JOGOS`;
        progressBar.style.width = `${(completed / total) * 100}%`;
    }

    // 8. Featured Game Logic on Home Tab
    let homeQuickChoice = null;
    window.selectQuickWinner = function(id, choice) {
        homeQuickChoice = choice;
        const hInput = document.getElementById('quick-home-1');
        const aInput = document.getElementById('quick-away-1');
        if (!hInput || !aInput) return;

        // Visual selection states
        const btns = hInput.closest('.glass-card').querySelectorAll('.odds-btn');
        btns.forEach((btn, idx) => {
            btn.classList.remove('active');
            if (choice === 'home' && idx === 0) btn.classList.add('active');
            if (choice === 'draw' && idx === 1) btn.classList.add('active');
            if (choice === 'away' && idx === 2) btn.classList.add('active');
        });

        if (choice === 'home') {
            hInput.value = 2;
            aInput.value = 1;
        } else if (choice === 'draw') {
            hInput.value = 1;
            aInput.value = 1;
        } else if (choice === 'away') {
            hInput.value = 1;
            aInput.value = 2;
        }
    };

    window.saveQuickBet = function(matchId) {
        const hInput = document.getElementById('quick-home-1');
        const aInput = document.getElementById('quick-away-1');
        if (!hInput || !aInput || hInput.value === '' || aInput.value === '') {
            alert('Selecione o vencedor ou preencha o placar antes!');
            return;
        }

        pendingBets[matchId] = {
            hScore: parseInt(hInput.value),
            aScore: parseInt(aInput.value)
        };

        updateBetSlip();
        toggleBetSlip(true);
    };

    function initHomeView() {
        // Clear quick selection state
        homeQuickChoice = null;
    }
});
