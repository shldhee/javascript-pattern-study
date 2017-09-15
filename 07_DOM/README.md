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

이벤트 위임 패턴은 이벤트 버블링을 이용해서 개별 노드에 붙는 이벤트 리스너의 개수를 줄여준다.

`div` 엘리먼트 내에 열 개의 버튼이 있다면, 각 버튼 엘리먼트에 리스너를 붙이는 대신 `div` 엘리먼트에 하나의 이벤트 리스너만 붙인다.

[click-event] : http://www.jspatterns.com/book/8/click-delegate.html

``` js
<div id="click-wrap">
  <button>Click me: 0</button>
  <button>Click two: 0</button>
  <button>Click theree: 0</button>
</div>
```

각 버튼에 이벤트 리스너를 붙이는 대신 `click-wrap` div에 하나의 리스너만을 붙일 것이다.

* 불필요한 클릭을 걸러낼 수 있도록 이전 예제의 `myHandler()` 함수를 수정
* 버튼에 대한 클릭만 찾으면 되기 때문에 `div`내의 다른 부분에서 발생한 클릭은 무시

다음과 같이 이벤트가 발생한 노드의 `nodeName`이 `button`인지 확인하도록 `myHandler()`를 변경

``` js
// ...
// 이벤트 객체와 이벤트가 발생한 엘리먼트를 가져온다.

e = e || window.event;
src = e.target || e.srcElement;

if (src.nodeName.toLowerCase() !== "button") { // button이 아니면 리턴(불필요한 다른 곳에 이벤트 발생하는 것을 방지 button일대만 실행)
  return;
}
```

이벤트 위임에는 불필요한 이벤트를 걸러내는 코드가 약간 추가 된다는 단점이 있다.

그러나 성능상의 이점과 코드의 간결성으로 인한 장점이 단점보다 훨씬 크기 때문에 적극 추천하는 패턴

## 4. 장시간 수행되는 스크립트

스크립트가 장시간 수행되면 브라우저가 사용자에게 스크립트를 중단시킬지 물어보는 경우가 있다. 아무리 복잡한 작업이라도 애플리케이션에서 이런 현상이 발생하는 것은 바람직하지 않다. 피해야 한다. 자바스크립트에는 스래드가 없지만, `setTimeout()`이나 최신 브라우저에서 지원하는 웹워커(web worker)를 사용해 스레드를 흉내낼 수 있다.

### 4-1) setTimeout()

많은 양의 작업을 작은 덩어리로 쪼개고 각 덩어리를 `setTimeout()`을 이용해 1밀리 초 간격의 타임아웃을 두고 실행하는 방법으로 스레드를 시뮬레이션할 수 있다. 1밀리초 간격의 타임아웃 덩어리를 사용하면 작업 진행 시간이 늘어날 수 있지만, UI를 응답가능한 상태로 유지함으로서 사용자가 더 편하게 브라우저를 제어할 수 있게 해준다.

*1밀리초(또는 0밀리초)의 타임아웃은 브라우저와 운영체제에 따라 실제로는 그보다 길어진다. 0밀리초로 타임아웃을 지정하는 것은 즉시 실행한다는 뜻이 아니라. "가능한 빨리" 실행한다는 의미이다. 예를 들어 IE에서 최소 시간 간격은 15밀리초이다.*

### 4-2) 웹워커

웹워커는 브라우저 내에서 백그라운드 스레드를 제공한다. 복잡한 계산을 분리된 파일, 예를 들어 my_web_worker.js에 두고, 메인프로그램(페이지)에서 다음과 같이 호출한다.

``` js
var ww = new Worker('my_web_worker.js');
ww.onmessage = function (event) {
  document.bod.innerHTML += '<p>백그라운 스레드 메시지: ' + event.data + "</p>";
};
```

웹워커 소스는 다음과 같이 간단한 산술 연산을 1e8(1억)번 반복한다.

``` js
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
```

