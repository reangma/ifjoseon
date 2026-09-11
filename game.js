/* =========================================================
   1. 에셋 경로
   ========================================================= */
const ART = {
  bg_black: "assets/bg_black.webp",
  bg_exile: "assets/bg_exile.webp",
  bg_gate: "assets/bg_gate.webp",
  bg_night: "assets/bg_night.webp",
  bg_palace_ext: "assets/bg_palace_ext.webp",
  bg_street: "assets/bg_street.webp",
  bg_throne: "assets/bg_throne.webp",
  bg_warfield: "assets/bg_warfield.webp",
  char_gh_normal: "assets/char_gh_normal.webp",
  char_gh_tired: "assets/char_gh_tired.webp",
  char_gs_smile: "assets/char_gs_smile.webp",
  char_inmok_angry: "assets/char_inmok_angry.webp",
  char_kh_grim: "assets/char_kh_grim.webp",
  char_kh_normal: "assets/char_kh_normal.webp",
  char_ny_normal: "assets/char_ny_normal.webp",
  char_yi_normal: "assets/char_yi_normal.webp",
  char_yi_smile: "assets/char_yi_smile.webp",
  title: "assets/title.webp",
};

/* =========================================================
   2. 상태 — Ren'Py definitions.rpy 와 동일
   ========================================================= */
const START = {hp:70, gold:50, fame:60, yi:60, kh:50, gs:45};
let V;

/* 진행 보조 상태 — 되감기 / 기록 / 자동 / 스킵 */
let backlog = [];      // 기록 화면용 대사 목록
let snaps   = [];       // 되감기 스냅샷 (대기 지점마다 1개)
let auto = false, skip = false, autoTimer = null;
const cfg = {cps:55, autoWait:1400};

function reset(){
  V = Object.assign({}, START, {
    pyemo:"", troop:"", blocked:false,
    pool:["sangso","yicheom","gungwol","kunryang","gaesi","byeong","myeong"]
  });
}

const rnd = (lo,hi) => Math.floor(Math.random()*(hi-lo+1))+lo;
const clamp = v => Math.max(0, Math.min(100, v));

const LABELS = {hp:"체력", gold:"재정", fame:"평판", yi:"이이첨 충성", kh:"강홍립 충성", gs:"김개시 충성"};

function chg(d){
  const msgs=[];
  for(const k in d){
    if(!d[k]) continue;
    V[k] = clamp(V[k] + d[k]);
    msgs.push([LABELS[k], d[k]]);
  }
  if(msgs.length) toast(msgs);
  paintHud();
}

/* =========================================================
   3. 스크립트 — script.rpy / events.rpy 이식
   ========================================================= */
const bg   = k            => ({t:"bg", k});
const show = (k,at)       => ({t:"show", k, at});
const hide = at           => ({t:"hide", at});
const say  = (who,text)   => ({t:"say", who, text});
const nar  = text         => ({t:"say", who:null, text});
const menu = (ask,opts)   => ({t:"menu", ask, opts});
const call = label        => ({t:"call", label});
const jump = label        => ({t:"jump", label});
const round_ = n          => ({t:"round", n});
const act   = fn          => ({t:"act", fn});
const end   = (kind,name) => ({t:"end", kind, name});

const WHO = {
  gh:{name:"광해군", color:"#e8c86a"},
  yi:{name:"이이첨", color:"#a878e0"},
  kh:{name:"강홍립", color:"#e08a4a"},
  inmok:{name:"인목대비", color:"#cfd4e6"},
  ny:{name:"능양군", color:"#6aa8e0"},
  gs:{name:"김개시", color:"#e06a96"}
};

