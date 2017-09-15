var end = 1e8, tmp = 1;

postMessage('안녕하세요');

while (end) {
  end -= 1;
  tmp += end;
  if (end === 5e7) { // 5e7은 1e8의 절반
    postMessage('절반 정도 진행되었습니다. 현재 \' tmp 값\'은 '+ tmp + '입니다.');
  }
}

postMessage('작업 종료');