웹워커는 `postMessage()` 메서드로 호출자(메인페이지)와 통신하며 호출자는 `onmessage` 이벤트를 구독해 변경 내역을 받는다. `onmessage` 콜백 함수는 이벤트 객체를 인자로 받는다. 이 이벤트 객체는 `data`프로퍼티를 가지는데, 웹워커가 넘겨주는 어떤 데이터든지 그 값으로 지정될 수 있다. 이와 비슷하게 호출자는 `ww.postMessage()`를 사용해 웹워커에게 데이터를 전달할 수 있고, 웹워커는 `onmessage`콜백을 사용해서 그 메시지들을 구독할 수 있다.

## 5. 원격 스크립팅

### 5-1) XMLHttpRequest

XMLHttpRequest는 자바스크립트에 HTTP 요청을 생성하는 특별한 객체(생성자 함수)로, 현재 대부분의 브라우저에서 사용 가능하다. HTTP 요청을 만드는 과정은 세 단계로 이뤄진다.

1. XMLHttpReuqest 객체(XHR)를 설정한다.
2. 응답 객체의 상태가 변경될 때 알림을 받기 위한 콜백 함수를 지정한다.
3. 요청을 보낸다.

``` js
// 첫번째 단계 (IE7 이하는 XHR 기능이 ActiveX로 구현되어 있어 별도 처리 필요)
var xhr = new XMLHttpRequest();

// 두번째 단계
xhr.onreadystatechange = handleResponse;
```

마지막 단계에는 `open()`과 `send()` 두 메서드를 사용해 요청을 보낸다. `open()` 메서드는 GET이나 POST같은 HTTP요청 방식과 URL을 설정한다. `send()` 메서드에는 POST 데이터를 인자로 전달하고 GET 방식인 경우 빈 문자열을 인자로 전달한다. `open()`의 마지막 매개변수로 요청의 비동기 여부를 지정한다.(true)

``` js
xhr.open("GET", "page.html", true);
xhr.send();
```

다음 예제는 새로운 페이지의 내용을 가져와서 현재 페이지에 업데이트한다.

``` js
document.getElementById('go').onclick = function () {

  var i, xhr, activeXids = [
      'MSXML2.XMLHTTP.3.0',
      'MSXML2.XMLHTTP',
      'Microsoft.XMLHTTP'
  ];

  if (typeof XMLHttpRequest === "function") { // native XHR
      xhr =  new XMLHttpRequest();
  } else { // IE before 7
      for (i = 0; i < activeXids.length; i += 1) {
          try {
              xhr = new ActiveXObject(activeXids[i]);
              break;
          } catch (e) {}
      }
  }

  xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
          return false;
      }
      if (xhr.status !== 200) {
          alert("Error, status code: " + xhr.status);
          return false;
      }
      document.body.innerHTML += "<pre>" + xhr.responseText + "<\/pre>";
  };

  xhr.open("GET", "page.html", true);
  xhr.send("");

};
```

* IE6 이하 버전을 지원하기 위해서 `ActiveX` 식별자 목록(activeXids)을 순회하여 최신 버전부터 가장 오래된 버전까지 `try-catch` 블록으로 감싸 객체 생성을 시도
* 콜백 함수는 `xhr` 객체의 `readyState` 프로퍼티를 확인. 0~4까지 상태값을 가지며 4는 '완료'되었음을 의미한다. 아직 완료되지 않은 상태 값을 가지면, 다음 `readystatechange` 이벤트가 발생할때까지 계속 대기한다.
* 콜백 함수는 `xhr` 객체의 `status` 프로퍼티도 확인한다. 이 프로퍼티는 HTTP 상태코드에 상응한다. 200(OK), 404(Not found) 값을 가진다. 오직 200 응답코드에서만 반응한다.
* 예제 코드는 요청을 생성할 때마다 `XHR` 객체의 생성 방법을 재확인한다. 앞선 장에서 다루었던 패턴(초기화 시점 분기)을 이용해서 단 한번만 확인하도록 변경할 수 있다.

### 5-2) JSONP