const SEQ = {

/* ---------------- 프롤로그 ---------------- */
prologue:[
  bg("bg_black"),
  nar("1608년. 선조가 승하했다."),
  nar("전란을 수습한 것은 세자였으나, 선조가 끝내 마음에 둔 것은 어린 적자 영창이었다."),
  bg("bg_palace_ext"),
  nar("그 영창을 뒤로하고, 서자이자 차남인 내가 왕위에 올랐다."),
  bg("bg_throne"),
  show("char_gh_tired","center"),
  say("gh","……나는 처음부터 흠이 있는 왕이다."),
  hide("center"),
  nar("명분이 모자란 왕에게 남은 길은 하나뿐이다. 잘 다스리는 것."),
  nar("재정을 세우고, 전란을 피하고, 사람을 잃지 않는 것."),
  nar("그 셋을 지키는 동안, 조정은 내 등 뒤에서 다른 셈을 하고 있었다."),
  round_(2),
  jump("act1")
],

/* ---------------- 1막 폐모살제 ---------------- */
act1:[
  bg("bg_throne"),
  nar("1613년. 대북파가 옥사를 일으켰다."),
  nar("칼끝은 처음부터 한 곳을 향하고 있었다 — 영창대군과 그 어머니 인목대비."),
  show("char_yi_normal","left"),
  say("yi","전하. 역모의 뿌리를 남기면 반드시 다시 자라옵니다."),
  say("yi","영창을 폐서인하고, 대비를 서궁에 유폐하소서. 이것이 대북의 뜻이자 종사의 뜻이옵니다."),
  show("char_inmok_angry","right"),
  say("inmok","주상. 선왕의 유교를 잊으셨소? 내 아들을 죽이고 나를 가두면, 그대는 무엇으로 왕이 되겠소."),
  hide("right"), hide("left"),
  say("gh","(어느 쪽을 택하든 나는 무언가를 잃는다.)"),
  menu("폐모살제 — 어떻게 할 것인가?", [
    {
      label:"대북의 요구를 그대로 받아들인다",
      then:[
        act(()=>{ V.pyemo="accept"; chg({fame:-rnd(18,26), yi:rnd(12,18)}); }),
        nar("영창은 강화로 보내졌고, 대비는 서궁에 갇혔다."),
        nar("왕권은 단단해졌다. 대신 '어머니를 가둔 왕'이라는 이름이 따라붙었다.")
      ]
    },
    {
      label:"영창만 처형하고 대비는 유폐에 그친다",
      req:"평판 50 이상",
      cond:()=>V.fame>=50,
      then:[
        act(()=>{ V.pyemo="partial"; chg({fame:-rnd(8,14), yi:rnd(4,9)}); }),
        say("gh","대비는 건드리지 않는다. 선왕의 계비다."),
        say("yi","……반만 도려낸 뿌리는 다시 자라옵니다, 전하."),
        nar("칼은 절반만 내려갔다. 양쪽 모두가 만족하지 못했다.")
      ]
    },
    {
      label:"둘 다 지키고 대북을 누른다",
      req:"평판 65 · 이이첨 충성 55 이상",
      cond:()=>V.fame>=65 && V.yi>=55,
      then:[
        act(()=>{ V.pyemo="refuse"; chg({fame:rnd(10,16), yi:-rnd(14,20)}); }),
        say("gh","옥사는 여기서 끝낸다. 더 캐는 자는 내가 먼저 묻겠다."),
        say("yi","……전하께서 대북을 버리시는군요."),
        nar("폐모살제는 일어나지 않았다. 훗날 반정의 명분 하나가 사라졌다.")
      ]
    }
  ]),
  round_(2),
  jump("act2")
],

/* ---------------- 2막 강홍립 파병 ---------------- */
act2:[
  bg("bg_throne"),
  nar("1618년. 후금의 누르하치가 명에 선전포고했다."),
  nar("명은 조선에 군사를 요구했다. 임진년의 은혜를 갚으라는 것이다."),
  show("char_kh_grim","right"),
  say("kh","전하. 명은 이미 기울고 있사옵니다. 후금의 기병을 신이 북변에서 보았습니다."),
  say("kh","허나 명분을 저버리면 조정이 먼저 무너집니다. 어느 쪽을 택하시든, 신은 갑니다."),
  hide("right"),
  say("gh","(명을 따르면 병사를 잃고, 명을 버리면 조정을 잃는다.)"),
  menu("사르후 파병 — 어떻게 할 것인가?", [
    {
      label:"요구대로 대군을 파병한다",
      then:[
        act(()=>{ V.troop="full"; chg({gold:-rnd(18,26), fame:rnd(6,12), kh:-rnd(4,9)}); }),
        bg("bg_warfield"),
        nar("1619년 사르후. 조선군 1만 3천이 명군과 함께 무너졌다."),
        nar("살아 돌아온 자는 절반이 되지 않았다.")
      ]
    },
    {
      label:"파병하되 강홍립에게 밀지를 내린다",
      req:"강홍립 충성 60 이상",
      cond:()=>V.kh>=60,
      then:[
        act(()=>{ V.troop="secret"; chg({gold:-rnd(10,16), fame:-rnd(3,7), kh:rnd(8,14)}); }),
        say("gh","형세를 보아라. 이길 수 없는 싸움이면, 군사를 살려 돌아올 길을 찾아라."),
        bg("bg_warfield"),
        nar("사르후에서 명군이 무너지자, 강홍립은 남은 병력을 이끌고 후금에 투항했다."),
        nar("병사 대부분이 살아남았다. 조정에서는 '오랑캐에 무릎 꿇었다'는 탄핵이 빗발쳤다.")
      ]
    },
    {
      label:"파병을 끝내 거부한다",
      req:"재정 60 · 평판 55 이상",
      cond:()=>V.gold>=60 && V.fame>=55,
      then:[
        act(()=>{ V.troop="refuse"; chg({gold:-rnd(8,14), fame:-rnd(10,16)}); }),
        say("gh","우리 백성의 피로 남의 전쟁을 치를 수는 없다."),
        nar("조선은 단 한 명도 보내지 않았다."),
        nar("사대부들은 이날을 '조선이 예를 버린 날'로 기록했다.")
      ]
    }
  ]),
  round_(1),
  jump("act3")
],

/* ---------------- 3막 인조반정 ---------------- */
act3:[
  bg("bg_gate"),
  nar("1623년 3월 12일 밤. 능양군을 앞세운 서인들이 군사를 일으켰다."),
  act(function(){
    const t = V.pyemo==="accept"
      ? "그들이 내건 명분은 둘이었다 — 어머니를 가둔 패륜, 그리고 오랑캐와 통한 죄."
      : V.pyemo==="refuse"
        ? "패륜의 죄를 씌울 수 없게 되자, 그들은 오랑캐와 통했다는 죄 하나만을 내걸었다."
        : "그들은 내가 반쯤 내린 칼을 패륜이라 불렀다.";
    return [nar(t)];
  }),
  show("char_ny_normal","center"),
  say("ny","종사가 무너지고 있소. 오늘 밤, 하늘의 뜻을 바로잡겠소."),
  hide("center"),
  nar("창덕궁의 담 너머로 횃불이 번졌다."),
  say("gh","(15년이다. 15년을 버텼는데, 오늘 밤에 끝나는가.)"),
  menu("반정의 밤 — 어떻게 할 것인가?", [
    {
      label:"궁을 버리고 몸을 피한다",
      then:[
        act(()=>{ V.blocked=false; }),
        nar("나는 내관의 등에 업혀 담을 넘었다."),
        nar("이틀 뒤, 의관의 집에서 붙잡혔다.")
      ]
    },
    {
      label:"친위 병력으로 맞선다",
      req:"체력 40 · 재정 30 이상",
      cond:()=>V.hp>=40 && V.gold>=30,
      then:[
        act(()=>{ V.blocked=true; chg({hp:-rnd(14,22), gold:-rnd(10,18)}); }),
        say("gh","내 손으로 앉은 자리다. 내 손으로 지킨다."),
        nar("밀린 녹봉 없이 지켜온 금군이 돈화문 앞을 막아섰다."),
        nar("새벽까지 이어진 싸움 끝에, 반정군이 먼저 흩어졌다.")
      ]
    },
    {
      label:"김개시의 첩보로 선수를 친다",
      req:"김개시 충성 65 이상",
      cond:()=>V.gs>=65,
      then:[
        act(()=>{ V.blocked=true; chg({gs:rnd(5,10), fame:-rnd(5,10)}); }),
        show("char_gs_smile","right"),
        say("gs","전하. 오늘 밤이옵니다. 모이는 자리까지 적어두었사옵니다."),
        hide("right"),
        nar("거사가 시작되기 전에 주모자들이 먼저 잡혔다."),
        nar("피는 적게 흘렀다. 대신 궁 안의 모든 입이 서로를 의심하기 시작했다.")
      ]
    },
    {
      label:"능양군을 직접 만나 설득한다",
      req:"평판 70 이상",
      cond:()=>V.fame>=70,
      then:[
        act(()=>{ V.blocked=true; chg({fame:rnd(6,12), hp:-rnd(6,12)}); }),
        say("gh","칼을 거두어라. 네가 내걸 명분을, 나는 이미 하나도 남기지 않았다."),
        show("char_ny_normal","center"),
        say("ny","……"),
        hide("center"),
        nar("횃불이 하나씩 꺼졌다. 명분 없는 군사는 스스로 흩어졌다.")
      ]
    }
  ]),
  jump("check")
],

/* ---------------- 엔딩 판정 ---------------- */
check:[
  act(function(){
    if(V.blocked && V.troop==="secret" && V.fame>=55) return [jump("end_reform")];
    if(V.blocked) return [jump("end_iron")];
    if(V.fame<35) return [jump("end_tyrant")];
    return [jump("end_history")];
  })
],

end_reform:[
  bg("bg_throne"),
  nar("반정은 실패했고, 나는 왕으로 남았다."),
  nar("명은 기울었고 후금은 일어섰다. 어느 쪽에도 완전히 서지 않은 나라는, 그 사이에서 숨을 쉬었다."),
  show("char_gh_normal","center"),
  say("gh","이걸 잘한 정치라 부를 사람은 없을 것이다."),
  say("gh","다만 오늘 죽지 않은 사람이, 어제보다 많다."),
  hide("center"),
  nar("훗날의 사서는 이 시대를 '병자년의 치욕이 없었던 조선'이라 적었다."),
  end("최고 엔딩","줄 위의 치세")
],

end_iron:[
  bg("bg_throne"),
  nar("반정군은 흩어졌고, 나는 옥좌에 남았다."),
  nar("그날 이후 나는 신하의 얼굴을 볼 때마다 그 밤의 횃불을 떠올렸다."),
  say("gh","이긴 것인가, 아니면 다음을 미룬 것인가."),
  nar("옥사가 이어졌다. 왕좌는 지켜졌고, 조정은 조용해졌다."),
  nar("너무 조용해서, 아무도 진심을 말하지 않는 조정이 되었다."),
  end("엔딩","칼 위의 옥좌")
],

end_history:[
  bg("bg_exile"),
  nar("나는 폐위되어 강화로, 다시 제주로 옮겨졌다."),
  nar("왕이었던 자에게는 묘호가 주어지지 않았다. 그래서 나는 광해군으로 남았다."),
  nar("유배지에서 나는 열여덟 해를 더 살았다."),
  nar("나를 몰아낸 왕은 병자년에 삼전도에서 세 번 절하고 아홉 번 머리를 찧었다."),
  say("gh","……내가 피하려 했던 것이 바로 그것이었다."),
  end("엔딩","묘호 없는 왕")
],

end_tyrant:[
  bg("bg_exile"),
  nar("백성은 나를 위해 한 명도 일어서지 않았다."),
  nar("곳간은 비었고, 궁궐만 높았고, 사림은 등을 돌린 지 오래였다."),
  nar("폐위된 왕에 대한 기록은 짧았다."),
  nar("— 사치하고, 의심하고, 어머니를 가두었다. 그리하여 하늘이 버렸다."),
  say("gh","그 열다섯 해에, 정말 그것뿐이었는가."),
  end("배드 엔딩","하늘이 버린 왕")
],

/* ---------------- 서브 이벤트 7종 ---------------- */
sangso:[
  bg("bg_night"),
  nar("자정이 넘었다. 결재를 기다리는 상소가 아직 무릎 높이로 쌓여 있다."),
  menu("상소 더미 — 어떻게 할 것인가?", [
    {label:"밤을 새워 전부 읽는다", then:[
      act(()=>chg({hp:-rnd(9,15), fame:rnd(4,9)})),
      say("gh","내 손을 거치지 않은 일이 조정에서 굴러다니게 둘 수는 없다.")
    ]},
    {label:"내일로 미루고 눕는다", then:[
      act(()=>chg({hp:rnd(4,8), fame:-rnd(3,7)})),
      say("gh","……오늘은 여기까지 하자."),
      nar("미뤄진 문서는 다음 날 누군가의 손을 거쳐 돌아왔다.")
    ]}
  ])
],

yicheom:[
  bg("bg_night"),
  show("char_yi_smile","right"),
  say("yi","전하. 신이 좋은 술을 구했사옵니다. 대북의 젊은 관원들도 함께 부르지요."),
  menu("이이첨의 술자리 — 어떻게 할 것인가?", [
    {label:"자리를 받아준다", then:[
      act(()=>chg({gold:-rnd(4,9), fame:-rnd(3,8), yi:rnd(10,16)})),
      say("yi","역시 전하십니다. 대북은 언제나 전하의 편이옵니다."),
      nar("사림의 입에 '왕이 한 당파와만 술을 마신다'는 말이 돌기 시작했다.")
    ]},
    {label:"정사를 핑계로 물린다", then:[
      act(()=>chg({fame:rnd(3,7), yi:-rnd(8,14)})),
      say("gh","술자리는 조정이 한가할 때 하지."),
      say("yi","……예. 지당하신 말씀이옵니다."),
      nar("물러나는 뒷모습이 오래 굽혀져 있었다.")
    ]}
  ]),
  hide("right")
],

gungwol:[
  bg("bg_palace_ext"),
  nar("인경궁과 경덕궁의 영건이 멈춰 있다. 호조는 더 댈 돈이 없다고 한다."),
  menu("궁궐 영건 — 어떻게 할 것인가?", [
    {label:"공사를 강행한다", then:[
      act(()=>chg({gold:-rnd(14,22), fame:-rnd(6,12), yi:rnd(4,9)})),
      say("gh","왕궁이 초라하면 왕권도 초라해 보인다."),
      bg("bg_street"),
      nar("부역에 끌려간 백성의 원성이 도성 밖까지 퍼졌다.")
    ]},
    {label:"공사를 중단시킨다", then:[
      act(()=>chg({gold:rnd(10,16), fame:rnd(5,10), yi:-rnd(5,10)})),
      say("gh","돌을 쌓는 일은 뒤로 미룬다. 지금은 곳간이 먼저다.")
    ]}
  ])
],

kunryang:[
  bg("bg_throne"),
  show("char_kh_normal","right"),
  say("kh","북변의 군졸들이 겨울을 맨몸으로 납니다. 군량과 군포를 청하옵니다."),
  menu("군량 요청 — 어떻게 할 것인가?", [
    {label:"청한 대로 내어준다", then:[
      act(()=>chg({gold:-rnd(10,16), kh:rnd(14,20)})),
      say("kh","……이 은혜, 신이 어디서 갚아야 할지 알고 있사옵니다.")
    ]},
    {label:"지금은 어렵다고 미룬다", then:[
      act(()=>chg({gold:rnd(2,5), kh:-rnd(10,15)})),
      say("kh","예. 군졸들에게는 조금만 더 참으라 이르겠습니다."),
      nar("그가 고개를 숙였을 때, 목소리에서 무언가가 빠져나갔다.")
    ]}
  ]),
  hide("right")
],

gaesi:[
  bg("bg_night"),
  show("char_gs_smile","right"),
  say("gs","전하. 요즘 서인 쪽 젊은 것들이 밤마다 모인다 하옵니다. ……더 들으시겠습니까?"),
  menu("김개시의 정보 — 어떻게 할 것인가?", [
    {label:"값을 치르고 끝까지 듣는다", then:[
      act(()=>chg({gold:-rnd(8,13), gs:rnd(20,28)})),
      say("gs","호호. 전하께서는 늘 값을 아시는 분이지요."),
      nar("그 후로 궁 밖의 소문은 언제나 그녀를 통해 먼저 들어왔다.")
    ]},
    {label:"궁녀의 말을 정사에 들이지 않는다", then:[
      act(()=>chg({fame:rnd(4,8), gs:-rnd(10,16)})),
      say("gh","내명부의 입은 내명부에서 멈춰야 한다."),
      say("gs","……예, 전하.")
    ]}
  ]),
  hide("right")
],

byeong:[
  bg("bg_night"),
  nar("새벽부터 가슴이 결린다. 즉위 이후로 성한 날이 없었다."),
  menu("왕의 지병 — 어떻게 할 것인가?", [
    {label:"어의를 부르고 며칠 쉰다", then:[
      act(()=>chg({hp:rnd(12,18), gold:-rnd(4,8), fame:-rnd(2,5)})),
      nar("조회가 사흘 비었다. 그 사흘 동안 조정은 조정대로 굴러갔다.")
    ]},
    {label:"참고 조회에 나간다", then:[
      act(()=>chg({hp:-rnd(10,16), fame:rnd(5,9)})),
      say("gh","왕이 병을 핑계 대기 시작하면, 신하는 왕을 병자로만 본다.")
    ]}
  ])
],

myeong:[
  bg("bg_throne"),
  nar("명의 사신이 또 왔다. 이번에도 요구는 하나다 — 병력과 군량."),
  menu("명 사신의 압박 — 어떻게 할 것인가?", [
    {label:"후하게 대접하고 시간을 번다", then:[
      act(()=>chg({gold:-rnd(9,15), fame:rnd(5,10)})),
      say("gh","임진년에 진 빚이 있다. 그 빚을 지금 다 갚을 수는 없어도, 갚는 시늉은 해야 한다.")
    ]},
    {label:"냉대하여 돌려보낸다", then:[
      act(()=>chg({gold:rnd(5,9), fame:-rnd(8,13)})),
      nar("'배은망덕하다'는 말이 사대부들 사이에서 돌았다.")
    ]}
  ])
]

};

