(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const STORE_KEY = 'contractDocFit.vendor.v1';

  const state = {
    contractType:'service', businessType:'individual', customRate:false,
    pledge:{}, conflict:Array(8).fill(null), safety:Array(10).fill(null), hazard:Array(4).fill(null), hazardAnswers:[],
    signatures:{representative:null, inspector:null, contractor:null}, sealObjectUrl:null,
    activeSignSlot:null, previewDocs:[], pendingAfterSign:null, pledgeOpenGroup:'basic'
  };

  const rates={construction:'0.5/1000', goods:'0.8/1000', service:'1.3/1000'};
  const typeNames={construction:'공사',goods:'물품',service:'용역'};
  const conflictQuestions=[
    '발주기관의 소속 고위공직자, 배우자, 고위공직자의 직계존속·비속 또는 생계를 같이하는 배우자의 직계존속·비속에 해당하는가?',
    '계약 업무를 법령상·사실상 담당하는 공직자, 배우자, 공직자의 직계존속·비속 또는 생계를 같이하는 배우자의 직계존속·비속에 해당하는가?',
    '발주기관(산하기관)의 감독기관 소속 고위공직자, 배우자, 고위공직자의 직계존속·비속 또는 생계를 같이하는 배우자의 직계존속·비속에 해당하는가?',
    '발주기관(자회사)의 모회사 소속 고위공직자, 배우자, 고위공직자의 직계존속·비속 또는 생계를 같이하는 배우자의 직계존속·비속에 해당하는가?',
    '상임위원회 위원의 국회의원, 배우자, 국회의원의 직계존속·비속 또는 생계를 같이하는 배우자의 직계존속·비속에 해당하는가?',
    '공공기관을 감사 또는 조사하는 지방의회의 의원, 배우자, 의원의 직계존속·비속 또는 생계를 같이하는 배우자의 직계존속·비속에 해당하는가?',
    '①부터 ⑥까지 어느 하나에 해당하는 사람이 대표자인 법인 또는 단체에 해당하는가?',
    '①부터 ⑥까지 어느 하나에 해당하는 사람과 특수한 관계의 사업자에 해당하는가?'
  ];
  const conflictSummaries=[
    '발주기관 소속 고위공직자·가족 등에 해당하나요?',
    '계약 업무 담당 공직자·가족 등에 해당하나요?',
    '감독기관 소속 고위공직자·가족 등에 해당하나요?',
    '모회사 소속 고위공직자·가족 등에 해당하나요?',
    '상임위원회 국회의원·가족 등에 해당하나요?',
    '감사·조사 지방의회의원·가족 등에 해당하나요?',
    '①~⑥ 해당자가 대표자인 법인·단체인가요?',
    '①~⑥ 해당자와 특수관계인 사업자인가요?'
  ];
  const safetyQuestions=[
    "학교(기관)는 과업지시서 또는 계약서에 '안전관리 및 예방조치 후 작업' 실시 내용을 포함하였습니까? (계약서가 없는 경우 본 체크리스트로 갈음)",
    '학교(기관)는 공사(용역)업체 사업주(대표자)가 안전보건교육을 실시하였는지 확인하였습니까? (고용노동부·안전보건공단 주관 사업주 교육, 1년 이내 2시간 이상 교육 이수증 확인)',
    '학교(기관)는 공사(용역)업체가 근로자에 대한 정기 또는 특별안전보건교육을 실시하였는지 확인하였습니까? (반기별 12시간 이상, 공사 시 건설업 기초안전보건교육 등)',
    '학교(기관)는 공사(용역)업체에 안전보호구(안전모, 안전대, 안전화 등)를 지급·착용하고 작업하도록 주지시켰습니까?',
    '학교(기관)는 공사(용역)업체에 학교(기관)의 현장으로 이동할 때나 현장 이외 장소 이동 시 학교(기관)의 안내를 받도록 주지시켰습니까?',
    '학교(기관)는 공사(용역)기관으로부터 과업에 따라 발생 가능한 재해 예방 체크리스트를 제출받았습니까?',
    '학교(기관)는 공사(용역)업체와 과업 수행 중 예상되는 유해·위험요인에 대해 협의하고 대책을 수립하였습니까? (안전보건관리 활동계획서, 위험성평가 등)',
    '건설공사의 경우 학교에서의 ‘기술지도 계약’과 업체에서의 ‘산업안전보건관리비 계상’에 대한 안내를 하였습니까? (기술지도: 공사금액 1억~120억 미만, 산업안전보건관리비: 2,000만원 이상)',
    '학교(기관)에서 산업재해가 발생할 경우 해당기관(고용노동부 등)과 학교(기관)에 즉시 보고할 것을 안내하였습니까?',
    '학교(기관)는 과업 수행 중에 추가로 발견되는 유해·위험요인에 대해 학교(기관)와 예방대책에 대해 협의하도록 안내하였습니까?'
  ];
  const safetySummaries=[
    '계약서·과업지시서에 안전관리 및 예방조치 내용이 있나요?',
    '업체 사업주의 안전보건교육 이수를 확인했나요?',
    '근로자 정기·특별 안전보건교육을 확인했나요?',
    '안전보호구 지급·착용을 안내했나요?',
    '현장 이동 시 기관의 안내를 받도록 안내했나요?',
    '필요한 재해 예방 체크리스트를 제출받았나요?',
    '유해·위험요인을 협의하고 예방대책을 수립했나요?',
    '건설공사 기술지도·산업안전보건관리비를 안내했나요?',
    '산업재해 발생 시 즉시 보고하도록 안내했나요?',
    '추가 유해·위험요인 발견 시 예방대책을 협의하도록 안내했나요?'
  ];
  const hazards=['추락재해 예방 체크리스트','감전재해 예방 체크리스트','밀폐공간 질식재해예방 체크리스트','일반 산업재해 예방 체크리스트'];
  const hazardForms=[
    {title:'추락재해 예방 체크리스트', subtitle:'[추락위험이 있는 작업을 할 경우 공사업체에서 작성하여 제출]', questions:[
      '개인보호구(안전모, 안전화, 안전대 등)를 지급하고 작업자에게 착용시켜 작업을 실시하겠습니다.',
      '추락위험이 있는 장소의 작업일 경우 2인 1조로 작업을 실시하겠습니다.',
      '추락재해 위험 관련 안전성을 사전에 충분히 검토한 후 작업을 실시하겠습니다. (특히 지붕공사, 작업구간 개구부, 이동식비계 및 사다리 사용 시 충분한 검토 필요) ※ 시스템 비계는 안전보건공단 클린사업장 지원사업을 통해 지원 가능',
      '추락 위험이 있는 장소에는 작업발판 또는 안전대 걸이 시설을 설치하고 작업을 실시하겠습니다.',
      '로프 작업 시 안전조치를 취하고 작업을 실시하겠습니다. (로프 설치 시 2점 고정, 안전벨트 및 추락방지대 착용)',
      '차량탑재형 고소작업대(스카이) 사용 시 안전조치를 취하고 작업을 실시하겠습니다. (안전검사, 안전대 걸이, 아웃트리거 설치, 신호수 배치 확인)',
      '작업 전 사전조사 및 작업계획서를 작성하고 작업하겠습니다. ※ 산업안전보건기준에 관한 규칙 제38조(사전조사 및 작업계획서의 작성 등)',
      '고소작업 등 추락사고 예방을 위한 사전작업 허가제에 따라 위험공종 안전 실명제 표지판의 설치를 실시하겠습니다. ※ 2m 이상 고소작업, 1.5m 이상 굴착·가설공사, 철골 구조물 공사, 2m 이상 외부도장 공사, 승강기 설치공사는 위험작업 전 공사감독자에게 작업계획 제출·검토·확인 필요'
    ], note:'※ A/S 등 1회성 작업인 경우에도 반드시 체크리스트 작성'},
    {title:'전기공사 감전재해 예방 체크리스트', subtitle:'[ 감전위험이 있는 작업을 할 경우 공사(용역)업체에서 작성하여 제출 ]', questions:[
      '전로의 설치·해체·정비 등의 감전위험이 있는 작업에서는 작업자의 자격을 확인하겠습니다.',
      '감전 위험이 있는 작업을 하는 경우 작업에 적합한 개인보호구(절연장갑, 절연복 등)를 지급하고 착용하도록 하겠습니다.',
      '임시 수전설비 주변은 관계 작업자가 아닌 사람의 출입을 금지하고, 위험표지 등을 설치하고 작업하겠습니다.',
      '작업을 시작하기 전에 모든 작업자에게 LOTO 작업절차를 공지하고 교육을 실시하겠습니다.',
      '가설 분전반 및 전원에는 누전차단기 및 접지를 설치하고 작동여부를 점검하고 작업하겠습니다.',
      '작업별 안전수칙을 준수하여 작업을 하도록 하겠습니다. (위험요인 확인·제거, 절차 준수, 안전시설 설치 등)',
      '근로자에 대하여 산업안전보건법에 따른 특별교육을 실시하고 작업하겠습니다. (전압이 75볼트 이상인 정전 및 활선작업 등) ※ 일용근로자 2시간 이상, 이외 근로자 16시간 이상, 단기간 또는 간헐적 작업인 경우 2시간 이상',
      '작업 전 사전조사 및 작업계획서를 작성하고 작업하겠습니다. ※ 산업안전보건기준에 관한 규칙 제38조, 제318조~제324조에 관한 사항'
    ], note:'※ A/S 등 1회성 작업인 경우에도 반드시 체크리스트 작성'},
    {title:'밀폐공간 질식재해예방 체크리스트', subtitle:'[ 작업 중 산업재해 우려가 있는 작업을 할 경우 공사(용역)업체에서 작성하여 제출 ]', questions:[
      '밀폐공간 작업 시 관계자외 출입금지조치 및 경고표지를 보기 쉬운 장소에 게시하고 작업하겠습니다. (밀폐공간 안전작업허가서 포함) ※ 밀폐공간에 관계자외 출입금지조치가 안 된 경우 학교에 안내',
      '밀폐공간 내 작업 시 밀폐공간 보건작업 프로그램을 수립하고 작업하겠습니다. ※ 밀폐공간의 위치, 유해위험요인 파악, 사전확인절차, 교육 및 훈련, 기타 건강장해 예방사항 포함',
      '밀폐공간 작업 전에 작업정보, 작업자정보, 농도측정 및 조치, 노출·유입·발생가능성 검토 및 조치, 보호구, 비상연락체계 등 사전확인사항을 파악하고 작업하겠습니다.',
      '밀폐공간 작업 전·중 지속적으로 환기팬(송풍기)을 가동하고 작업하겠습니다.',
      '작업 시 밀폐공간 외부에 감시인 배치 및 연락가능설비를 구비하고 작업하겠습니다.',
      '근로자에 대하여 산업안전보건법에 따른 특별교육을 실시하고 작업하겠습니다. (교육내용에 응급조치 포함) ※ 일용근로자 2시간 이상, 이외 근로자 16시간 이상, 단기간 또는 간헐적 작업인 경우 2시간 이상',
      '작업 전·중에 산소 및 유해가스농도를 측정하고 작업하겠습니다.',
      '밀폐공간 작업에 필요한 주요 장비를 사용 또는 비치하고 작업하겠습니다. ※ 산소 및 유해가스 농도 측정기, 환기팬(송풍기), 송기마스크, 공기호흡기 등',
      '비상시 구조용 기구를 비치하고 작업하겠습니다. ※ 사다리, 섬유로프, 공기호흡기, 송기마스크 등',
      '관리자(작업지휘자)에게 밀폐공간 작업 시 직무를 정확히 알리고 작업하겠습니다.',
      '밀폐공간 작업에 필요한 안전보건시설의 설치 및 안전보건규칙에서 정하는 내용에 대해서는 학교(기관)과 협의하고 작업하겠습니다.'
    ], note:'※ A/S 등 1회성 작업인 경우에도 반드시 체크리스트 작성\n※ 공기측정기, 환기팬(송풍기), 공기호흡기 무상대여·구입비용 지원은 가까운 한국산업안전보건공단에 문의'},
    {title:'일반 산업재해 예방 체크리스트', subtitle:'[ 작업 중 산업재해 우려가 있는 작업을 할 경우 공사(용역)업체에서 작성하여 제출 ]', questions:[
      '작업에 필요한 개인보호구(안전모, 안전화, 안전대, 절연장갑 등)를 작업자에게 지급 및 착용하고 작업을 하겠습니다.',
      '작업에 필요한 안전수칙을 준수하여 작업을 하겠습니다.',
      '근로자에 대하여 산업안전보건법에 따른 정기(채용 시) 또는 특별교육을 실시하고 작업하겠습니다. ※ 정기(채용 시)교육 및 특별교육은 해당 기준에 따라 실시',
      '사전조사 및 작업계획서 작성에 해당하는 작업의 경우 해당 조사와 작업계획서를 작성하고 작업하겠습니다. (중량물의 취급작업 등) ※ 산업안전보건기준에 관한 규칙 제38조',
      '가시설물, 공구·도구, 기계·기구를 사용하는 경우에는 작업시작 전 점검과 방호장치를 부착하고 사용하도록 하겠습니다.',
      '보행자의 사고를 예방하기 위하여 보행자와의 통로를 구분하여 작업을 하겠습니다.',
      '작업 중 작업자의 통로 확보 등 현장에서의 정리정돈을 실시하고 작업을 하겠습니다.',
      '전도방지장치를 설치한 사다리를 사용하며, 작업 시에는 2인 1조 작업을 실시하겠습니다.',
      '추락재해 예방을 위한 안전성을 사전에 검토한 후 작업을 하겠습니다. (난간보다 높은 곳에서의 사다리 작업, 개구부 작업, 안전난간이 없는 단부 작업 등)',
      '낙하물이 떨어질 수 있는 공간에는 근로자·보행자의 출입금지 등 안전조치를 취하고 작업하겠습니다.',
      '낙하물이 떨어져 사고가 발생할 우려가 있는 장소에는 낙하물방지망을 설치하고 작업하겠습니다.',
      '용접 등 화기작업 시에는 소화기를 비치하는 등 화재예방을 위한 조치를 취하고 작업하겠습니다.',
      '습윤한 장소의 이동전선 및 부속 접속기구는 충분한 절연효과가 있는 것을 사용하겠습니다.',
      '이동전선을 통로 바닥에 설치하지 않으며, 바닥에 설치할 경우 절연피복이 파손되지 않도록 조치하고 작업하겠습니다.',
      '전기 기계·기구를 사용하는 경우에는 절연피복의 상태, 누전차단기, 접지 상태를 확인하고 작업하겠습니다.',
      '도시가스배관이 설치된 건축물을 증축·개축·대수선·철거하는 경우 도시가스사업자에게 통지 및 안전조치에 대하여 협의하겠습니다. ※ 도시가스사업법 제28조의3',
      '굴착공사를 하는 경우 EOCS(굴착공사정보지원시스템)을 활용하여 도시가스사업자에게 해당 토지 지하에 도시가스배관이 묻혀 있는지 확인하여 줄 것을 요청하겠습니다. ※ 도시가스사업법 제30조의3'
    ], note:'※ A/S 등 1회성 작업인 경우에도 반드시 체크리스트 작성'}
  ];
  state.hazardAnswers=hazardForms.map(f=>Array(f.questions.length).fill(null));

  const pledgeItems=[
    {id:'general',num:'1',title:'계약일반조건',text:'상기 본인(법인)은 「지방자치단체 입찰 및 계약 집행기준」 제9장 계약 일반조건을 준수합니다.',choices:['yes','no']},
    {id:'private',num:'2',title:'수의계약 각서',text:'귀 기관과 수의계약을 체결함에 있어서 [붙임1] 수의계약 배제사유 중 어느 사유에도 해당되지 않으며 차후에 이러한 사실이 발견된 경우 계약의 해제·해지 및 부정당업자 제재 처분을 받아도 하등의 이유를 제기하지 않겠습니다. [붙임1] 수의계약 배제사유 1부',choices:['yes','no','na']},
    {id:'guarantee',num:'4',title:'계약보증금',text:'계약서의 의무를 이행하지 못하여 계약보증금을 귀 기관에 귀속시켜야 할 사유가 발생하면 「지방자치단체를 당사자로 하는 계약에 관한 법률」 제15조제3항에 따라 즉시 해당하는 금액을 현금으로 납부하겠습니다.',choices:['yes','no'],extra:['각서','보증서']},
    {id:'integrity',num:'5',title:'청렴계약 이행 서약서',text:'임직원과 대리인은 발주기관에서 시행하는 공사·용역·물품 등의 입찰·낙찰, 계약체결, 「지방자치단체를 당사자로 하는 계약에 관한 법률」 제16조에 따른 감독, 제17조에 따른 검사 또는 계약이행 등의 과정(준공, 납품 이후를 포함한다)에 참여하면서 직접 또는 간접적인 사례, 증여, 금품·향응 등(친인척 등에 대한 부정한 취업 제공 포함)을 제공 또는 약속하거나 수수하지 않을 것이며, 불공정한 행위를 하지 않을 것이며, 알선·청탁을 통하여 입찰 또는 계약과 관련된 특정 정보의 제공을 요구하거나 받는 행위를 하지 않겠습니다.',choices:['yes','no']},
    {id:'tax',num:'6',title:'조세포탈 여부 확인 서약서',text:'「지방자치단체를 당사자로 하는 계약에 관한 법률」 제31조의5에 따른 조세포탈 등을 한 자가 아님을 서약하며, 조세포탈 등을 한 자에 해당하여 유죄판결이 확정된 날부터 2년이 지나지 않은 사실이 발견된 때에는 계약 해제ㆍ해지를 감수하겠으며, 「지방계약법 시행령」 제93조에 따라 부정당업자의 입찰참가자격 제한 처분을 받겠습니다.',choices:['yes','no']},
    {id:'defect',num:'7',title:'하자보수보증금',text:'「지방자치단체를 당사자로 하는 계약에 관한 법률 시행령」 제71조에 따라 하자보수보증금을 귀 학교(기관)에 귀속시켜야 할 사유가 발생하면 즉시 해당하는 금액을 현금으로 납부하겠습니다.',choices:['yes','no'],extra:['각서','보증서']},
    {id:'utility',num:'8',title:'[공사] 전기·수도 사용료 납부 확인',text:'우리 업체는 공사용 임시 전기·수도를 설치하여 사용할 수 없으므로 학교(기관)의 전기 및 수도를 사용 후 대한건설협회 ‘완성공사원가분석’ 경비율에 의한 계산식으로 전기료 및 수도료를 학교회계(교육비특별회계)에 세입조치하고 이의를 제기하지 않겠습니다..',choices:['yes','no','na']},
    {id:'safety',num:'9',title:'안전 및 보건 확보 의무 준수',text:'「산업안전보건법」 및 「중대재해 처벌 등에 관한 법률」 등 관련 법규에 따라 사업장에서 종사자의 안전·보건상 유해 요인 또는 위험을 방지하기 위하여 다음과 같이 의무사항을 이행하겠습니다. [안전 및 보건 확보 의무사항] ① “과업 수행자”는 계약을 수행함에 있어 종사자의 안전을 확보하기 위해 안전ㆍ보건 관계법령 및 중대재해처벌법상 의무사항을 빠짐없이 이행하고 만약 의무사항을 이행하지 않아 중대산업재해가 발생할 경우 그에 따라 발생하는 법적 처벌 및 서울특별시교육청의 불이익 조치에 대해 이의를 제기하지 않는다. ② “과업 수행자”는 종사자로부터 유해·위험요인에 대한 신고가 접수될 경우 보수·보강 등 개선 작업을 신속하게 조치하고 서울특별시교육청 및 관계행정기관의 이행 명령에 따른 개선사항을 성실히 이행한다. ③ 사업수행에 필요한 작업, 점검 등 모든 작업을 할 때에는 철저한 안전대책을 수립한 후 작업에 임하여야 하며, 안전사고가 발생한 때에는 과업 수행자의 책임 하에 후속 조치를 취하여야 한다. ④ 중대산업재해 발생 시 선보고 후 사고처리 하여야 한다.',choices:['yes','no','na']},
    {id:'privacy',num:'10',title:'개인정보이용·수집 동의',text:'「개인정보 보호법」 제15조, 제22조에 따라 개인정보를 수집 및 이용하는 것에 동의합니다. 항목: 대표자명, 주소, 생년월일, (휴대)전화번호, 계좌번호, 이메일 / 수집ㆍ이용 목적: 계약업무 진행 / 보유ㆍ이용기간: 계약체결일로부터 5년',choices:['yes','no']}
  ];

  const pledgeSummaries={
    general:'계약 일반조건 준수 여부를 확인합니다.',
    private:'수의계약 배제사유에 해당하지 않음을 확인합니다.',
    guarantee:'계약보증금 귀속 사유 발생 시 납부 여부를 확인합니다.',
    integrity:'청렴계약 의무 준수 여부를 확인합니다.',
    tax:'조세포탈 등에 해당하지 않음을 확인합니다.',
    defect:'하자보수보증금 귀속 사유 발생 시 납부 여부를 확인합니다.',
    utility:'공사 시 학교(기관)의 전기·수도 사용료 납부 여부를 확인합니다.',
    safety:'안전·보건 확보 의무 준수 여부를 확인합니다.',
    privacy:'계약업무를 위한 개인정보 수집·이용 동의 여부를 확인합니다.'
  };

  function val(id){return ($(id.startsWith('#')?id:'#'+id)?.value || '').trim();}
  function fmtDate(v){ if(!v||!validDateInput(v)) return ''; const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/); return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일`; }
  function formatBusinessNo(v){
    const d=String(v||'').replace(/\D/g,'').slice(0,10);
    if(d.length<=3) return d;
    if(d.length<=5) return `${d.slice(0,3)}-${d.slice(3)}`;
    return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`;
  }
  function formatDateInput(v){
    const d=String(v||'').replace(/\D/g,'').slice(0,8);
    if(d.length<=4) return d;
    if(d.length<=6) return `${d.slice(0,4)}-${d.slice(4)}`;
    return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
  }
  function validDateInput(v){
    if(!v) return true;
    const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m) return false;
    const y=+m[1],mo=+m[2],d=+m[3]; if(y<1900||y>2199||mo<1||mo>12||d<1||d>31) return false;
    const dt=new Date(Date.UTC(y,mo-1,d)); return dt.getUTCFullYear()===y&&dt.getUTCMonth()===mo-1&&dt.getUTCDate()===d;
  }
  const formatBirthInput=formatDateInput;
  function printDate(v){
    if(v&&validDateInput(v)) return esc(fmtDate(v));
    return '<span class="manual-date"><span class="date-slot year"></span>년 <span class="date-slot month"></span>월 <span class="date-slot day"></span>일</span>';
  }
  function box(choice,current,label){return `<span class="boxmark">${current===choice?'☑':'☐'} ${label}</span>`;}
  function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);}

  function suggestRecipient(name){
    name=(name||'').trim(); if(!name) return '';
    if(name.endsWith('교육지원청')) return name+'교육장 귀하';
    if(name.endsWith('교육청')) return name.slice(0,-3)+'교육감 귀하';
    if(name.endsWith('학교')) return name+'장 귀하';
    return '';
  }
  function maybeSuggestRecipient(force=false){
    const inst=val('institution'), rec=$('#recipient');
    if(force || !rec.dataset.userEdited || !rec.value.trim()){
      const s=suggestRecipient(inst); if(s){rec.value=s;rec.dataset.userEdited='';$('#recipientHint').textContent=`추천: ${s}`;} else if(force){rec.value='';$('#recipientHint').textContent='기관 직명에 맞게 수신인을 직접 입력해 주세요.';}
    }
  }

  function setContractType(type){
    state.contractType=type; $$('#contractTypeGroup button').forEach(b=>b.classList.toggle('active',b.dataset.type===type));
    const labels={construction:['착공일','준공기한'],service:['착수일','완료기한'],goods:['계약일','납품기한']};
    $('#startDateLabel').textContent=labels[type][0]; $('#endDateLabel').textContent=labels[type][1];
    if(type==='goods') $('#startDate').closest('.field').style.display='none'; else $('#startDate').closest('.field').style.display='flex';
    $('#defectField').style.display=type==='goods'?'none':'flex';
    $('#defectConfirmField').style.display=type==='goods'?'none':'flex';
    $('#defectWarning').style.display=type==='goods'?'none':'flex';
    if(!state.customRate) $('#delayRateDisplay').textContent=rates[type];
    $('#delayRateInfo').textContent=`${typeNames[type]} 지연배상금률 기본값은 ${rates[type]}로 설정됩니다.`;
    if(type==='construction') {
      // 공사에서는 전기·수도 사용료 납부 확인을 업체가 직접 판단해야 하므로 기본값을 두지 않습니다.
      if(state.pledge.utility==='na') delete state.pledge.utility;
    } else {
      state.pledge.utility='na';
    }
    const pill=$('#safetyRecommendPill'); if(pill){pill.textContent=type==='goods'?'선택':'추천'; pill.className='pill '+(type==='goods'?'gray':'blue');}
    const safetyCard=$('#safetyCard'); if(safetyCard)safetyCard.classList.toggle('recommended',type!=='goods');
    // 계약종류별 업체 제출 기본 서류 세트
    const acceptance=$('#selectAcceptance'), pledge=$('#selectPledge'), safety=$('#selectSafety'), consent=$('#selectConsent');
    if(acceptance) acceptance.checked=true;
    if(pledge) pledge.checked=true;
    if(safety) safety.checked=type!=='goods';
    if(consent) consent.checked=true;
    if($('#selectedDocCount')) updateSelectedCount();
    updateSummaries(); renderPledgeSimple(); scheduleLivePreviews();
  }

  function setBusinessType(type, preserveUser=false){
    state.businessType=type; $$('#businessTypeGroup button').forEach(b=>b.classList.toggle('active',b.dataset.business===type));
    if(!preserveUser){
      if(type==='individual'){state.conflict[6]='na';state.conflict[7]='na'; for(let i=0;i<6;i++) if(state.conflict[i]==='na') state.conflict[i]=null;}
      else {for(let i=0;i<6;i++) state.conflict[i]='na'; for(let i=6;i<8;i++) if(state.conflict[i]==='na') state.conflict[i]=null;}
    }
    renderConflict(); updatePledgeStatus(); updateConsentUI(); saveVendorIfEnabled(); scheduleLivePreviews();
  }

  function groupStatus(ids){
    const missing=ids.filter(id=>!state.pledge[id]).length;
    if(missing===ids.length) return {text:'미작성',kind:'muted'};
    if(missing) return {text:`확인 필요 ${missing}개`,kind:'warn'};
    return {text:`${ids.length}/${ids.length} 선택 완료`,kind:'ok'};
  }
  function conflictStatus(){
    const missing=state.conflict.filter(x=>!x).length;
    if(missing===8) return {text:'미작성',kind:'muted'};
    if(missing) return {text:`확인 필요 ${missing}개`,kind:'warn'};
    return {text:'8/8 선택 완료',kind:'ok'};
  }
  function pledgeItemHTML(it){
    const current=state.pledge[it.id]||null;
    const choices=it.choices.map(c=>`<button type="button" class="choice-btn ${current===c?'active':''} ${c==='na'?'na':''}" data-pledge="${it.id}" data-choice="${c}">${c==='yes'?'예':c==='no'?'아니오':'해당없음'}</button>`).join('');
    const showExtra=it.extra&&current==='yes';
    const extra=showExtra?`<div class="extra-choice compact-extra">${it.extra.map(x=>`<button type="button" class="choice-btn ${state.pledge[it.id+'Extra']===x?'active':''}" data-pledge-extra="${it.id}" data-extra="${x}">${x}</button>`).join('')}</div>`:'';
    return `<div class="pledge-row compact-pledge-row"><div class="pledge-copy"><h4>${it.num}. ${it.title}</h4><p>${esc(pledgeSummaries[it.id]||it.title)}</p></div><div class="pledge-controls"><div class="choice-set">${choices}</div>${extra}</div></div>`;
  }
  function pledgeGroupForItem(id){
    if(['general','private','integrity','tax'].includes(id))return 'basic';
    if(['guarantee','defect'].includes(id))return 'guarantee';
    if(['utility','safety','privacy'].includes(id))return 'etc';
    return null;
  }
  function pledgeGroupDone(id){
    if(id==='conflict')return state.conflict.every(Boolean);
    const map={basic:['general','private','integrity','tax'],guarantee:['guarantee','defect'],etc:['utility','safety','privacy']};
    return (map[id]||[]).every(x=>!!state.pledge[x]);
  }
  function maybeAdvancePledge(id){
    const order=['basic','conflict','guarantee','etc'],idx=order.indexOf(id);
    if(idx>=0&&idx<order.length-1&&pledgeGroupDone(id)&&state.pledgeOpenGroup===id)state.pledgeOpenGroup=order[idx+1];
  }

  function renderPledgeSimple(){
    const root=$('#pledgeAccordion'); if(!root) return;
    const groups=[
      {id:'basic',title:'① 기본 서약',items:['general','private','integrity','tax']},
      {id:'conflict',title:'② 수의계약 체결 제한',conflict:true},
      {id:'guarantee',title:'③ 보증 관련',items:['guarantee','defect']},
      {id:'etc',title:'④ 기타 확인',items:['utility','safety','privacy']}
    ];
    const individual=state.businessType==='individual';
    const conflictGuide=individual?'개인사업자: ①~⑥을 확인하고, ⑦~⑧은 해당없음으로 표시합니다.':'법인사업자: ①~⑥은 해당없음으로 표시하고, ⑦~⑧을 확인합니다.';
    const conflictButton=individual?'①~⑥ 모두 아니오':'⑦~⑧ 모두 아니오';
    root.innerHTML=groups.map(g=>{
      const st=g.conflict?conflictStatus():groupStatus(g.items);
      const body=g.conflict
        ? `<div class="flat-group-tools"><p>${esc(conflictGuide)}</p><div><button type="button" class="btn tiny" id="conflictAllNo">${conflictButton}</button><button type="button" class="btn tiny ghost" id="conflictClear">선택 지우기</button></div></div><div class="conflict-list compact-conflict-list" id="conflictList">${conflictQuestions.map((q,i)=>{const current=state.conflict[i],auto=(individual&&i>=6)||(!individual&&i<6);return `<div class="conflict-row compact-conflict-row"><div class="conflict-num">${i+1}</div><div class="conflict-question"><h4>${esc(conflictSummaries[i]||q)}${auto?'<span class="auto-badge">추천</span>':''}</h4></div><div class="choice-set">${['yes','no','na'].map(c=>`<button type="button" class="choice-btn ${current===c?'active':''} ${c==='na'?'na':''}" data-conflict="${i}" data-choice="${c}">${c==='yes'?'예':c==='no'?'아니오':'해당없음'}</button>`).join('')}</div></div>`}).join('')}</div>`
        : g.items.map(id=>pledgeItemHTML(pledgeItems.find(x=>x.id===id))).join('');
      return `<section class="pledge-flat-group" data-pledge-group="${g.id}"><div class="pledge-flat-head"><h3>${g.title}</h3><span class="group-status"><span class="dot ${st.kind}"></span>${st.text}</span></div><div class="pledge-group-body">${body}</div></section>`;
    }).join('');
    $$('[data-pledge]',root).forEach(b=>b.onclick=()=>{const id=b.dataset.pledge,choice=b.dataset.choice;state.pledge[id]=choice;if((id==='guarantee'||id==='defect')&&choice==='yes'&&!state.pledge[id+'Extra'])state.pledge[id+'Extra']='각서';if(choice!=='yes'&&(id==='guarantee'||id==='defect'))state.pledge[id+'Extra']=null;renderPledgeSimple();updatePledgeStatus();scheduleLivePreviews();});
    $$('[data-pledge-extra]',root).forEach(b=>b.onclick=()=>{state.pledge[b.dataset.pledgeExtra+'Extra']=b.dataset.extra;renderPledgeSimple();scheduleLivePreviews();});
    $$('[data-conflict]',root).forEach(b=>b.onclick=()=>{state.conflict[+b.dataset.conflict]=b.dataset.choice;renderPledgeSimple();updatePledgeStatus();scheduleLivePreviews();});
    const allNo=$('#conflictAllNo',root); if(allNo) allNo.onclick=()=>{if(state.businessType==='individual')for(let i=0;i<6;i++)state.conflict[i]='no';else for(let i=6;i<8;i++)state.conflict[i]='no';renderPledgeSimple();updatePledgeStatus();scheduleLivePreviews();};
    const clear=$('#conflictClear',root); if(clear) clear.onclick=()=>{if(state.businessType==='individual'){for(let i=0;i<6;i++)state.conflict[i]=null;state.conflict[6]='na';state.conflict[7]='na';}else{for(let i=0;i<6;i++)state.conflict[i]='na';for(let i=6;i<8;i++)state.conflict[i]=null;}renderPledgeSimple();updatePledgeStatus();scheduleLivePreviews();};
  }
  function renderConflict(){renderPledgeSimple();}

  function renderSafety(){
    $('#safetyList').innerHTML=safetyQuestions.map((q,i)=>`<div class="safety-row"><div class="num">${i+1}</div><div><h4>${esc(safetySummaries[i]||q)}</h4></div><div class="choice-set">${['yes','no','na'].map(c=>`<button class="choice-btn ${state.safety[i]===c?'active':''} ${c==='na'?'na':''}" type="button" data-safety="${i}" data-choice="${c}">${c==='yes'?'예':c==='no'?'아니요':'해당없음'}</button>`).join('')}</div></div>`).join('');
    $$('[data-safety]').forEach(b=>b.onclick=()=>{state.safety[+b.dataset.safety]=b.dataset.choice;renderSafety();updateSafetyStatus();scheduleLivePreviews();});
    $('#hazardList').innerHTML=hazards.map((h,i)=>`<div class="hazard-item ${state.hazard[i]==='o'?'selected':''}"><span>${h}</span><div class="choice-set"><button type="button" class="choice-btn ${state.hazard[i]==='o'?'active':''}" data-hazard="${i}" data-choice="o">○</button><button type="button" class="choice-btn ${state.hazard[i]==='x'?'active':''}" data-hazard="${i}" data-choice="x">×</button></div></div>`).join('');
    $$('[data-hazard]').forEach(b=>b.onclick=()=>{
      const i=+b.dataset.hazard, beforeY=window.scrollY;
      state.hazard[i]=b.dataset.choice;
      if(state.hazard[i]!=='o')state.hazardAnswers[i]=Array(hazardForms[i].questions.length).fill(null);
      renderSafety();updateSafetyStatus();scheduleLivePreviews();
      // Re-rendering the detailed checklist must never move the main document.
      requestAnimationFrame(()=>{if(Math.abs(window.scrollY-beforeY)>2)window.scrollTo({top:beforeY,left:0,behavior:'auto'});});
    });
    $('#hazardDetailList').innerHTML=hazardForms.map((f,i)=>state.hazard[i]==='o'?`<section class="hazard-detail-card"><div class="hazard-detail-head"><div><span class="pill blue">상세 작성</span><h3>${esc(f.title)}</h3><p>${esc(f.subtitle)}</p></div><button type="button" class="btn tiny ghost hazard-detail-all-yes" data-hazard-all-yes="${i}">모두 예</button></div><div class="hazard-question-list">${f.questions.map((q,j)=>`<div class="hazard-question-row"><div class="num">${j+1}</div><div class="hazard-question-copy">${esc(q)}</div><div class="choice-set">${['yes','no','na'].map(c=>`<button type="button" class="choice-btn ${state.hazardAnswers[i][j]===c?'active':''} ${c==='na'?'na':''}" data-hazard-answer="${i}" data-q="${j}" data-choice="${c}">${c==='yes'?'예':c==='no'?'아니요':'해당없음'}</button>`).join('')}</div></div>`).join('')}</div>${f.note?`<div class="hazard-detail-note">${esc(f.note).replace(/\n/g,'<br>')}</div>`:''}</section>`:'').join('');
    $$('[data-hazard-answer]').forEach(b=>b.onclick=()=>{state.hazardAnswers[+b.dataset.hazardAnswer][+b.dataset.q]=b.dataset.choice;renderSafety();updateSafetyStatus();scheduleLivePreviews();});
    $$('[data-hazard-all-yes]').forEach(b=>b.onclick=()=>{const i=+b.dataset.hazardAllYes;state.hazardAnswers[i]=Array(hazardForms[i].questions.length).fill('yes');renderSafety();updateSafetyStatus();scheduleLivePreviews();});
  }

  function updateCompactSummaries(){
    const contractParts=[typeNames[state.contractType],val('institution'),validDateInput(val('contractDate'))?val('contractDate'):''].filter(Boolean);
    const c=$('#contractCompactSummary'); if(c)c.textContent=contractParts.length?contractParts.join(' · '):typeNames[state.contractType];
    const vendorParts=[val('vendorName'),val('representative')?`대표 ${val('representative')}`:'',val('businessNo')].filter(Boolean);
    const v=$('#vendorCompactSummary'); if(v)v.textContent=vendorParts.length?vendorParts.join(' · '):'미입력';
  }
  function updateSummaries(){
    const period=getDefectText();
    if(state.contractType==='goods'){
      $('#acceptanceSummary').textContent=`물품 · 지연배상금 ${getRate()}`;
      $('#acceptanceStatus').innerHTML='<span class="dot ok"></span>물품 승낙사항 원본 구조 적용';
    }else{
      $('#acceptanceSummary').textContent=`${typeNames[state.contractType]} · 지연배상금 ${getRate()} · 하자 ${period||'미입력'}`;
      const confirmed=$('#defectConfirmed').checked; $('#acceptanceStatus').innerHTML=confirmed?'<span class="dot ok"></span>하자기간 확인됨':'<span class="dot warn"></span>하자기간 확인 필요';
    }
    updateCompactSummaries();
  }
  function updatePledgeStatus(){
    const simpleMissing=pledgeItems.filter(x=>!state.pledge[x.id]).length;
    const conflictMissing=state.conflict.filter(x=>!x).length;
    const n=simpleMissing+conflictMissing;
    $('#pledgeStatus').innerHTML=n?`<span class="dot warn"></span>확인할 항목 ${n}개`:'<span class="dot ok"></span>선택값 확인됨';
  }
  function updateSafetyStatus(){
    const baseCount=state.safety.filter(Boolean).length+state.hazard.filter(Boolean).length; const detailTotal=state.hazard.reduce((n,v,i)=>n+(v==='o'?hazardForms[i].questions.length:0),0); const detailCount=state.hazard.reduce((n,v,i)=>n+(v==='o'?state.hazardAnswers[i].filter(Boolean).length:0),0); const count=baseCount+detailCount, total=14+detailTotal; $('#safetyStatus').innerHTML=count===0?'<span class="dot muted"></span>미작성':count<total?`<span class="dot warn"></span>일부 작성 (${count}/${total})`:'<span class="dot ok"></span>작성됨';
  }
  function getRate(){return state.customRate?(val('customRate')||rates[state.contractType]):rates[state.contractType];}
  function getDefectText(){const v=$('#defectPeriod').value;return v==='custom'?(val('customDefect')||''):v+'년';}

  function saveVendorIfEnabled(){
    if(!$('#rememberVendor').checked) return;
    const data={businessType:state.businessType,vendorName:val('vendorName'),representative:val('representative'),businessNo:val('businessNo'),phone:val('phone'),address:val('address')};
    localStorage.setItem(STORE_KEY,JSON.stringify(data));$('#saveState').textContent='업체정보 저장됨';
  }
  function loadVendor(){
    const raw=localStorage.getItem(STORE_KEY); if(!raw)return;
    try{const d=JSON.parse(raw); $('#rememberVendor').checked=true; ['vendorName','representative','businessNo','phone','address'].forEach(k=>$('#'+k).value=k==='businessNo'?formatBusinessNo(d[k]||''):(d[k]||'')); setBusinessType(d.businessType||'individual',true); $('#saveState').textContent='업체정보 저장됨';}
    catch(e){}
  }
  function deleteSavedVendor(clearFields=false){localStorage.removeItem(STORE_KEY);$('#rememberVendor').checked=false;$('#saveState').textContent='업체정보 미저장';if(clearFields){['vendorName','representative','businessNo','phone','address'].forEach(k=>$('#'+k).value='');setBusinessType('individual');}toast('저장된 업체정보를 삭제했습니다.');}

  function revokeSeal(){if(state.sealObjectUrl){URL.revokeObjectURL(state.sealObjectUrl);state.sealObjectUrl=null;}}
  function clearSignatures(){revokeSeal();state.signatures={representative:null,inspector:null,contractor:null};updateSignaturePreviews();}
  function updateSignaturePreviews(){
    ['representative'].forEach(slot=>{const root=$('#repSigPreview');const src=state.signatures[slot];if(root)root.innerHTML=src?`<img src="${src}" alt="등록된 서명">`:'<span>미등록</span>';});
  }
  function clearInspectorSignature(){state.signatures.inspector=null;}


  function newContract(){
    ['institution','recipient','contractName','contractDate','startDate','endDate','contractorManager','representativeBirth'].forEach(id=>{const el=$('#'+id);if(el)el.value='';});
    $('#recipient').dataset.userEdited=''; $('#defectPeriod').value='1';$('#customDefect').value='';$('#customDefect').classList.add('hidden');$('#defectConfirmed').checked=false;
    state.customRate=false;$('#customRate').classList.add('hidden');$('#toggleRateEdit').textContent='직접 설정';
    state.pledge={}; state.pledgeOpenGroup='basic'; state.conflict=Array(8).fill(null); state.safety=Array(10).fill(null);state.hazard=Array(4).fill(null);state.hazardAnswers=hazardForms.map(f=>Array(f.questions.length).fill(null)); clearSignatures(); setContractType('service'); setBusinessType(state.businessType); renderPledgeSimple();renderConflict();renderSafety();updateSummaries();updatePledgeStatus();updateSafetyStatus();updateConsentUI(); toast('새 계약을 시작했습니다. 저장된 업체정보는 유지됩니다.');
  }

  function choiceLabel(v,labels={yes:'예',no:'아니오',na:'해당없음'}){return v?labels[v]||v:'';}
  function sigImg(slot,cls='sig-img'){const src=state.signatures[slot];return src?`<img class="${cls}" src="${src}" alt="서명 또는 직인">`:'';}

  function acceptanceHTML(){
    const type=state.contractType, rate=esc(getRate()), defect=esc(getDefectText()||'    '), start=printDate(val('startDate')), end=printDate(val('endDate')), cdate=printDate(val('contractDate'));
    let title, paras=[];
    if(type==='construction'){
      title='승 낙 사 항 (공 사 집 행)';
      paras=[`계약사항에 의하여 ${start} 착공하고 ${end}까지 준공하여야 한다.`,`설계의 변경에 의하여 계약금액에 증감이 생긴 때에는 명세서상의 단가로 증감하고 그 단가에 의하기 어려운 때에는 설계변경 당시의 단가에 의한다.`,`기한 내에 공사를 준공하지 못한 때에는 그 지연일수 1일에 대하여 계약금액의 ${rate}에 해당하는 지연배상금을 납부하여야 하며, 납부하여야 할 금액은 계약대가에서 상계할 수 있다.`,`계약상대자는 공사 준공일로부터 ${defect}간 그 공사의 공종별 하자에 대하여 담보 책임을 진다.`,`기타 이 계약서에 명시되지 아니한 사항은 지방자치단체를 당사자로 하는 계약에 관한 법률 등의 규정을 준용한다.`];
    }else if(type==='service'){
      title='승 낙 사 항 (용 역 집 행)';
      paras=[`계약사항에 의하여 ${start} 착수하고 ${end}까지 완수하여야 한다.`,`계약의 변경으로 인하여 계약금액에 증감이 생긴 때에는 명세서상의 단가로 증감하고 그 단가에 의하기 어려운 때에는 설계변경 당시의 단가에 의한다.`,`기한 내에 용역을 준공하지 못한 때에는 그 지연일수 1일에 대하여 계약금액의 ${rate}에 해당하는 지연배상금을 납부하여야 하며, 납부하여야 할 금액은 계약대가에서 상계할 수 있다.`,`계약상대자는 용역 준공일로부터 ${defect}간 그 용역의 하자에 대하여 담보 책임을 진다.`,`기타 이 계약서에 명시되지 아니한 사항은 지방자치단체를 당사자로 하는 계약에 관한 법률 등의 규정을 준용한다.`];
    }else{
      title='승 낙 사 항 (물 품 구 입)';
      paras=[`계약사항에 의하여 ${end}까지 지정한 장소에 납품하여야 하며, 납품된 물품 중 검사에 불합격한 물품이 있을 때에는 지정기일까지 교환하여야 한다.`,`납품기한 내에 완납하지 못한 때에는 그 지연일수 1일에 대하여 납품되지 아니한 물품대가의 ${rate}에 해당하는 지연배상금을 납부하여야 한다.`,`납품기한 또는 교환기간 경과 후 10일까지 납품하지 못하는 때 또는 납품된 물품이 규격서·견본 등과 다른 때에는 그 계약을 해제할 수 있다.`,`제3호에 의하여 계약을 해제한 때에는 손해배상으로 계약이 해제된 물품대가의 100분의 5에 해당하는 금액을 납부하여야 한다.`,`제2호 및 제4호에 의하여 납부하여야 할 금액은 물품대금과 상계할 수 있다.`];
    }
    const phoneLine=type==='construction'?'':`<div class="line"><span>전 화 번 호</span><span>:</span><span>${esc(val('phone'))}</span></div>`;
    return `<section class="print-document acceptance"><h1>${title}</h1><div class="doc-paragraphs">${paras.map((p,i)=>`<div class="doc-paragraph"><span class="n">${i+1})</span><div>${p}</div></div>`).join('')}</div><div class="doc-date">${cdate}</div><div class="party-info"><div class="line"><span>계 약 명</span><span>:</span><span>${esc(val('contractName'))}</span></div><div class="line"><span>상호 또는 법인명칭</span><span>:</span><span>${esc(val('vendorName'))}</span></div><div class="line"><span>법인(사업자)등록번호</span><span>:</span><span>${esc(val('businessNo'))}</span></div>${phoneLine}<div class="line"><span>주 소</span><span>:</span><span>${esc(val('address'))}</span></div><div class="line"><span>대 표 자</span><span>:</span><span>${esc(val('representative'))} ${sigImg('representative')}</span></div></div></section>`;
  }

  function pledgeChoice(it){return state.pledge[it.id]||null;}
  function pledgeHTML(){
    const conflictHtml=conflictQuestions.map((q,i)=>`<div class="conflict-sub"><strong>${i+1}.</strong> ${esc(q)}<br>${box('yes',state.conflict[i],'예')}${box('no',state.conflict[i],'아니오')}${box('na',state.conflict[i],'해당없음')}</div>`).join('');
    const rows=pledgeItems.map(it=>{
      const c=pledgeChoice(it); let choices=it.choices.length===3?`${box('yes',c,'예')}${box('no',c,'아니오')}<br>${box('na',c,'해당없음')}`:it.choices.map(x=>box(x,c,x==='yes'?'예':x==='no'?'아니오':'해당없음')).join('');
      if(it.extra){const ex=state.pledge[it.id+'Extra'];choices+=`<br>${box(it.extra[0],ex,it.extra[0])}${box(it.extra[1],ex,it.extra[1])}`;}
      return `<tr><td class="num">${it.num}</td><td class="cat">${esc(it.title)}</td><td>${esc(it.text)}</td><td class="choices">${choices}</td></tr>`;
    });
    rows.splice(2,0,`<tr><td class="num">3</td><td class="cat">수의계약<br>체결 제한<br>여부 확인서</td><td>${conflictHtml}<div>「공직자의 이해충돌 방지법」 제12조에 따른 수의계약 체결 제한에 대하여 위와 같이 확인합니다. 만약 위 사항이 사실과 다른 경우에는 어떠한 처벌이나 불이익도 감수할 것을 서약합니다.</div></td><td class="choices">사업자 유형<br><strong>${state.businessType==='individual'?'개인사업자':'법인사업자'}</strong></td></tr>`);
    rows.push(`<tr><td class="num">11</td><td class="cat">기타 사항</td><td colspan="2">① 법령, 예규 등 각종 규정은 개정될 수 있으며 최신 규정을 따름<br>② 변경 계약 시 변경 사항을 따르되, 계약이행 통합 서약서는 기존 서약서로 갈음할 수 있음</td></tr>`);
    const appendix=[
      {n:'1.',main:'견적서 제출 마감일 현재 부도 · 파산 · 해산 · 영업정지 등이 확정된 경우',note:'다만 법원의 회생절차개시결정이 있는 경우 수의계약 체결 가능'},
      {n:'2.',main:'입찰참가자격 제한기간 중에 있는 자',note:'법 제31조 제5항에 해당되는 경우 예외'},
      {n:'3.',main:'견적서 제출 마감일을 기준으로 법 제31조 또는 다른 법령에 따라 부실이행, 담합행위, 입찰 · 계약 서류의 허위·위조 제출, 입찰 · 낙찰 · 계약이행 관련 뇌물 제공으로 부정당업자 제재 처분을 받고 그 종료일로부터 3개월이 지나지 아니한 자',note:'법 제31조 제5항에 해당되는 경우 예외'},
      {n:'4.',main:'공사 또는 기술용역의 경우 기술자 보유현황이 관련법령에 따른 업종등록 기준에 미달하는 자',note:'기술자 보유현황의 심사는 「낙찰자결정기준」 제1장 입찰참가자격 사전심사기준 제5절 “4”의 그밖에 해당공사 수행능력상 결격여부, 제2장의2 기술·학술연구 용역 적격심사 세부기준 <별표>의 기술인력 평가방법을 준용한다. 이때 ‘입찰공고일’은 ‘안내공고일’로, ‘적격심사서류 제출마감일’은 ‘견적서 제출마감일’로 본다.'},
      {n:'5.',main:'견적서 제출 마감일 기준 최근 3개월 이내에 해당 지방자치단체의 입찰 · 계약 및 그 이행과 관련하여 10일 이상 지연배상금 부과, 정당한 이행명령 거부, 불법하도급, 5회 이상 하자보수 또는 물의를 일으키는 등 신용이 떨어져 계약 체결이 곤란하다고 판단되는 자'},
      {n:'6.',main:'견적서 제출 마감일 기준 최근 3개월 이내에 해당 지방자치단체와의 계약 및 그 이행과 관련하여 정당한 이유 없이 계약에 응하지 아니하거나 포기서를 제출한 사실이 있는 자',note:'정당한 이유 없이 계약을 체결하지 아니하는 경우는 법 제31조에 따른 입찰참가자격 제한에는 해당되지 아니하나 수의계약 배제사유에 해당됨.'},
      {n:'7.',main:'수의계약 체결일 현재 법 제33조에 해당하는 자',subs:['지방자치단체의 장 또는 지방의회의원의 배우자인 사업자(법인은 대표자)','지방자치단체의 장 또는 지방의회의원(배우자 포함)의 직계 존·비속인 사업자','지방자치단체의 장 또는 지방의회의원이 자본금 총액의 50% 이상을 소유한 자','지방자치단체의 장 또는 지방의회의원 가족(배우자, 직계존·비속)의 합산금액이 자본금 총액의 50% 이상을 소유한 사업자','지방자치단체의 장 또는 지방의회의원 소유업체의 계열회사 등']},
      {n:'8.',main:'발주기관이 제한한 자격요건 등을 충족하지 아니한 자'},
      {n:'9.',main:'그밖에 계약담당자가 계약이행능력이 없다고 판단되는 명백한 증거가 있는 자'},
      {n:'10.',main:'「재난 및 안전관리 기본법」 제60조에 따라 특별재난지역으로 선포된 지역의 재난복구공사(용역)의 경우 결격여부 심사일 현재 계약금액 5천만 원 이상 해당 업종 관급공사 또는 계약금액 2천만 원 이상 관급용역이 3건(일시 정지 중인 계약은 제외) 이상인 자',note:'다만 동시에 여러 건의 수의계약 체결 예정자로 선정된 경우에는 기존 계약을 포함하여 3건까지 수의계약을 체결할 수 있다. (단, 제3절의 “1”에 따른 2인 이상 견적서 제출 수의계약에 한한다)'}
    ];
    const appendixHtml=appendix.map(item=>`<div class="appendix-item"><div class="appendix-num">${item.n}</div><div class="appendix-body"><div class="appendix-main">${esc(item.main)}</div>${item.subs?`<ol class="appendix-subs">${item.subs.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:''}${item.note?`<div class="appendix-note">※ ${esc(item.note)}</div>`:''}</div></div>`).join('');
    return `<section class="print-document pledge-print"><h1>수의계약 통합서약서</h1><table class="pledge-meta"><tr><td class="label">계약명</td><td>${esc(val('contractName'))}</td><td class="label">발주기관</td><td>${esc(val('institution'))}</td></tr><tr><td class="label">업체명</td><td>${esc(val('vendorName'))}</td><td class="label">대표자</td><td>${esc(val('representative'))}</td></tr><tr><td class="label">사업자등록번호</td><td>${esc(val('businessNo'))}</td><td class="label">연락처</td><td>${esc(val('phone'))}</td></tr><tr><td class="label">주소</td><td colspan="3">${esc(val('address'))}</td></tr></table><table class="pledge-table"><thead><tr><th class="num">순</th><th class="cat">구분</th><th>이행 내용</th><th class="choices">세부내용</th></tr></thead><tbody>${rows.join('')}</tbody></table><div class="pledge-footer">${printDate(val('contractDate'))}</div><div class="pledge-sign">계약상대자: ${esc(val('vendorName'))} &nbsp;&nbsp; 대표 ${esc(val('representative'))} ${sigImg('representative','')}</div><div class="recipient-line">${esc(val('recipient'))}</div></section><section class="print-document pledge-print appendix-page"><div class="appendix-kicker">[붙임1]</div><div class="appendix-title">수의계약 배제사유</div><div class="appendix-lead">수의계약 체결 전 아래 배제사유 해당 여부를 확인합니다.</div><div class="appendix-list">${appendixHtml}</div></section>`;
  }

  function hazardDetailPrintHTML(){
    return hazardForms.map((f,i)=>{
      if(state.hazard[i]!=='o') return '';
      const rows=f.questions.map((q,j)=>`<tr><td class="no">${j+1}</td><td class="check-content">${esc(q)}</td><td class="result">${state.hazardAnswers[i][j]==='yes'?'○':''}</td><td class="result">${state.hazardAnswers[i][j]==='no'?'○':''}</td><td class="result">${state.hazardAnswers[i][j]==='na'?'○':''}</td></tr>`).join('');
      return `<section class="print-document hazard-detail-print page-break"><h1>${esc(f.title)}</h1><div class="hazard-detail-subtitle">${esc(f.subtitle)}</div><div class="hazard-detail-meta"><div><strong>■ 공사 업체명:</strong><span>${esc(val('vendorName'))}</span></div><div><strong>■ 점 검 자:</strong><span>${esc(val('contractorManager'))}</span><span class="hazard-detail-sign">${sigImg('contractor','')}</span><span>(서명)</span></div><div><strong>■ 점검일자:</strong><span>${printDate('')}</span></div></div><table class="safety-table hazard-detail-table"><colgroup><col class="col-no"><col class="col-content"><col class="col-result"><col class="col-result"><col class="col-result"></colgroup><thead><tr><th rowspan="2" class="no">번호</th><th rowspan="2">점 검 내 용</th><th colspan="3">점검결과</th></tr><tr><th class="result">예</th><th class="result">아니요</th><th class="result">해당없음</th></tr></thead><tbody>${rows}</tbody></table>${f.note?`<div class="hazard-detail-print-note">${esc(f.note).replace(/\n/g,'<br>')}</div>`:''}</section>`;
    }).join('');
  }

  function safetyHTML(){
    const rows=safetyQuestions.map((q,i)=>`<tr><td class="no">${i+1}</td><td class="check-content">${esc(q)}</td><td class="result">${state.safety[i]==='yes'?'○':''}</td><td class="result">${state.safety[i]==='no'?'○':''}</td><td class="result">${state.safety[i]==='na'?'○':''}</td></tr>`).join('');
    const hz=hazards.map((h,i)=>`<tr><td>${esc(h)}</td><td>${state.hazard[i]==='o'?'○':state.hazard[i]==='x'?'×':''}</td></tr>`).join('');
    const vendor=esc(val('vendorName')), manager=esc(val('contractorManager'));
    return `<section class="print-document safety-print"><h1>공사(용역) 안전·보건 체크리스트(공통)</h1><div class="safety-subtitle">[ 기관(학교)에서 점검하고, 업체에서 확인하여 자체 보관 ]</div><div class="safety-meta"><div class="mrow"><strong>■ 학교(기관)명:</strong><span>${esc(val('institution'))}</span></div><div class="mrow"><strong>■ 점 검 자:</strong><span class="inspector-name manual-field"></span><span class="sign-mark">(인)</span></div><div class="mrow"><strong>■ 점검일자:</strong><span>${printDate('')}</span></div></div><table class="safety-table"><colgroup><col class="col-no"><col class="col-content"><col class="col-result"><col class="col-result"><col class="col-result"></colgroup><thead><tr><th rowspan="2" class="no">번호</th><th rowspan="2">점 검 내 용</th><th colspan="3">점검결과</th></tr><tr><th class="result">예</th><th class="result">아니요</th><th class="result">해당없음</th></tr></thead><tbody>${rows}</tbody></table><table class="hazard-print"><tr><td><strong>점검 체크리스트</strong></td><td><strong>해당여부(○,×)</strong></td></tr>${hz}<tr><td colspan="2">※ 공사업체의 경우 자율점검관리를 위해 ‘사업장 자체 점검표’ 제공<br>※ A/S 등 1회성 작업인 경우에도 반드시 체크리스트 징구</td></tr></table><div class="safety-pledge-title">공사(용역)업체 확인·서약서</div><div class="safety-pledge-text">학교(기관)로부터 위 점검항목에 대하여 안내(주지)받았으며, 공사(용역) 전 과정에 걸쳐 참여하는 근로자에게 안전보건교육을 실시하고, 필요한 개인보호구를 지급 및 착용하며, 작업 시 안전수칙을 준수할 것을 서약합니다.</div><div class="safety-sign"><div class="safety-sign-row"><span class="safety-sign-label">소속(회사) :</span><span class="handwrite-space">${vendor}</span></div><div class="safety-sign-row"><span class="safety-sign-label">공사업체 책임자 :</span><span class="handwrite-space manager-space">${manager}</span><span class="signature-space">${sigImg('contractor','')}</span><span class="sign-mark">(서명)</span></div></div></section>${hazardDetailPrintHTML()}`;
  }

  function consentHTML(){
    const institution=esc(val('institution'));
    const rep=esc(val('representative'));
    const biz=esc(val('businessNo'));
    const phone=esc(val('phone'));
    const recipient=esc(val('recipient'));
    const isIndividual=state.businessType==='individual';
    const idRow=isIndividual
      ? `<div class="consent-id-line"><span>[&nbsp;&nbsp;] 대표자 주민등록번호</span><span class="resident-handwrite">　　　　　　-　　　　　　</span><em>출력 후 수기작성</em></div>`
      : `<div class="consent-id-line"><span>[&nbsp;&nbsp;] 대표법인 사업자등록번호</span><strong>${biz}</strong></div>`;
    return `<section class="print-document consent-print">
      <h1>행정정보 공동이용 사전동의서</h1>
      <div class="consent-help">※ 색상이 어두운 난은 대상자(법정대리인)가 작성하지 않으며, [　]에는 해당되는 곳에 √표를 합니다.</div>
      <table class="consent-table">
        <tr><th>이용기관 명칭</th><td>${institution}</td></tr>
        <tr><th>이용사무(이용목적)</th><td>대금 지급 전 4대보험 체납여부 확인</td></tr>
        <tr><th>공동이용 행정정보<br>보유·이용 기간</th><td>대금지급일로부터 5년<br><small>(조회결과 출력물 보관)</small></td></tr>
        <tr><th>행정정보 공동이용을 위해<br>제공하는 정보</th><td>사업자등록번호　${biz}</td></tr>
        <tr><th>공동이용 행정정보</th><td><div class="consent-info-list"><span>4대보험 체납여부 조회</span><span>국세 체납여부 조회</span><span>지방세 체납여부 조회</span></div></td></tr>
      </table>
      <div class="consent-body">본인은 위 사무의 처리를 위하여 「전자정부법」 제36조에 따른 행정정보의 공동이용을 통하여 이용기관의 업무처리담당자가 전자적으로 본인의 공동이용 행정정보(첨부서류)를 확인하는 것에 동의합니다.</div>
      <div class="consent-note-print">※ 행정정보의 공동이용에 대하여 동의하지 아니할 경우에도 불이익은 없으며, 동의하지 아니한 경우 본인이 해당 첨부서류를 직접 제출하여야 합니다.</div>
      <div class="consent-body">이용기관은 본인이 동의한 위 공동이용 행정정보를 확인하기 위해 「전자정부법 시행령」 제90조에 따라 주민등록번호, 사업자등록번호가 포함된 행정정보를 처리할 수 있습니다. 이용기관이 요청하는 경우 기재하여 주십시오.</div>
      <div class="consent-id-box">
        <strong>1. 4대보험 체납여부, 지방세 체납여부 조회 필요항목</strong>
        <div class="consent-id-line"><span>[&nbsp;&nbsp;] 사업자등록번호</span><strong>${biz}</strong></div>
        <strong>2. 국세 체납여부 조회 필요항목(개인사업자/법인사업자 구분)</strong>
        ${idRow}
        <div class="consent-id-guide">※ 국세 체납여부 조회 시 개인사업자는 대표자의 주민등록번호가 필요하며, 법인사업자는 대표자 주민등록번호가 필요하지 않습니다.</div>
      </div>
      <div class="consent-date">${printDate(val('contractDate'))}</div>
      <div class="consent-person">
        <div><span>대상자(본인)　성　명:</span><strong>${rep}</strong><span class="consent-signature">${sigImg('representative','')}</span><span>(서명 또는 인)</span></div>
        <div><span>　　　　　　　생년월일:</span><strong>${esc(fmtDate(val('representativeBirth')))}</strong><span class="handwrite-long ${val('representativeBirth')?'filled':''}"></span></div>
        <div><span>　　　　　　　전화번호:</span><strong>${phone}</strong></div>
      </div>
      <div class="consent-recipient">${recipient}</div>
    </section>`;
  }

  function updateConsentUI(){
    const individual=state.businessType==='individual';
    const pill=$('#consentRecommendPill'), status=$('#consentStatus'), guide=$('#consentBusinessGuide');
    if(pill){pill.textContent=individual?'선택':'권장';pill.classList.toggle('gray',individual);pill.classList.toggle('blue',!individual);}
    if(status)status.innerHTML=individual?'<span class="dot muted"></span>개인사업자 선택 · 주민번호는 수기작성':'<span class="dot ok"></span>법인사업자 권장';
    if(guide)guide.innerHTML=individual?'<span>개인사업자 선택</span><p>대표자 주민등록번호가 필요한 조회가 있어 기본 권장하지 않습니다. 필요한 경우에만 출력하고 주민번호는 종이에 직접 작성하세요.</p>':'<span>법인사업자 권장</span><p>사업자등록번호로 조회 가능한 범위에서 사용합니다. 조회되지 않으면 대금 지급 전에 4대보험 완납증명서를 별도로 확인하세요.</p>';
    const map={consentInstitutionPreview:val('institution'),consentRepPreview:val('representative'),consentBizPreview:val('businessNo'),consentPhonePreview:val('phone')};
    Object.entries(map).forEach(([id,v])=>{const el=$('#'+id);if(el)el.textContent=v||'미입력';});
  }

  function docHTML(doc){return doc==='acceptance'?acceptanceHTML():doc==='pledge'?pledgeHTML():doc==='safety'?safetyHTML():consentHTML();}
  function selectedDocs(){return [['acceptance','#selectAcceptance'],['pledge','#selectPledge'],['safety','#selectSafety'],['consent','#selectConsent']].filter(x=>$(x[1]).checked).map(x=>x[0]);}
  function showPreview(docs){
    state.previewDocs=docs; $('#previewTitle').textContent=docs.length===1?({acceptance:'승낙사항',pledge:'수의계약 통합서약서',safety:'안전·보건 체크리스트',consent:'행정정보 공동이용 사전동의서'}[docs[0]]):'선택 서류 미리보기'; $('#previewMeta').textContent=`${docs.length}종`; $('#previewCanvas').innerHTML=docs.map(docHTML).join(''); $('#previewDialog').showModal();
  }
  function openPreview(docs){
    if(!docs.length){toast('미리볼 서류를 하나 이상 선택해 주세요.');return;}
    // 미리보기는 서명 없이 바로 확인한다. 안전·보건 업체 책임자 서명은 실제 인쇄 직전에만 요청한다.
    showPreview(docs);
  }
  function doPrint(docs){$('#printRoot').innerHTML=docs.map(docHTML).join('');setTimeout(()=>window.print(),80);}
  function printDocs(docs,fromPreview=false){
    if(!docs.length)return;
    if(docs.includes('safety')&&!fromPreview){openSignaturePad('contractor',()=>doPrint(docs),true);return;}
    doPrint(docs);
  }

  let openSignaturePad=()=>{};
  function setupSignaturePad(){
    const dlg=$('#signDialog'), canvas=$('#signatureCanvas'), ctx=canvas.getContext('2d');let drawing=false,last=null;
    function clearCanvas(){ctx.clearRect(0,0,canvas.width,canvas.height);}
    function sizeCanvas(){const rect=canvas.getBoundingClientRect();const ratio=devicePixelRatio||1;canvas.width=Math.max(1,rect.width*ratio);canvas.height=Math.max(1,260*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=2.2;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#111';clearCanvas();}
    function pos(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
    function finishPending(){const fn=state.pendingAfterSign;state.pendingAfterSign=null;if(fn)setTimeout(fn,20);}
    openSignaturePad=(slot,after=null,allowSkip=false)=>{
      state.activeSignSlot=slot;state.pendingAfterSign=after;
      $('#signDialogTitle').textContent=slot==='contractor'?'공사(용역)업체 책임자 서명':'직접 서명';
      $('#skipSignature').classList.toggle('hidden',!allowSkip);
      dlg.showModal();setTimeout(sizeCanvas,30);
    };
    canvas.addEventListener('pointerdown',e=>{drawing=true;last=pos(e);canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=pos(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});canvas.addEventListener('pointerup',()=>drawing=false);canvas.addEventListener('pointercancel',()=>drawing=false);
    $$('.sign-draw').forEach(b=>b.onclick=()=>openSignaturePad(b.dataset.slot));
    $('#clearCanvas').onclick=clearCanvas;
    $('#closeSign').onclick=()=>{state.pendingAfterSign=null;dlg.close();};
    $('#skipSignature').onclick=()=>{if(state.activeSignSlot==='contractor')state.signatures.contractor=null;dlg.close();finishPending();};
    $('#applySignature').onclick=()=>{state.signatures[state.activeSignSlot]=canvas.toDataURL('image/png');updateSignaturePreviews();dlg.close();if(state.activeSignSlot!=='contractor')toast('서명을 현재 문서에 적용했습니다.');finishPending();};
  }


  // v0.2.2 — 목록에서 바로 이어서 작성하고, 오른쪽 한 곳에서 실제 서류를 계속 확인한다.
  const liveDocMap={acceptance:'acceptanceEditor',pledge:'pledgeEditor',safety:'safetyEditor',consent:'consentEditor'};
  const editorDocMap=Object.fromEntries(Object.entries(liveDocMap).map(([k,v])=>[v,k]));
  const liveDocNames={acceptance:'승낙사항',pledge:'수의계약 통합서약서',safety:'안전·보건 체크리스트',consent:'행정정보 공동이용 사전동의서'};
  let activeLiveDoc='acceptance';
  let livePreviewTimer=null;
  let scrollSyncPending=false;

  function applyPreviewBindings(doc,root){
    if(!root) return;
    if(doc==='acceptance'){
      const paras=$$('.doc-paragraph',root);
      if(paras[0]) paras[0].dataset.bind='startDate endDate';
      if(paras[2]) paras[2].dataset.bind='delayRateDisplay customRate';
      if(paras[3]) paras[3].dataset.bind='defectPeriod customDefect defectConfirmed';
      const date=$('.doc-date',root); if(date) date.dataset.bind='contractDate';
      $$('.party-info .line',root).forEach(line=>{
        const label=line.querySelector('span')?.textContent.replace(/\s/g,'')||'';
        const map={'계약명':'contractName','상호또는법인명칭':'vendorName','법인(사업자)등록번호':'businessNo','전화번호':'phone','주소':'address','대표자':'representative'};
        if(map[label]) line.dataset.bind=map[label];
      });
    }else if(doc==='pledge'){
      $$('.pledge-meta tr',root).forEach(tr=>{
        const cells=[...tr.children];
        for(let i=0;i<cells.length;i++){
          if(!cells[i].classList.contains('label')) continue;
          const label=cells[i].textContent.trim(), target=cells[i+1];
          const map={'계약명':'contractName','발주기관':'institution','업체명':'vendorName','대표자':'representative','사업자등록번호':'businessNo','연락처':'phone','주소':'address'};
          if(target&&map[label]) target.dataset.bind=map[label];
        }
      });
      $$('.pledge-table tbody tr',root).forEach(tr=>{const n=tr.querySelector('.num')?.textContent.trim();if(n)tr.dataset.bind='pledge-'+n;});
      const footer=$('.pledge-footer',root);if(footer)footer.dataset.bind='contractDate';
      const sign=$('.pledge-sign',root);if(sign)sign.dataset.bind='representative vendorName';
      const recipient=$('.recipient-line',root);if(recipient)recipient.dataset.bind='recipient';
    }else if(doc==='safety'){
      const meta=$$('.safety-meta .mrow',root); if(meta[0])meta[0].dataset.bind='institution';
      $$('.safety-table tbody tr',root).forEach((tr,i)=>tr.dataset.bind='safety-'+i);
      $$('.hazard-print tr',root).slice(1,5).forEach((tr,i)=>tr.dataset.bind='hazard-'+i);
      const sign=$('.safety-sign',root);if(sign)sign.dataset.bind='contractorManager contractor-sign';
    }else if(doc==='consent'){
      $$('.consent-table tr',root).forEach(tr=>{
        const label=tr.querySelector('th')?.textContent.replace(/\s/g,'')||'';
        if(label.includes('이용기관명칭'))tr.dataset.bind='institution';
        if(label.includes('제공하는정보'))tr.dataset.bind='businessNo';
      });
      const person=$$('.consent-person > div',root);if(person[0])person[0].dataset.bind='representative representative-sign';if(person[1])person[1].dataset.bind='representativeBirth';if(person[2])person[2].dataset.bind='phone';
      const date=$('.consent-date',root);if(date)date.dataset.bind='contractDate';
      const recipient=$('.consent-recipient',root);if(recipient)recipient.dataset.bind='recipient';
      $$('.consent-id-line',root).forEach(x=>x.dataset.bind='businessNo');
    }
  }

  function renderLivePreview(doc=activeLiveDoc){
    const stage=$('#sharedPreviewStage'); if(!stage) return;
    activeLiveDoc=doc||activeLiveDoc;
    stage.innerHTML=docHTML(activeLiveDoc);
    applyPreviewBindings(activeLiveDoc,stage);
    const title=$('#sharedPreviewTitle'); if(title) title.textContent=liveDocNames[activeLiveDoc];
    const meta=$('#sharedPreviewMeta'); if(meta) meta.textContent='입력 즉시 반영';
    const picker=$('#previewDocSelect'); if(picker&&picker.value!==activeLiveDoc) picker.value=activeLiveDoc;
    const current=$('#printbarCurrentDoc'); if(current) current.textContent=liveDocNames[activeLiveDoc];
    $$('.inline-doc-section').forEach(x=>x.classList.toggle('is-active',x.dataset.doc===activeLiveDoc));
  }
  function refreshLivePreviews(){renderLivePreview(activeLiveDoc);}
  function scheduleLivePreviews(){clearTimeout(livePreviewTimer);livePreviewTimer=setTimeout(()=>renderLivePreview(activeLiveDoc),25);}

  function setActiveLiveDoc(doc,{scrollPreview=false}={}){
    if(!liveDocMap[doc]) return;
    const changed=activeLiveDoc!==doc;
    activeLiveDoc=doc;
    renderLivePreview(doc);
    if(changed&&scrollPreview){$('#sharedPreviewPane')?.scrollIntoView({behavior:'smooth',block:'start'});}
  }

  function highlightLiveBinding(editor,token){
    if(!token)return;
    const stage=$('#sharedPreviewStage');if(!stage)return;
    $$('.live-highlight',stage).forEach(x=>x.classList.remove('live-highlight'));
    const match=$$('[data-bind]',stage).find(x=>(x.dataset.bind||'').split(/\s+/).includes(token));
    if(match){
      match.classList.add('live-highlight');
      // Keep the main page position fixed. Only scroll the document preview pane.
      const stageBox=stage.getBoundingClientRect(), matchBox=match.getBoundingClientRect();
      const targetTop=stage.scrollTop+(matchBox.top-stageBox.top)-stage.clientHeight/2+matchBox.height/2;
      stage.scrollTo({top:Math.max(0,targetTop),behavior:'smooth'});
      setTimeout(()=>match.classList.remove('live-highlight'),1500);
    }
  }
  function tokenForControl(target){
    if(target.id) return target.id;
    if(target.dataset.pledge){const item=pledgeItems.find(x=>x.id===target.dataset.pledge);return item?'pledge-'+item.num:'';}
    if(target.dataset.conflict!==undefined)return 'pledge-3';
    if(target.dataset.safety!==undefined)return 'safety-'+target.dataset.safety;
    if(target.dataset.hazard!==undefined)return 'hazard-'+target.dataset.hazard;
    return '';
  }

  function focusInputForBinding(token){
    let field=$('#'+token);
    if(!field&&token.startsWith('pledge-')){
      const num=token.slice(7);
      if(num==='3')field=$('[data-conflict]');
      else{const item=pledgeItems.find(x=>x.num===num);if(item)field=$(`[data-pledge="${item.id}"]`);}
    }
    if(!field&&token.startsWith('safety-'))field=$(`[data-safety="${token.slice(7)}"]`);
    if(!field&&token.startsWith('hazard-'))field=$(`[data-hazard="${token.slice(7)}"]`);
    if(field){field.focus?.();field.scrollIntoView({behavior:'smooth',block:'center'});return true;}
    return false;
  }

  function updateSelectedCount(){
    const docs=selectedDocs();
    const count=docs.length;
    const el=$('#selectedDocCount');if(el)el.textContent=`선택 ${count}종`;
    $$('.inline-doc-section').forEach(sec=>sec.classList.toggle('doc-unselected',!docs.includes(sec.dataset.doc)));
    $$('.doc-choice-chip').forEach(chip=>chip.classList.toggle('is-selected',docs.includes(chip.dataset.doc)));
    if(!docs.includes(activeLiveDoc)) setActiveLiveDoc(docs[0]||'acceptance');
  }

  function syncPreviewToScroll(){
    if(scrollSyncPending)return;scrollSyncPending=true;
    requestAnimationFrame(()=>{
      scrollSyncPending=false;
      const sections=$$('.inline-doc-section');if(!sections.length)return;
      const targetY=Math.min(window.innerHeight*.34,240);
      let best=null,bestDist=Infinity;
      sections.forEach(sec=>{
        const r=sec.getBoundingClientRect();
        if(r.bottom<90||r.top>window.innerHeight*.92)return;
        const d=Math.abs(r.top-targetY);
        if(d<bestDist){best=sec;bestDist=d;}
      });
      if(best&&best.dataset.doc!==activeLiveDoc)setActiveLiveDoc(best.dataset.doc);
    });
  }

  function initInlineWorkbench(){
    const workspace=$('.workspace'),docList=$('#docList');if(!workspace||!docList)return;
    const footer=$('.app-footer');
    const hero=$('.compact-hero'); if(hero) hero.remove();
    const composer=document.createElement('div');composer.className='v023-workbench';
    const preview=document.createElement('aside');preview.className='shared-preview-pane v023-preview-pane';preview.id='sharedPreviewPane';
    preview.innerHTML=`<div class="shared-preview-shell"><div class="shared-preview-head"><div><span class="eyebrow">현재 서류</span><h3 id="sharedPreviewTitle">승낙사항</h3><p id="sharedPreviewMeta">입력 즉시 반영</p></div><div class="shared-preview-actions"><select id="previewDocSelect" class="preview-doc-select" aria-label="미리보기 문서 선택"><option value="acceptance">01 승낙사항</option><option value="pledge">02 수의계약 통합서약서</option><option value="safety">03 안전·보건 체크리스트</option><option value="consent">04 행정정보 공동이용 사전동의서</option></select><button type="button" class="btn tiny ghost" id="sharedPreviewFullscreen">크게 보기</button></div></div><div class="live-preview-stage" id="sharedPreviewStage" aria-label="실시간 서류 미리보기"></div></div>`;
    const flow=document.createElement('div');flow.className='v023-flow-column';
    const selector=document.createElement('section');selector.className='doc-choice-bar';
    selector.innerHTML=`<div class="doc-choice-head"><div><span class="eyebrow">작성할 서류</span><strong>필요한 서류만 선택하세요</strong></div><span id="selectedDocCount">선택 4종</span></div><div class="doc-choice-list" id="docChoiceList"></div>`;
    flow.appendChild(selector); const choiceList=$('#docChoiceList',selector);
    $$('.doc-list-row',docList).forEach(row=>{
      const doc=row.dataset.doc,id=liveDocMap[doc],editor=$('#'+id);if(!editor)return;
      const checkbox=row.querySelector('input[type="checkbox"]');
      const title=row.querySelector('h3')?.textContent||liveDocNames[doc];
      const num=row.querySelector('.doc-list-num')?.textContent||'';
      const status=row.querySelector('.status-line');
      const desc=row.querySelector('.doc-list-copy p')?.textContent||'';
      const chip=document.createElement('label');chip.className='doc-choice-chip';chip.dataset.doc=doc;
      chip.innerHTML=`<span class="chip-checkbox-slot"></span><span class="chip-num">${num}</span><span class="chip-copy"><strong>${esc(title)}</strong><small>${esc(desc)}</small></span>`;
      chip.querySelector('.chip-checkbox-slot').appendChild(checkbox); choiceList.appendChild(chip);
      const section=document.createElement('section');section.className='inline-doc-section v023-doc-section';section.dataset.doc=doc;
      const head=document.createElement('div');head.className='v023-section-head';
      head.innerHTML=`<div class="v023-title-wrap"><span class="v023-doc-num">${num}</span><div><h2>${esc(title)}</h2><p>${esc(desc)}</p></div></div><div class="v023-status-slot"></div>`;
      if(status) head.querySelector('.v023-status-slot').appendChild(status);
      editor.classList.remove('collapsed','doc-hidden','doc-active');editor.classList.add('inline-editor');
      const oldHead=$('.editor-head',editor);if(oldHead)oldHead.setAttribute('aria-hidden','true');
      section.append(head,editor);flow.appendChild(section);
      const activate=()=>setActiveLiveDoc(doc); section.addEventListener('pointerenter',activate,{passive:true}); section.addEventListener('focusin',activate); head.addEventListener('click',activate);
      checkbox.addEventListener('change',()=>{updateSelectedCount();scheduleLivePreviews();});
    });
    docList.remove();
    const signature=$('.signature-card');if(signature){signature.classList.add('inline-signature','v023-signature');flow.appendChild(signature);}
    const bottom=document.createElement('div');bottom.className='flow-printbar v023-printbar';bottom.innerHTML=`<div class="printbar-current"><span>현재 서류</span><strong id="printbarCurrentDoc">승낙사항</strong></div><div><button type="button" class="btn ghost" id="flowPreviewAll">선택 서류 미리보기</button><button type="button" class="btn primary" id="flowPrintCurrent">현재 서류 인쇄</button><button type="button" class="btn dark" id="flowPrintAll">선택 서류 한 번에 출력</button></div>`; flow.appendChild(bottom);
    composer.append(preview,flow); if(footer)workspace.insertBefore(composer,footer);else workspace.appendChild(composer);
    $('#sharedPreviewFullscreen').onclick=()=>openPreview([activeLiveDoc]); $('#flowPrintCurrent').onclick=()=>printDocs([activeLiveDoc]); $('#flowPreviewAll').onclick=()=>openPreview(selectedDocs()); $('#flowPrintAll').onclick=()=>printDocs(selectedDocs());
    $('#previewDocSelect').onchange=e=>setActiveLiveDoc(e.target.value);
    preview.querySelector('.live-preview-stage').addEventListener('click',e=>{const bound=e.target.closest('[data-bind]');if(!bound)return;for(const token of (bound.dataset.bind||'').split(/\s+/)){if(focusInputForBinding(token))break;}});
    updateSelectedCount();setActiveLiveDoc('acceptance'); window.addEventListener('scroll',syncPreviewToScroll,{passive:true});
  }

  function initLiveEditors(){
    initInlineWorkbench();
    const heroText=$('.compact-hero p:last-child');if(heroText)heroText.textContent='아래에서 필요한 항목만 바로 작성하세요. 오른쪽 실제 서류에 즉시 반영됩니다.';
    const heroButton=$('#previewSelectedBtn');if(heroButton)heroButton.textContent='선택 서류 한 번에 보기';
    document.addEventListener('input',e=>{if(e.target.closest('.app-shell'))scheduleLivePreviews();});
    document.addEventListener('change',e=>{if(e.target.closest('.app-shell'))scheduleLivePreviews();});
    document.addEventListener('focusin',e=>{
      const editor=e.target.closest('.editor-card');if(!editor)return;
      const doc=editorDocMap[editor.id];if(doc)setActiveLiveDoc(doc);
      highlightLiveBinding(editor,tokenForControl(e.target));
    });
    document.addEventListener('click',e=>{
      const editor=e.target.closest('.editor-card');if(!editor)return;
      const doc=editorDocMap[editor.id];if(doc)setActiveLiveDoc(doc);
      setTimeout(()=>{scheduleLivePreviews();highlightLiveBinding(editor,tokenForControl(e.target));},0);
    });
    refreshLivePreviews();
  }

  function setupDateInputs(){
    ['contractDate','startDate','endDate'].forEach(id=>{
      const input=$('#'+id),picker=$(`[data-picker-for="${id}"]`),button=$(`[data-date-for="${id}"]`); if(!input)return;
      input.addEventListener('input',()=>{input.value=formatDateInput(input.value);input.classList.remove('invalid');updateSummaries();scheduleLivePreviews();});
      input.addEventListener('blur',()=>{const ok=validDateInput(input.value);input.classList.toggle('invalid',!ok);input.setAttribute('aria-invalid',ok?'false':'true');input.title=ok?'':'YYYY-MM-DD 형식의 실제 날짜를 입력해 주세요.';});
      if(picker){picker.addEventListener('change',()=>{if(picker.value){input.value=picker.value;input.classList.remove('invalid');updateSummaries();scheduleLivePreviews();}});}
      if(button&&picker)button.addEventListener('click',()=>{if(validDateInput(input.value)&&/^\d{4}-\d{2}-\d{2}$/.test(input.value))picker.value=input.value;try{picker.showPicker();}catch(e){picker.focus();picker.click();}});
    });
  }

  // events
  $$('#contractTypeGroup button').forEach(b=>b.onclick=()=>setContractType(b.dataset.type));
  $$('#businessTypeGroup button').forEach(b=>b.onclick=()=>setBusinessType(b.dataset.business));
  $('#institution').addEventListener('input',()=>{maybeSuggestRecipient(false);updateConsentUI();updateCompactSummaries()});$('#institution').addEventListener('blur',()=>maybeSuggestRecipient(false));$('#recipient').addEventListener('input',()=>{$('#recipient').dataset.userEdited='1'});$('#suggestRecipientBtn').onclick=()=>maybeSuggestRecipient(true);
  $('#defectPeriod').onchange=()=>{$('#customDefect').classList.toggle('hidden',$('#defectPeriod').value!=='custom');$('#defectConfirmed').checked=false;updateSummaries();};$('#customDefect').oninput=updateSummaries;$('#defectConfirmed').onchange=updateSummaries;
  $('#toggleRateEdit').onclick=()=>{state.customRate=!state.customRate;$('#customRate').classList.toggle('hidden',!state.customRate);$('#toggleRateEdit').textContent=state.customRate?'법정값으로':'직접 설정';if(!state.customRate)$('#customRate').value='';updateSummaries();};$('#customRate').oninput=updateSummaries;
  ['vendorName','representative','phone','address'].forEach(id=>$('#'+id).addEventListener('input',()=>{saveVendorIfEnabled();updateConsentUI();updateCompactSummaries();}));
  $('#businessNo').addEventListener('input',e=>{e.target.value=formatBusinessNo(e.target.value);saveVendorIfEnabled();updateConsentUI();updateCompactSummaries();});
  $('#representativeBirth').addEventListener('input',e=>{const raw=e.target.value; e.target.value=formatBirthInput(raw);e.target.classList.remove('invalid'); updateConsentUI();});$('#representativeBirth').addEventListener('blur',e=>{const ok=validDateInput(e.target.value);e.target.classList.toggle('invalid',!ok);e.target.setAttribute('aria-invalid',ok?'false':'true');});
  $('#rememberVendor').onchange=()=>{if($('#rememberVendor').checked){saveVendorIfEnabled();toast('업체정보를 이 브라우저에 저장합니다.');}else{localStorage.removeItem(STORE_KEY);$('#saveState').textContent='업체정보 미저장';}};$('#deleteSavedVendorBtn').onclick=()=>deleteSavedVendor(false);
  $('#pledgeAllYes').onclick=()=>{pledgeItems.forEach(it=>{if(it.id==='utility'&&state.contractType!=='construction')return;state.pledge[it.id]='yes';if((it.id==='guarantee'||it.id==='defect')&&!state.pledge[it.id+'Extra'])state.pledge[it.id+'Extra']='각서';});if(state.contractType!=='construction')state.pledge.utility='na';renderPledgeSimple();updatePledgeStatus();};$('#pledgeClear').onclick=()=>{state.pledge={};if(state.contractType!=='construction')state.pledge.utility='na';renderPledgeSimple();updatePledgeStatus();};
  $$('.safety-bulk').forEach(b=>b.onclick=()=>{state.safety=Array(10).fill(b.dataset.value);renderSafety();updateSafetyStatus();scheduleLivePreviews();});$('#safetyClear').onclick=()=>{state.safety=Array(10).fill(null);renderSafety();updateSafetyStatus();};
  $('#hazardAllNo').onclick=()=>{state.hazard=Array(4).fill('x');state.hazardAnswers=hazardForms.map(f=>Array(f.questions.length).fill(null));renderSafety();updateSafetyStatus();};
  $$('.collapse-btn').forEach(b=>b.onclick=()=>b.closest('.editor-card').classList.toggle('collapsed'));
  $$('.preview-one').forEach(b=>b.onclick=()=>openPreview([b.dataset.doc]));$$('.print-one').forEach(b=>b.onclick=()=>printDocs([b.dataset.doc]));$('#previewSelectedBtn').onclick=()=>openPreview(selectedDocs());$('#closePreview').onclick=()=>{const hadSafety=state.previewDocs.includes('safety');$('#previewDialog').close();if(hadSafety)state.signatures.contractor=null;$('#previewCanvas').innerHTML='';};$('#printPreview').onclick=()=>{const docs=[...state.previewDocs];$('#previewDialog').close();printDocs(docs,false);};
  $('#newContractBtn').onclick=()=>$('#newContractDialog').showModal();$('#cancelNewContract').onclick=()=>$('#newContractDialog').close();$('#confirmNewContract').onclick=()=>{$('#newContractDialog').close();newContract();};$('#helpBtn').onclick=()=>$('#helpDialog').showModal();$('#closeHelp').onclick=()=>$('#helpDialog').close();$('#fullResetBtn').onclick=()=>{deleteSavedVendor(true);newContract();$('#helpDialog').close();};
  $('#sealFile').onchange=e=>{const file=e.target.files?.[0];if(!file)return;revokeSeal();state.sealObjectUrl=URL.createObjectURL(file);state.signatures.representative=state.sealObjectUrl;updateSignaturePreviews();e.target.value='';toast('직인을 현재 탭에만 적용했습니다.');};$$('.clear-sign').forEach(b=>b.onclick=()=>{if(b.dataset.slot==='representative')revokeSeal();state.signatures[b.dataset.slot]=null;updateSignaturePreviews();});
  window.addEventListener('beforeunload',revokeSeal);
  window.addEventListener('afterprint',()=>{state.signatures.contractor=null;$('#printRoot').innerHTML='';if($('#previewDialog').open&&state.previewDocs.includes('safety'))$('#previewCanvas').innerHTML=state.previewDocs.map(docHTML).join('');});
  $('#contractName').addEventListener('input',updateSummaries);

  setupSignaturePad(); setupDateInputs(); loadVendor(); setContractType('service'); setBusinessType(state.businessType); renderPledgeSimple();renderConflict();renderSafety();updateSummaries();updatePledgeStatus();updateSafetyStatus();updateSignaturePreviews();updateConsentUI(); initLiveEditors();
})();
