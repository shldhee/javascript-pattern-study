# Chapter7 DOM과 브라우저 패턴

> 이번 장에서는 가장 일반적인 자바스크립트 프로그램의 실행 환경인 브라우저에 특화된 여러 가지 패턴에 대해서 알아본다. 여러 패턴들을 몇 가지 영역으로 나누어 살펴 보자. DOM 스크립팅, 이벤트 핸들링, 원격 스크립팅, 페이지에서 자바스크립트 로딩 전략 그리고 웹사이트에 자바스크립트를 배포하는 단계로 구성된다.

## 1. 관심사의 분리

웹 애플리케이션 개발에서 주요 관심사는 다음의 세 가지로 나누어 볼 수 있다.

* 내용 : HTML 문서
* 표현 : CSS 스타일 - 문서가 어떻게 보여질 것인지 지정한다.
* 행동 : 자바스크립트 - 사용자 인터랙션과 문서의 동적인 변경을 처리한다.

*관심사의 분리* 는 CSS, 자바스크립트를 사용하지 않아도 페이지가 정상적으로 읽을 수 있어야 한다.

'행동'에 속하는 자바스크립트는 무간섭적이어야 한다.(페이지 동작시 필수 요건이 되어서는 안된다. 페이지를 향상시키기만 해야 한다.)

*기능 탐지(capability detection)*는 브라우저간의 차이점을 우아하게 다루는 일반적인 기술 중 하나다. 사용자 에이전트를 감지해 코드를 분기하는 대신에, 사용하려는 메서드나 프로퍼티가 현재의 실행 환경에 존재하는지 확인하는 기술을 말한다. 사용자 에이전트 감지는 대체로 안티패턴이라 할 수 있다.

``` js
// 안티패턴
if (navigator.userAgent.indexOf('MSIE') !== .1) {
  document.attachEvent('onclick', console.log);
}

// 더 좋은 방법
if (document.attachEvent) {
  document.attachEvent('onclick', console.log);
}

// 조금 더 정확한 방법
if (typeof document.attachEvent !== "undefined") {
  document.attachEvent('onclick', console.log);
}
```

관심사를 분리하면 개발 및 유지보수 그리고 기존의 웹애플리케이션을 업데이트하기 또한 용이해진다. 문제가 생겼을 때 어느 부분을 확인하면 되는지 알 수 있기 때문이다.

 ## 2. DOM 스크립팅

페이지의 DOM 트리를 다루는 것은 클라이언트 측 자바스크립트에서 처리하는 가장 흔한 일 중 하나다. 동시에 DOM 메서드가 브라우저간에 일관성 없이 구현되어 있기 때문에 가장 골치아픈 작업이기도 하다. 때문에 브라우저간의 차이점을 추상화한 자바스크립트 라이브러를 사용하면 개발 속도를 크게 향상시킬 수 있다.

### 2-1) DOM 접근

DOM 접근은 비용이 많이 드는 작업이다. 자바스크립트의 성능에서 DOM 접근은 가장 흔한 병목 지점이다. 일반적으로 DOM은 자바스크립트 엔진과 별개로 구현되었기 때문이다. 자바스크립트에서 DOM을 사용하지 않을 수도 있기 떄문에 브라우저 입장에서는 이런 방식이 타당하다.

**핵심은 DOM 접근을 최소화해야 한다.**

* 루프 내에서 DOM 접근을 피한다.
* DOM 참조를 지역 변수에 할당하여 사용한다.
* 가능하면 셀렉터 API를 사용한다.
* HTML 콜렉션을 순회할 때 length를 캐시하여 사용한다. (2장 참고)

다음 예제는 브라우저에 따라 수십에서 수백 배 빠르다.

``` js
// 안티패턴
for (var i = 0; i < 100; i++) {
  document.getElementById("result").innerHTML += i + ", ";
}

// 지역 변수를 활용하는 개선안
var i, content = "";
for (i =0; i < 100; i ++) {
  content += i + ",";
}
document.getElementById("result").innerHTML += content;
```

다음 예제는 지역 변수를 활용하는 첫 예제보다 한 줄이 더 길고, 변수가 하나 더 필요하지만 더 좋은 코드다.

``` js
// 안티패턴
var padding = document.getElementById("result").style.padding,
    margin = document.getElementById("result").style.margin;

// 개선안
var style = document.getElementById("result").style,
    padding = style.padding,
    margin = style.margin;
```