/* =========================================================
   4. 화면
   ========================================================= */
const $ = id => document.getElementById(id);
const stage=$("stage"), hud=$("hud"), plate=$("plate"), whoEl=$("who"),
      lineEl=$("line"), nudge=$("nudge"), choicesEl=$("choices"),
      toastEl=$("toast"), titleEl=$("title"), endingEl=$("ending");
const SPR = {left:$("spL"), right:$("spR"), center:$("spC")};
let bgFront = $("bgA"), bgBack = $("bgB"), curBg = null;

function setBg(key){
  if(curBg === key) return;
  curBg = key;
  bgBack.style.backgroundImage = `url(${ART[key] || ART.bg_black})`;
  bgBack.classList.add("on");
  bgFront.classList.remove("on");
  const t = bgFront; bgFront = bgBack; bgBack = t;
}

function setSprite(at, key){
  const el = SPR[at];
  if(!el) return;
  if(key){ el.src = ART[key] || ""; el.classList.add("on"); }
  else { el.classList.remove("on"); }
}
function clearSprites(){ for(const k in SPR) SPR[k].classList.remove("on"); }

const STAT_ROWS = [["hp","체력","var(--hp)"],["gold","재정","var(--gold-stat)"],["fame","평판","var(--fame)"]];
const LOY_ROWS  = [["yi","이이첨"],["kh","강홍립"],["gs","김개시"]];

