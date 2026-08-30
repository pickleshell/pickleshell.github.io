const completed = [
  ['69-ling-3-0-flash-fin-free','Ling 3.0 Flash Fin Free','Pass',[10,10,9,10],183.155,0,'OpenCode'],
  ['70-muse-spark-1-2-free','Muse Spark 1.2 Free','Pass',[10,10,8,10],160.390,0,'OpenCode'],
  ['01-gpt-5-6-luna','GPT-5.6 Luna','Pass',[10,10,9,10],63.463,.01130497,'OpenCode Go'],
  ['02-qwen3-7-plus','Qwen 3.7 Plus','Pass',[10,10,9,10],115.969,.02319824,'OpenCode Go'],
  ['03-kimi-k2-7-code','Kimi K2.7 Code','Pass',[10,10,9,10],197.082,.0907615,'OpenCode Go'],
  ['04-deepseek-v4-pro','DeepSeek V4 Pro','Pass',[10,10,8,10],222.705,.038534716,'OpenCode Go'],
  ['05-glm-5-2','GLM-5.2','Pass',[10,10,9,10],313.485,.18927496,'OpenCode Go'],
  ['06-minimax-m3','MiniMax M3','Pass',[10,10,8,10],102.534,.02988132,'OpenCode Go'],
  ['07-mimo-v2-5-pro','MiMo V2.5 Pro','Fail',[9,7,8,10],248.937,.012040568,'OpenCode Go'],
  ['11-deepseek-v4-flash','DeepSeek V4 Flash','Pass',[10,10,9,10],95.363,.012210568,'OpenCode Go'],
  ['14-hy3','Hy3','Pass',[10,10,8,10],52.877,.000748645,'OpenCode Go'],
  ['15-glm-5-1','GLM-5.1','Pass',[10,10,9,10],237.837,.17143388,'OpenCode Go'],
  ['16-kimi-k2-6','Kimi K2.6','Pass',[10,10,8,10],505.189,.10101602,'OpenCode Go'],
  ['18-gpt-5-3-codex-spark','GPT-5.3 Codex Spark','Pass',[10,10,9,10],24.34,null,'Codex'],
  ['19-big-pickle','Big Pickle','Pass',[10,10,9,10],129.612,0,'OpenCode'],
  ['27-hy3-free','Hy3 Free','Pass',[10,10,9,10],56.394,0,'OpenCode'],
  ['46-gpt-5-6-luna','GPT-5.6 Luna','Pass',[10,10,9,10],79.409,null,'Codex'],
  ['47-gpt-5-6-sol','GPT-5.6 Sol','Pass',[10,10,9,10],92.773,null,'Codex'],
  ['48-gpt-5-6-terra','GPT-5.6 Terra','Pass',[10,10,9,10],67.269,null,'Codex'],
  ['49-gpt-5-4','GPT-5.4','Pass',[10,10,9,10],62.189,null,'Codex'],
  ['50-gpt-5-4-mini','GPT-5.4 Mini','Pass',[10,10,8,10],100.469,null,'Codex'],
  ['54-inkling-openrouter','Inkling','Pass',[10,10,8,10],59.172,.05192436,'OpenRouter'],
  ['55-glm-5-3-go','GLM-5.3','Pass',[10,10,9,10],370.598,.19924764,'OpenCode Go'],
  ['57-qwen3-8-27b-openrouter','Qwen 3.8 27B','Pass',[10,10,8,10],314.587,.07159635,'OpenRouter'],
  ['58-grok-4-5-openrouter','Grok 4.5','Pass',[10,10,8,10],51.057,.0946592,'OpenRouter'],
  ['59-nemotron-3-super-openrouter-free','Nemotron 3 Super Free','Fail',[6,4,8,10],273.681,0,'OpenRouter'],
  ['65-grok-4-6-go','Grok 4.6','Pass',[10,10,8,10],198.99,.176188,'OpenCode Go'],
  ['66-glm-5-3-go','GLM-5.3','Pass',[10,10,9,10],467.449,.43643028,'OpenCode Go'],
  ['67-qwen3-8-max-go','Qwen 3.8 Max','Pass',[10,10,9,10],299.657,.148192,'OpenCode Go'],
  ['68-kimi-k3-go','Kimi K3','Pass',[10,10,9,10],313.263,.2865114,'OpenCode Go']
];
const unavailable = [
  ['51-claude-haiku-4-5','Claude Haiku 4.5','The exact OpenCode route did not return a recognised response during the release preflight, so the bug-fixing task was not started.'],
  ['52-claude-sonnet-5','Claude Sonnet 5','The exact OpenCode route did not return a recognised response during the release preflight, so the bug-fixing task was not started.'],
  ['53-claude-opus-5','Claude Opus 5','The exact OpenCode route did not return a recognised response during the release preflight, so the bug-fixing task was not started.'],
  ['56-kimi-k3-opencode','Kimi K3','The OpenCode route failed its harmless availability request before any repository files were presented to the model.'],
  ['60-gpt-5-6-terra-opencode','GPT-5.6 Terra','The OpenCode route failed its harmless availability request before any repository files were presented to the model.'],
  ['61-gpt-5-5-opencode','GPT-5.5','The OpenCode route failed its harmless availability request before any repository files were presented to the model.'],
  ['62-gpt-5-5-pro-opencode','GPT-5.5 Pro','The OpenCode route failed its harmless availability request before any repository files were presented to the model.'],
  ['63-gpt-5-4-pro-opencode','GPT-5.4 Pro','The OpenCode route failed its harmless availability request before any repository files were presented to the model.'],
  ['64-gpt-5-3-codex-opencode','GPT-5.3 Codex','The OpenCode route failed its harmless availability request before any repository files were presented to the model.']
];
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
const rows = completed.map((row, index) => ({id:row[0],label:row[1],status:'success',public:'Pass',hidden:row[2],f:row[3][0],r:row[3][1],m:row[3][2],s:row[3][3],overall:mean(row[3]),time:row[4],cost:row[5],channel:row[6],index}));
unavailable.forEach((row, offset) => rows.push({id:row[0],label:row[1],status:'unavailable',failureDetail:row[2],public:null,hidden:null,f:null,r:null,m:null,s:null,overall:null,time:null,cost:null,channel:'OpenCode',index:completed.length+offset}));
const missing = value => value === null || value === undefined;
const canonical = (a,b) => (a.status==='success'?0:1)-(b.status==='success'?0:1) || (b.overall??-1)-(a.overall??-1) || (a.time??Infinity)-(b.time??Infinity) || (a.cost??Infinity)-(b.cost??Infinity) || a.index-b.index;
[...rows].sort(canonical).forEach((row,index) => row.rank=row.status==='unavailable'?null:index+1);
let key='overall', direction=-1;
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const score = value => missing(value)?'<span class="na">N/A</span>':Number(value.toFixed(2));
const result = value => missing(value)?'<span class="na">N/A</span>':`<span class="badge result-badge ${value.toLowerCase()}">${value}</span>`;
function compare(a,b){if(key==='overall'&&direction===-1)return canonical(a,b);const av=a[key],bv=b[key];if(missing(av)!==missing(bv))return missing(av)?1:-1;if(missing(av))return a.index-b.index;const value=typeof av==='number'?av-bv:String(av).localeCompare(String(bv),undefined,{numeric:true,sensitivity:'base'});return direction*value||a.index-b.index}
function render(){document.getElementById('results-body').innerHTML=[...rows].sort(compare).map(row=>`<tr><td>${missing(row.rank)?'<span class="na">N/A</span>':`<strong>#${row.rank}</strong>`}<span class="badge ${row.status==='success'?'success':''}"${row.failureDetail?` data-failure-detail="${escapeHtml(row.failureDetail)}"`:''}>${row.status}</span></td><td><span class="model">${escapeHtml(row.label)}</span><span class="candidate-id">${escapeHtml(row.id)}</span></td><td class="score">${result(row.public)}</td><td class="score">${result(row.hidden)}</td><td class="score">${score(row.f)}</td><td class="score">${score(row.r)}</td><td class="score">${score(row.m)}</td><td class="score">${score(row.s)}</td><td class="score overall">${score(row.overall)}</td><td class="number">${missing(row.time)?'<span class="na">N/A</span>':row.time.toFixed(3)}</td><td class="number">${missing(row.cost)?'<span class="na">N/A</span>':`$${row.cost}`}</td><td class="channel">${row.channel}</td></tr>`).join('')}
document.querySelectorAll('th button').forEach(button=>button.addEventListener('click',()=>{if(key===button.dataset.key)direction*=-1;else{key=button.dataset.key;direction=1}render()}));
render();