다음 코드는 셀렉터 API를 사용하는 예제다.

``` js
document.querySelector("ul .selected");
document.querySelectorAll("#widget .class");
```

위 메서드들은 CSS 셀렉터 문자열을 받아 그에 해당하는 DOM 노드의 목록을 반환한다. IE 8 이상을 포함한 대부분의 최신 부라우저에서 사용 가능하며 다른 DOM 메서드를 사용한 선택 방식보다 항상 빠르다.

자주 접근하는 엘리먼트에 id 속성을 추가하는 것도 성능 향상에 도움이 될 수 있다. `document.getElementById(myid)`가 노드를 찾는 가장 쉽고 빠른 방법이다.

### 2-2) DOM 조작

DOM 엘리먼트 접근 이외에도, DOM 엘리먼트를 변경 또는 제거하거나 새로운 엘리먼트를 추가하는 작업도 자주 필요하다. DOM 업데이트시 브라우저는 화면을 다시 그리고(repatin), 엘리먼트들을 재구조화(reflow)하는데, 이 또한 비용이 많이 드는 작업이다.

원칙적으로 DOM 업데이트를 최소화하는 게 좋다. 이를 위해서는 변경 사항들을 일괄처리하거나, 실제 문서 트리 외부에서 변경 작업을 수행해야 한다.

비교적 큰 서브 트리를 만들때에는 서브 트리를 완전지 생성한 다음에 문서에 추가해야 한다. 이를 위해 문서 조각(document fragment)에 모든 하위 노드를 추가하는 방법을 사용할 수 있다.

먼저 문서에 노드를 붙일 떄 피해야 할 안티패턴이다.

``` js
// 노드를 만들고 곧바로 문서에 붙인다.
var p, t;

p = document.createElement('p');
t = document.createTextNode('first paragraph');
p.appendChild(t);

document.body.appendChild(p);

p = document.createElement('p');
t = document.createTextNode('second paragraph');
p.appendChild(t);

document.body.appendChild(p);
```

개선안은 문서 조각을 생성해 외부에서 수정한 후, 처리가 완전히 끝난 다음에 실제 DOM에 추가하는 것이다. 편리하게도 DOM 트리에 문서 조각을 추가하면, 조각 자체는 추가되지 않고 그 내용만 추가된다. 즉 문서 조각은 별도의 부모 노드 없이도 여러 개의 노드를 감쌀 수 있는 훌륭한 방법이다. (여러 개의 p 태그를 div 안에 넣지 않고도 한꺼번에 처리할 수 있다.)

``` js
var p, t, frag;

frag = document.createDocumentFragment();

p = document.createElement('p');
t = document.createTextNode('first paragraph');
p.appendChild(t);
frag.appendChild(p);

p = document.createElement('p');
t = document.createTextNode('second paragraph');
p.appendChild(t);
frag.appendChild(p);

document.body.appendChild(frag);
```

안티패턴 코드예제와 달리 `<p>` 엘리먼트를 생성할 떄마다 문서를 변경하지 않고 마지막에 단 한 번만 변경한다. 화면을 다시 그리고 재계산하는 과정도 한번만 이루어진다.

문서에 이미 존재하는 트리를 변경할 때는 변경하려는 서브 트리의 루트를 복제해서 변경한 뒤 원래의 노드와 복제한 노드를 바꾸면된다.

``` js
var oldnode = document.getElementById('result'),
    clone = oldnode.cloneNode(true);

// 복제본을 가지고 변경 작업을 처리한다.

// 변경이 끝나고 나면 원래의 노드와 교체한다.
oldnoe.parentNode.replaceChild(clone, oldnode);
```

## 3. 이벤트

브라우저 이벤트 처리는 최악의 일관성을 가지고 있어서 숱한 좌절의 원인이 되곤 한다. 자바스크립트 라이브러리를 사용하면 W3C를 준수하는 브라우저와 IE(9버전 미만)을 모두 지원하기 위해 두 벌로 작업하는 수고를 덜 수 있다.
간단한 페이지에는 라이브러를 사용하지 않을 수도 있고, 라이브러를 직접 만들 수도 있기 때문에 이벤트 처리를 위한 핵심 부분을 살펴보도록 하자.