function buildHud(){
  $("statPanel").innerHTML = STAT_ROWS.map(([k,l,c])=>
    `<div class="stat"><div class="lab"><b>${l}</b><i id="v_${k}">0</i></div>
     <div class="bar"><span id="b_${k}" style="background:${c}"></span></div></div>`).join("");
  $("loyalPanel").innerHTML =
    `<div class="loyal-title">신하 충성도</div>` +
    LOY_ROWS.map(([k,l])=>
      `<div class="loyal-row"><b>${l}</b>
       <div class="bar"><span id="b_${k}" style="background:var(--loyal)"></span></div>
       <i id="v_${k}">0</i></div>`).join("");
}

function paintHud(){
  for(const k of ["hp","gold","fame","yi","kh","gs"]){
    const v = $("v_"+k), b = $("b_"+k);
    if(v) v.textContent = V[k];
    if(b) b.style.width = V[k] + "%";
  }
}

let toastTimer = null;

/* 안내 문구 — 스탯 토스트와 같은 자리를 쓰되 중립 색으로 */
function hint(text){
  toastEl.className = "hint on";
  toastEl.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ toastEl.className = ""; }, 4200);
}

function toast(msgs){
  toastEl.className = "";
  toastEl.innerHTML = msgs.map(([l,d]) =>
    `<div class="${d>0?"up":"down"}">${l} ${d>0?"+":""}${d}</div>`).join("");
  toastEl.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.classList.remove("on"), 2200);
}