JSONP(JSON with padding

`XHR`과 달리 브라우저의 동일 도메인(Cross-Domain) 정책의 제약을 받지 않는다. 따라서, 서드파티 사이트에서 데이터를 로딩할 수 있으므로 보안 측면에서의 영향을 고려하여 신중하게 사용해야 한다.

다음과 같은 종류의 문서가 `XHR` 요청에 대한 응답이 될 수 있다.

* XML 문서(예전에 많이 사용)
* HTML 조각(꽤 일반적으로 사용)
* JSON 데이터 (가볍고 편리하다)
* 간단한 텍스트 파일 또는 다른 파일

`JSONP` 요청에 대한 응답 데이터는 주로 `JSON`을 함수 호출로 감싼 형태다. 호출될 함수의 이름은 요청할 때 함께 전달된다.

예를 들어 `JSONP` 요청 URL은 보통 다음과 같은 형태다.

`http://example.org/getdata.php?callback=myHandler`

`getdata.php`는 웹페이지가 될 수도 있고 스크립트가 될 수도 있다.
`callback`매개변수에는 응답을 처리할 자바스크립트 함수를 지정한다.

요청 URL은 다음과 같이 동적으로 생성된 `<script>` 엘리먼트에 로드된다.

``` js
var script = document.createElement("script");
script.src = url;
document.body.appendChild(script);
```

서버는 `JSON` 데이터를 콜백 함수의 인자로 전달해 응답한다. 최종적으로 이 스크립트가 실제로 페이지에 삽입되면, 다음과 같이 콜백 함수가 호출된다.

`myHandler({"hello": "world"});

#### JSONP 예제: Tic-tac-toe

`ttt`객체는 `ttt.played`에 채워진 셀의 목록을 계속 가지고 있으면서, 이 목록을 서버에 전송한다. 서버는 전송받은 목록에 포함된 숫자를 제외한 새로운 숫자를 반환한다. --- ???


#### 프레임과 이미지 비컨(Image Beacons)

원격 스크립팅을 위한 또 다른 방법으로 프레임을 사용하는 방법이 있다. 자바스크립트로 `iframe`을 생성하고 `src`에 URL을 지정하는 방식이다. 이 URL에는 데이터나 iframe 외부의 부모 페이지를 업데이트하는 함수 호출을 포함할 수 있다.

원격 스크립틍의 가장 간단한 형태는 서버에 데이터를 보내기만 하고 응당을 필요로 하지 않는 것이다. 이런 경우에는 새로운 이미지를 만들고 이미지의 src를 서버의 스크립트로 지정하면 된다.

`new Image().src = "http://example.org/some/page.php";

이 패턴을 이미지 비컨이라 부른다. 이 패턴은 서버에 로그를 남길 목적으로 데이터를 전송할 때, 예를 들면 방문자 통계를 수집하고자 할 때 유용하다. 비컨은 응답이 필요 없기 때문에 일반적으로 서버는 1x1픽셀 크기의 GIF 이미지를 보낸다.(안티패턴) 이보다 "204 No Content" HTTP 상태코드를 보내는 것이 더 좋다.(응답에 헤더만 있고 클라이어튼에게 되돌려 줄 바디가 없다는 뜻)


## 6. 자바스크립트 배포

### 6-1) 스크립트 병합

빠르게 로딩되는 페이지를 위한 방법

* 가능한 외부 자원의 수를 줄인다.
  * HTTP 요청은 비용이 많이 들기 떄문에 외부 스크립트 파일을 병합하면 페이지 로딩시간을 크게 줄일 수 있다.
  * 작은 용량에 파일 여러개 다운로드보다 요청하는 HTTP 부하가 더 크다. 이러한 파일들을 하나로 합치는것 좋다.

* **단점**
  - 파일을 병합하면 디버깅이 어려워지기 때문에 개발 단계가 아닌 출시 직전에 해야한다.
  - 출시 준비에 한 단계가 추가된다. 하지만 이는 쉽게 자동화할 수 있으며 커맨드 라인에서도 수행할 수 있다.
    `cat jquery.js jquery.quickselect.js jquery.limit.js > all.js`
  - 캐싱으로 인한 이득을 보지 못할 수도 있다. 여러 파일 중 파일 하나만 약간 수정하더라도 전체 캐싱을 무효화하게 된다.-----?(다시 전체 파일 다운받는다는건가..) 따라서 큰 프로젝트인 경우 출시 일정을 두고 운영하거나 두 개의 묶음, 즉 수정 가능성이 있는 묶음과 거의 변경되지 않은 '코어'묶음으로 구성하는 것이 좋다.
  - all_20100426.js와 같은 타임스탬프나 파일 내용의 해시를 이용하는 것처럼 묶음을 구성하기 위한 명명 규칙 또는 버전 지정 패턴을 정할 필요가 있다.(이름이 길어지고 많아지는건가??)

### 6-2) 코드 압축과 gzip 압축

* 평균적으로 파일 크기를 50퍼센트 줄일 수 있다.
* 스크립트 파일은 항상 `gzip`압축을 적용해 전송해야 한다.(70퍼센트 작게 만든다.)
* 코드 압축 및 `gzip` 압축을 모두 적용하면 사용자는 이전 용량의 15퍼센트 정도만을 다운로드 하게 될것이다.

`.htacess` 아파치 설정 파일 수정

### 6-3) Expires 헤더

파일은 브라우저 캐시에 생각보다 오래 머물지 않는다. 다시 접속하는 사용자들을 위해 `Expires` 헤더를 적용하여 파일들이 캐시될 확률을 높여야 한다.

`.htacess` 아파치 설정 파일 수정

단점은 파일을 수정하고 배포하려면 파일의 일므을 바꾸어야 한다. 하지만 파일 병알 위해 명명 규칙을 이미 정했다면 문제가 되지 않을 것이다.

### 6-4) CDN 사용

CDN(Content Delivery Network)은 콘테츠 전송 네트워크를 말한다. 세계 곳곳의 서로 다른 여러 데이터 센터에 파일의 복사본들을 배치하여, 동일한 `URL`을 유지하면서도 더 빨리 사용자에게 전송해 준다. 유료 호스팅이며 비싸다.
CDN의 이점을 무료로 누릴 수 있는 방법

* 구글은 인기있는 오픈소스 라이브러르들을 `CDN`으로 제공하여 무료로 링크해서 사용 가능
* 마이크로소프트는 `jQuery`와 자사 `Ajax` 라이브러리들을 제공한다.
* 야후는 `YUI` 라이브러리를 `CDN`으로 제공한다.

## 7. 로딩 전략

웹 페이지에 스크립트를 포함시키는 방법은 간단하다. 인라인 자바스크립트 또는 src 속성에 링크를 지정하면 된다.

``` js
// 인라인
<script>
  console.log('test');
</script>

// src 속성에 링크를 지정
<srcipt src="external.js"></script>
```

`<script>` 엘리먼트의 일반적인 속성을 살펴보자.

**`language="JavaScript`** : 사용할 필요가 없다. `<script>` 엘리먼트를 쓰는것으로 암묵적으로 자바스크립트의 사용을 의미
**`type="text/javascript"`** : 마크업 유효성 검사를 통과하가 위해서가 아니라면 사용할 필요 없다. (`HTML4, XHTML1`) 표준에서는 필수 속성이지만, 반드시 있어야 하는 것은 아니다.
**`defer`** : 폭 넓게 지원되진 않지만 `defer` 속성을 사용하면 외부스크립트 파일을 다운로드하는 동안 나머지 부분의 다운로드가 차단되는 현상을 피할 수 있다. (HTML5에는 조금 더 개선된 `async` 속성이 도입되었다.) 이 현상에 대한 내용은 이후에...

## 7-1) `<script>`엘리먼트의 위치

* `<script>`엘리먼트는 페이지 다운로드의 진행을 차단한다. 브라우저는 여러 개의 요소들을 동시에 다운로하는데, 외부 스크립트 만나면 해당 스크립트가 다운로드되고 파싱되어 실행될 때까지 나머지 파일의 다운로드를 중단한다. 이 때문에 전체 페이지를 로드하는데 걸리는 시간이 길어지며 특히 이런 현상이 여러 번 발생할 경우 더욱 심해진다.
* 다운로드 차단 현상을 최소화하기 위해서는 `<script>` 엘리먼트를 `</body>` 태그 바로 앞에 위치시킨다. 이렇게 하면 다운로드가 차단될 만한 다른 리소스가 사라진다.
* 최악은 `head`의 선언하는 것이다.

## 7-2) HTTP Chunked 인코딩 사용

HTTP 프로토콜은 소위 chunked 인코딩을 지원한다. 이를 이용해 페이지를 몇 조각으로 나누어 전송할 수 있다. 복잡한 페이지에 적용하면 서버측 작업이 완전히 끝날 때까지 기다릴 필요 없이, 상대적으로 정적인 페이지 상단부분을 먼저 전송하기 시작할 수 있다.

``` html
<!doctype html>
<html>
<head>
  <title>test</title>
  <script src="js.js"></script>
</head>
<!-- 첫번째 조각의 끝 -->
<body>
<!-- 두번째 조각의 끝 -->
  <script src="jstest.js"></script>
</body>
<!-- 세번째 조각의 끝 -->

```


## 7-3) 다운로드를 차단하지 않는 동적인 `<script>` 엘리먼트

* `XHR`요청으로 스크립트를 로딩한 다음 응답 문자열에 `eval()`을 실행시키는 방법. 동일 도메인 제약이 따르고 그 자체로 안티패티인 `eval()`을 사용해야 한다는 단점이 있다.
* `defer`와 `async`속성을 사용하는 방법, 일부 브라우저에서만 동작한다.
* `<script>`엘리먼트를 동적으로 생성하는 방법 - 가장 쓸만함

`JSONP`에서 논했던 것과 비슷하게, 새로운 `script` 엘리먼트를 생성하고, `src` 속성을 지정해 페이지에 붙인다.

다음은 다른 파일의 다운로드를 차단하지 않고 자바스크립트 파일을 비동기적으로 로드하는 예다.

``` js
var script = document.createElement("script");
script.src = "all_20170912.js";
document.documentElement.firstChild.appendChild(script); // <head>에 추가
```

그러나 이 패턴을 적용하여 메인 .js 파일을 로드하는 동안에는, 이 파일에 의존하여 동작하는 다른 스크립트 엘리먼트를 쓸 수 없다는 단점이 있다. 비동기 방식이므로 언제 로드가 완료될지 보장할 수 없고, 뒤이어 선언된 스크립트가 아직 정의되지 않은 객체를 참조할 수 있기 때문이다.

이 문제를 해결하려면 모든 인라인 스크립트를 바로 실행하는 대신 배열 안의 함수로 모아두어야 한다. 그리고 나서 비동기로 `js`파일을 받고난 뒤 배퍼 배열 안에 모아진 모든 함수를 실행한다. 결국 이를 위해서는 세 단계를 거쳐야 한다.

* 첫번째로, 모든 인라인 코드를 저장해 둘 배열을 가능한 한 페이지의 최상단에 만든다.

``` js
var mynamespace = {
  inline_scripts: []
};
```

* 두번째로, 각 인라인 스크립트를 함수로 감싼 `inline_scripts` 배열에 넣는다.

``` js
// 수정 전 :
// <script>console.log("I am inline");</script>

// 수정 후 :
<script>
  mynamespace.inline_scripts.push(function () {
    console.log("I am inline");
  })
</script>
```

* 마지막은 비동기로 로드된 `js` 스크립트가 인라인 스크립트의 버퍼 배열을 순회하면서 배열안의 모든 함수를 실행한다.

``` js
  var i, scripts = mynamespace.inline_scripts, max = scripts. length;
  for ( i = 0; i < max; max +=1 ) {
    scripts[i]();
  }
```

## 7-4) `<script>`엘리먼트 붙이기

마크업을 직접 제어하고 있으면 문제가 없지만, 위젯이나 광고를 만들고 있고 어떤 구조의 페이지에 삽입될지 알 수 없다면 어떻게 해야 할까? 엄밀히 말하면 페이지에 `<head>` 태그나 `<body>` 태그가 없을 수도 있다.**하지만 `document.body`는 `<body>`없이도 대부분 확실히 동작하기 때문에 다음과 같이 처리할 수 있다.**

``` js
  document.body.appendChild(script);
```

사실 페이지에서 스크립트를 실행한다는 얘기는 최소한 하나의 스크립트 태그가 존재한다는 뜻이다. 인라인 엘리먼트든 외부 파일이든 스크립트 태그가 하나도 없다면 코디는 실행될 수 없을 것이다. 이 사실을 이용해보자.

``` js
var first_script = document.getElementByTagName('script')[0];
first_script.parentNode.insertBefore(script, first_script); // script랑 first_script 순서 변경
```

위에서 `first_script`는 페이지 내에 존재하는 스크립트 엘리먼트고, `script`는 새로 생성한 스크립트 엘리먼트다.

## 7-5) 게으른 로딩

게으른 로딩은 외부 파일을 페이지의 `load` 이벤트 이후에 로드하는 기법을 말한다. 대체로 큰 묶음의 코드를 다음과 같이 두 부분으로 나누는 것이 유리하다.

* 페이지를 초기화하고 이벤트 핸들러를 UI 엘리먼트에 붙이는 핵심 코드를 첫 번째 부분으로 정한다. --? (대메뉴, 아코디언같은거?)
* 사용자 인터랙션이나 다른 조건들에 의해서만 필요한 코드를 두 번째 부분으로 나눈다. --? (클릭 이벤트?)

게으른 로딩의 목적은 페이지를 점진적으로 로드하고 가능한 빨리 무언가를 동작히켜 사용할 수 있게 하는 것이다. 나머지는 사용자가 페이지를 살펴보는 동안 백그라운드에서 로드한다.

두 번째 부분을 로딩하기 위해 스크립트 엘리먼트를 `head`나 `body`에 붙이는 방법을 다시 사용한다.

``` js
//..페이지 전체 본문...

<!-- 두번째 조각  끝 -->
<script src = "all_2017.js"></script>
<script>
window.onload = function () {
  var script = document.createElement("script");
  script.src = "all_lay_201640.js";
  document.documentElement.fistChild.appendChild(script);
}
</script>
</body>
</html>
<!-- 세번째 조각 끝 -->
```

대부분의 애플리케이션에서 게으른 로딩이 적용되는 코드의 크기가 핵심 코드에 비해 큰데, 그 이유는 흥미로운 '동작'(드래그앤드랍, XHR, 애니메이션 같은)은 핵심코드를 초기화한 이후에만 발생하기 때문이다.

## 7-6) 주문형 로딩

게으른 로딩 패턴은 추가 자바스크립트 코드를 사용할 가능성이 높다고 가정하고 페이지 로드 후 무조건 로드한다.
여러개의 탭(클릭하면 XHR요청 및 내용 갱신 등....하는 탭)을 가진 사이드바가 있는데 만약 한번도 클릭이 되지 않을 수가 있다.
이럴때 주문형 로딩 패턴을 적용하면 된다.

로드할 스크립트의 파일명과, 이 스크립트가 로드된 후에 실행될 콜백 함수를 받는 `require()`함수는 다음과 같다.

``` js
require("extra.js", function() {
  functionDefinedInExtraJS();
});
```

이 함수 구현 방법을 살펴보자. 추가 스크립트를 요청하기는 간단하다. 동적 `<script>`엘리먼트 패턴을 사용한다. 브라우저간의 차이점 때문에 스크립트가 언제 로드되었는지를 알아내기는 약간 까다롭다.

``` js
function require(file, callback) {
  var script = document.getElementsByIdTagName('script')[0],
      newjs = document.createElement('script');

  // IE
  newjs.onreadystatechange = function () {
    if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
      newjs.onreadystatechange = null;
      callback();
    }
  };

  // 그외 브라우저
  newjs.onload = function () {
    callback();
  };

  newjs.src = file;
  script.parentNode.insertBefore(newjs, script);
}
```

* IE에서는 `readystatchange` 이벤트를 구독하고 `readyState` 값이 "loaded" 또는 "complete"인지 확인한다. 다른 모든 브라우저는 이를 무시한다.
* 파이어폭스, 사파리, 오페라에서는 onload 프로퍼티로 load 이벤트를 구독한다.
* 이 방법은 Safari 2버전에서는 동작하지 않는다. 이 브라우저도 지원해야 한다면 특정변수(추가적인 파일에서 선언된거)가 정의되었는지를 반복적으로 확인하도록 타이머로 시간 간격을 설정해야 한다. 정의가 되었다면, 새로운 스크립트가 로드되고 실행되었다는 뜻이다.

네트워크 지연을 흉내내기 위해 인위적으로 지연시킨 `ondemnad.js.php`라는 스크립트를 생성하여 구현을 테스트할 수 있다.

``` php
<?php
  header('Content-Type: application/javascript');
  sleep(1);
?>
function extraFunction(logthis) {
  console.log('loaded and executed');
  console.log(logthis);
}
```

require() 함수 테스트

``` js
require('ondemand.js.php', function () {
  extraFunction('loaded from the parent page');
  document.body.appendChild(document.createTextNode('done!'));
});
```

## 7-7) 자바스크립트 사전 로딩

게으른 로딩, 주문형 로딩 패턴은 현재 페이지에 필요한 스크립트를 페이지 로드 이후에 로드한다. **하지만 현재 페이지에서는 필요하지 않지만 다음으로 이동하게 될 페이지에서 필요한 스크립트를 미리 로드할 수도 있다.** 이 방법은 두 번째 페이지에 도착했을때 미리 다운로드가 완료되어 더 빠른 속도를 경험하게 된다.

스크립트가 이미 두 번째 페이지에서 실행되고 있다고 간주하여 에러가 발생할 수 있다. 예를 들어 특정 DOM 노드를 찾으려 한다면 에러가 발생할 것이다.

스크립트가 파싱되거나 실행되지 않게 로드할 수도 있다. 이 방법은 CSS나 이미지파일에도 적용할 수 있다.

IE에서는 이미지 비컨 패턴

`new Image().src = "preloadme.js";

IE이외의 브라우저에서는 스크립트 엘리먼트 대신에 `<object>` 엘리먼트를 사용하고 `data` 속성 값에 로드할 스크립트의 URL을 가리키도록 지정하면 된다.

``` js
var obj = document.createElement('object');
obj.data = "preloadme.js";
document.body.appendChild(obj);
```

`<object>`가 브라우저에 보이지 않게 하기 위해 width, height 값도 0으로 설정
범용의 `preload()` 함수나 메서드를 만들고 초기화 시점 분기 패턴(4장)으로 브라우저간의 차이를 처리할 수도 있다.

``` js
var preload;
if (/*@cc_on!@*/false) { //조건 주석문으로 IE를 탐지
  preload = function (file) {
    new Image().src = file;
  };
} else {
  preload = function (file) {
    var obj = document.createElement('object'),
    body = document.body;
    obj.width = 0;
    obj.height = 0;
    obj.data = file;
    body.appendChild(obj);
  };
}

preload('my_web_worker.js');
```

이 패턴의 단점은 사용자 에이전트 탐지 코드를 포함한다는 것이다. 이 경우에는 기능 탐지로는 브라우저의 동작을 충분히 알 수 없기 때문에 불가피한 경우에만 사용해야 한다. 예를 들어 이 패턴에서 이론적으로 `typeof Image`가 "function"인지 확인하고 이를 기능 탐지 대신 사용할 수 있다. 하지만 모든 브라우저가 `new Image()`를 지원하기 때문에 해결책이 될 수 없다. 어떤 브라우저는 이미지를 위한 별도의 캐시를 가지고 있어서, 이미지 비컨으로 사전 로딩한 스크립트나 요소들을 캐시에서 가져와 사용하지 않고 이동한 페이지에서 다시 다운로드하기도 한다.
## 8.