### 3-1) 이벤트 처리

우선 엘리먼트에 이벤트 리스너를 붙이는 것으로 시작하자. 클릭할 떄마다 카운터의 숫자를 증가시키는 버튼이 있다. 인라인 `onclick` 속성을 추가하면 모든 브라우저에서 잘 동작하겠지만 관심사의 분리와 점진직인 개선의 원칙에 위배된다. 따라서 마크업을 건드리지 않고 항상 자바스크립트에서 이벤트 리스너를 처리해야 한다.

``` js
<button id="clickme">Click me: 0</button>

var b = document.getElementById('clickme'),
    count = 0;

b.onclick = function () {
  count += 1;
  b.innerHTML = "Click me: " + count;
};
```

~~이 패턴으로는 하나의 클릭 이벤트 여러 개의 함수가 실행되게 하면서 동시에 낮은 결합도를 유지하기 어렵다.
기술적으로 가능하기는 하다. `onclick`에 이미 함수가 할당되었는지 확인하고, 할당되어 있다면 이미 존재하는 함수를 새로운 함수안에 추가하고 이를 `onclick`의 값을 대체하면 된다.~~ 무슨말인지...

`addEventListener()`메서드를 사용하는 게 훨씬 깔끔하다. (IE 9부터 지원) IE 8이하는 `attachEvent()` 메서드 사용

*4장 초기화 시점 분기 패턴을 다룰 때 크로스 브라우저 이벤트 리스너 유틸리티를 정의 참조*

버튼에 리스너를 붙이는 예제

여러 개의 버튼을 두고 노드에 대한 참조와 카운터 숫자를 저장해두는 것은 비효율적이므로, 클릭할 때마다 생성되는 이벤트 객체로부터 필요한 정보를 구한다.
``` js
function myHandler(e) {
  var src, parts;

  e = e || window.event; // 글로벌 event 객체를 사용하는 경우는 이벤트 핸들러의 인자로 전달된 이벤트 객체
  src = e.target || e.srcElement; // 이벤트 핸들러에서 어떤 엘리먼트로부터 이벤트가 발생했는지 알기 위해 Event.srcElement 속성을 사용합니다.

  parts = src.innerHTML.split(": "); // ["Click me", "0"];

  parts[1] = parseInt(parts[1], 10) + 1; // 문자열 "0"을 10진수로 변환
  src.innerHTML = parts[0] + ": " + parts[1];

  // 이벤트 상위노드로 전파되지 않는다.
  if (typeof e.stopPropagation === "function") { // W3C 표준 방법
    e.stopPropagation();
  }
  if (typeof e.cancelBubble !== "undefined") { // IE를 위한 방법
    e.cancelBubble = true;
  }
  // 기본 동작이 수행되지 않게 한다.
  if (typeof e.preventDefault === "function") {
    e.preventDefault();
  }
  if (typeof e.returnValue !== "undefined") { // IE
    e.returnValue = false;
  }
}

var b = document.getElementById('clickme');
if (document.addEventListener) { // W3C
  b.addEventListener('click', myHandler, false);
} else if (document.attachEvent) { // IE
  b.attachEvent('onclick', myHandler);
} else { // 최후의 수단
  b.onclick = myHandler;
}
```

참조 : [event객체][22adbdaa]

  [22adbdaa]: https://cimfalab.github.io/deepscan/2016/07/event-in-firefox "event객체"


이벤트 핸들러 함수는 네 부분으로 구성되어 있다.

* 우선 이벤트 객체를 가져온다. 이벤트 객체는 이벤트에 대한 정보와 이벤트가 발생한 엘리먼트에 대한 정보를 가지고 있다. 이 객체는 콜백 이벤트 핸들러에 인자로 전달되며 `onclick` 프로퍼티를 사용한 경우에는 전역 프로퍼티인 `window.event`를 통해 접근할 수 있다.
* 두 번째 부분은 버튼의 이름을 변경하는 실제 작업을 수행한다.
* 그 다음, 이벤트가 상위 노드로 전파되지 않게 한다. 그리고 기본 동작이 수행되지 않게 한다.(링크 클릭, 폼 전송 등)

중복 작업이 반복되므로 7장 퍼사드 메서드로 이벤트 유틸리티를 만들어 두는게 좋다.

### 3-2) 이벤트 위임