/* ---------- 타자기 ---------- */
let typing = null, fullText = "";
function renderLine(who, text){
  plate.classList.add("on");
  fullText = text;
  if(who){
    whoEl.textContent = WHO[who].name;
    whoEl.style.color = WHO[who].color;
    lineEl.classList.remove("nar");
  } else {
    whoEl.textContent = "";
    lineEl.classList.add("nar");
  }
  lineEl.textContent = "";
  nudge.textContent = "";
  nudge.classList.remove("blink");

  clearInterval(typing); typing = null;

  const ms = skip ? 0 : (cfg.cps > 0 ? Math.max(8, Math.round(1000 / cfg.cps)) : 0);
  if(ms === 0){ doneTyping(); return; }

  let i = 0;
  typing = setInterval(()=>{
    lineEl.textContent = text.slice(0, ++i);
    if(i >= text.length) doneTyping();
  }, ms);
}
function doneTyping(){
  clearInterval(typing); typing = null;
  lineEl.textContent = fullText;
  nudge.textContent = "▼";
  nudge.classList.add("blink");
  scheduleAuto();
}

/* 자동/스킵이 켜져 있으면 다음 대사를 예약한다 */
function scheduleAuto(){
  clearTimeout(autoTimer);
  if(skip)      autoTimer = setTimeout(()=>{ if(skip) advance(); }, 45);
  else if(auto) autoTimer = setTimeout(()=>{ if(auto) advance(); }, cfg.autoWait);
}

/* =========================================================
   5. 되감기 스냅샷
   대기(대사·선택지) 지점마다 상태를 통째로 저장해 두고,
   되감기 때는 재실행 없이 그 지점을 그대로 복원한다.
   (재실행하면 난수가 다시 굴러 결과가 달라지기 때문)
   ========================================================= */
function snapshot(node){
  snaps.push({
    V: JSON.parse(JSON.stringify(V)),
    stack: stack.map(f => ({seq:f.seq, i:f.i})),
    node,
    bg: curBg,
    spr: Object.keys(SPR).map(k => ({
      at: k,
      on: SPR[k].classList.contains("on"),
      src: SPR[k].getAttribute("src") || ""
    }))
  });
  if(snaps.length > 200) snaps.shift();
  syncControls();
}

function restore(s){
  V = JSON.parse(JSON.stringify(s.V));
  stack = s.stack.map(f => ({seq:f.seq, i:f.i}));
  paintHud();

  curBg = null;
  setBg(s.bg || "bg_black");

  s.spr.forEach(o => {
    const el = SPR[o.at];
    if(o.on && o.src){ el.setAttribute("src", o.src); el.classList.add("on"); }
    else el.classList.remove("on");
  });

  choicesEl.classList.remove("on");
  if(s.node.t === "menu"){
    waiting = false;
    showChoices(s.node);
  } else {
    renderLine(s.node.who, s.node.text);
    doneTyping();
    clearTimeout(autoTimer);
    waiting = true;
  }
}

function goBack(){
  if(snaps.length < 2) return;
  auto = skip = false;
  clearTimeout(autoTimer);
  snaps.pop();                       // 지금 보고 있는 지점을 버리고
  if(backlog.length) backlog.pop();
  restore(snaps[snaps.length - 1]);  // 직전 지점으로 돌아간다
  syncControls();
}

/* =========================================================
   6. 인터프리터
   ========================================================= */
let stack = [], waiting = false;

function runLabel(name){
  stack = [{seq:SEQ[name], i:0}];
  waiting = false;
  step();
}

function step(){
  while(stack.length){
    const fr = stack[stack.length-1];
    if(fr.i >= fr.seq.length){ stack.pop(); continue; }
    const n = fr.seq[fr.i++];
    if(exec(n) === "WAIT") return;
  }
}

function exec(n){
  switch(n.t){
    case "bg":   setBg(n.k); if(n.k==="bg_black") clearSprites(); return;
    case "show": setSprite(n.at, n.k); return;
    case "hide": setSprite(n.at, null); return;
    case "act": {
      const extra = n.fn();
      if(Array.isArray(extra)) stack.push({seq:extra, i:0});
      return;
    }
    case "call":  stack.push({seq:SEQ[n.label], i:0}); return;
    case "jump":  stack = [{seq:SEQ[n.label], i:0}]; return;
    case "round": {
      const picks = [];
      for(let k=0; k<n.n; k++){
        if(!V.pool.length) break;
        picks.push(V.pool.splice(Math.floor(Math.random()*V.pool.length), 1)[0]);
      }
      stack.push({seq:picks.map(p=>call(p)), i:0});
      return;
    }
    case "say":
      snapshot(n);
      backlog.push({who:n.who, text:n.text});
      renderLine(n.who, n.text);
      waiting = true;
      return "WAIT";
    case "menu":
      snapshot(n);
      showChoices(n);
      return "WAIT";
    case "end":
      showEnding(n.kind, n.name);
      return "WAIT";
  }
}

function advance(){
  clearTimeout(autoTimer);
  if(!waiting) return;
  if(typing){ doneTyping(); return; }
  waiting = false;
  step();
}

function showChoices(n){
  skip = false;
  clearTimeout(autoTimer);
  syncControls();
  plate.classList.remove("on");
  choicesEl.innerHTML = "";
  const ask = document.createElement("div");
  ask.className = "ask";
  ask.textContent = n.ask;
  choicesEl.appendChild(ask);

  n.opts.forEach(o=>{
    const open = o.cond ? o.cond() : true;
    const b = document.createElement("button");
    b.className = "choice" + (open ? "" : " locked");
    b.type = "button";
    b.innerHTML = `${o.label}${o.req ? `<span class="req">〈${o.req}〉</span>` : ""}`;
    if(open){
      b.addEventListener("click", ev=>{
        ev.stopPropagation();
        choicesEl.classList.remove("on");
        stack.push({seq:o.then, i:0});
        step();
      });
    } else {
      b.disabled = true;
      b.setAttribute("aria-disabled","true");
    }
    choicesEl.appendChild(b);
  });
  choicesEl.classList.add("on");
}

function showEnding(kind, name){
  auto = skip = false;
  clearTimeout(autoTimer);
  syncControls();
  plate.classList.remove("on");
  hud.classList.remove("on");
  $("footer").classList.remove("on");
  $("endKind").textContent = kind;
  $("endTitle").textContent = name;
  $("endRec").innerHTML =
    `<span>체력<b>${V.hp}</b></span><span>재정<b>${V.gold}</b></span><span>평판<b>${V.fame}</b></span>` +
    `<span>이이첨<b>${V.yi}</b></span><span>강홍립<b>${V.kh}</b></span><span>김개시<b>${V.gs}</b></span>`;
  endingEl.classList.add("on");
}

/* =========================================================
   6. 시작 / 방향
   ========================================================= */
function startGame(){
  reset();
  backlog = []; snaps = [];
  auto = skip = false;
  clearTimeout(autoTimer);
  syncControls();
  $("footer").classList.add("on");
  $("logSheet").classList.remove("on");
  $("cfgSheet").classList.remove("on");
  titleEl.classList.remove("on");
  endingEl.classList.remove("on");
  choicesEl.classList.remove("on");
  clearSprites();
  curBg = null;
  hud.classList.add("on");
  paintHud();
  runLabel("prologue");
}

stage.addEventListener("click", e=>{
  if(e.target.closest("#choices") || e.target.closest(".veil") ||
     e.target.closest("#controls") || e.target.closest(".sheet")) return;
  auto = false; syncControls();
  advance();
});
document.addEventListener("keydown", e=>{
  if(e.key === " " || e.key === "Enter"){
    if(titleEl.classList.contains("on") || endingEl.classList.contains("on")) return;
    e.preventDefault(); advance();
  }
});

/* =========================================================
   전체화면 + 가로 잠금

   브라우저는 '사용자가 직접 누른 동작' 안에서만 전체화면을 허용한다.
   그래서 requestFullscreen 은 클릭 핸들러에서 동기로 호출해야 하고,
   await 를 먼저 걸면 제스처가 끊겨 거부되는 브라우저가 있다.

   iOS(아이폰/아이패드)는 사파리·크롬·삼성인터넷 모두 사파리 엔진을 쓰는데
   요소 전체화면 API 자체가 없다. 이 경우 '홈 화면에 추가'로 안내한다.
   ========================================================= */
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) ||
               (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const STANDALONE = window.navigator.standalone === true ||
                   window.matchMedia("(display-mode: standalone)").matches;

function fsAvailable(){
  const el = document.documentElement;
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}
function isFullscreen(){
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function lockLandscape(){
  try{
    if(screen.orientation && screen.orientation.lock){
      const r = screen.orientation.lock("landscape");
      if(r && r.catch) r.catch(()=>{});
    }
  }catch(e){}
}

function goFullscreen(){
  if(STANDALONE){ lockLandscape(); return; }
  if(isFullscreen()){ lockLandscape(); return; }

  if(!fsAvailable()){
    hint(IS_IOS
      ? "아이폰은 전체화면을 지원하지 않습니다. 공유 → 홈 화면에 추가로 열어주세요."
      : "이 브라우저는 전체화면을 지원하지 않습니다.");
    return;
  }

  const el = document.documentElement;
  let p;
  try{
    p = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen();
  }catch(err){
    hint("전체화면 실패: " + (err && err.name ? err.name : "알 수 없음"));
    return;
  }
  if(p && p.then){
    p.then(lockLandscape)
     .catch(err => hint("전체화면 거부됨: " + (err && err.name ? err.name : "알 수 없음")));
  } else {
    lockLandscape();
  }
}

function exitFullscreen(){
  try{
    if(document.exitFullscreen) document.exitFullscreen();
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
  }catch(e){}
}

function syncFullBtn(){
  const b = $("cFull");
  if(!b) return;
  if(STANDALONE){ b.hidden = true; return; }
  b.textContent = isFullscreen() ? "창 모드" : "전체화면";
  b.setAttribute("aria-pressed", isFullscreen() ? "true" : "false");
}
document.addEventListener("fullscreenchange", syncFullBtn);
document.addEventListener("webkitfullscreenchange", syncFullBtn);

$("cFull").addEventListener("click", ()=>{
  if(isFullscreen()) exitFullscreen();
  else goFullscreen();
});

/* 시작 버튼 — 제스처가 살아 있는 동안 동기로 요청한다 */
$("startBtn").addEventListener("click", ()=>{ goFullscreen(); startGame(); });
$("againBtn").addEventListener("click", startGame);

/* =========================================================
   7. 하단 컨트롤 — 되감기 / 기록 / 자동 / 스킵 / 설정
   ========================================================= */
const cBack=$("cBack"), cLog=$("cLog"), cAuto=$("cAuto"), cSkip=$("cSkip"), cCfg=$("cCfg");
const logSheet=$("logSheet"), cfgSheet=$("cfgSheet");

function syncControls(){
  cAuto.setAttribute("aria-pressed", auto ? "true" : "false");
  cSkip.setAttribute("aria-pressed", skip ? "true" : "false");
  cBack.disabled = snaps.length < 2;
}

cBack.addEventListener("click", goBack);

cAuto.addEventListener("click", ()=>{
  auto = !auto;
  if(auto) skip = false;
  syncControls();
  if(auto && waiting && !typing) scheduleAuto();
  else clearTimeout(autoTimer);
});

cSkip.addEventListener("click", ()=>{
  skip = !skip;
  if(skip) auto = false;
  syncControls();
  if(skip){
    if(typing) doneTyping();
    else if(waiting) scheduleAuto();
  } else clearTimeout(autoTimer);
});

/* ---- 기록 ---- */
function openLog(){
  const body = $("logBody");
  if(!backlog.length){
    body.innerHTML = '<p class="log-empty">아직 지나온 대사가 없습니다.</p>';
  } else {
    body.innerHTML = backlog.map(r =>
      r.who
        ? `<div class="log-row"><b style="color:${WHO[r.who].color}">${WHO[r.who].name}</b><span>${esc(r.text)}</span></div>`
        : `<div class="log-row nar"><b></b><span>${esc(r.text)}</span></div>`
    ).join("");
  }
  logSheet.classList.add("on");
  body.scrollTop = body.scrollHeight;
}
function esc(t){
  return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
cLog.addEventListener("click", ()=>{ auto = skip = false; clearTimeout(autoTimer); syncControls(); openLog(); });
$("logClose").addEventListener("click", ()=> logSheet.classList.remove("on"));

/* ---- 설정 ---- */
const optCps=$("optCps"), optAuto=$("optAuto"), outCps=$("outCps"), outAuto=$("outAuto");

function paintCfg(){
  optCps.value = cfg.cps;
  optAuto.value = cfg.autoWait;
  outCps.textContent = cfg.cps === 0 ? "즉시" : cfg.cps + "자/초";
  outAuto.textContent = (cfg.autoWait / 1000).toFixed(1) + "초";
}
function saveCfg(){
  try{ localStorage.setItem("ifjoseon.cfg", JSON.stringify(cfg)); }catch(e){}
}
try{
  const raw = localStorage.getItem("ifjoseon.cfg");
  if(raw){
    const o = JSON.parse(raw);
    if(typeof o.cps === "number") cfg.cps = o.cps;
    if(typeof o.autoWait === "number") cfg.autoWait = o.autoWait;
  }
}catch(e){}

optCps.addEventListener("input", ()=>{ cfg.cps = +optCps.value; paintCfg(); saveCfg(); });
optAuto.addEventListener("input", ()=>{ cfg.autoWait = +optAuto.value; paintCfg(); saveCfg(); });
cCfg.addEventListener("click", ()=>{ auto = skip = false; clearTimeout(autoTimer); syncControls(); paintCfg(); cfgSheet.classList.add("on"); });
$("cfgClose").addEventListener("click", ()=> cfgSheet.classList.remove("on"));

/* ---- 키보드 ---- */
document.addEventListener("keydown", e=>{
  if(titleEl.classList.contains("on") || endingEl.classList.contains("on")) return;
  if(e.key === "Escape"){
    logSheet.classList.remove("on");
    cfgSheet.classList.remove("on");
  } else if(e.key === "Control"){
    if(!skip){ skip = true; auto = false; syncControls(); if(typing) doneTyping(); else if(waiting) scheduleAuto(); }
  } else if(e.key === "PageUp" || e.key === "Backspace"){
    e.preventDefault(); goBack();
  }
});
document.addEventListener("keyup", e=>{
  if(e.key === "Control"){ skip = false; clearTimeout(autoTimer); syncControls(); }
});

/* 세로 차단 — 실제 회전 잠금은 안드로이드 전체화면에서만 가능하다 */
const rotateEl = $("rotate");
function checkOrient(){
  const portrait = window.innerHeight > window.innerWidth;
  rotateEl.classList.toggle("on", portrait);
}
window.addEventListener("resize", checkOrient);
window.addEventListener("orientationchange", checkOrient);

$("fsBtn").addEventListener("click", async ()=>{
  await goFullscreen();
  checkOrient();
});

/* 로고 */
$("logo").src = ART.title || "";

buildHud();
reset();
paintHud();
paintCfg();
syncControls();
syncFullBtn();
if(!fsAvailable() && !STANDALONE) $("iosTip").hidden = false;
checkOrient();

/* 재배포 시 진행 상태 유지 */
if(window.claude && window.claude.hot){
  window.claude.hot.snapshot(()=>({V, stackLen:stack.length}));
}
