## 5. 즉시 실행 함수

> 즉시 실행 함수 패턴은 함수가 선언되자마자 실행되도록 하는 문법

``` js
(function () {
  alert('watch out!');
}());
```

이 패턴은 사실상 (기명이든 무명이든) 함수 표현식을, 생성한 직후 실행시킨다.

즉시 실행 함수 패턴은 다음의 부분들로 구성

* 함수를 함수 표현식으로 선언한다. (함수 선언문으로는 동작하지 않는다.)
* 함수가 즉시 실행될 수 있도록 마지막에 괄호쌍을 추가한다.
* 전체 함수를 괄호로 감싼다. (함수를 변수에 할당하지 않을 경우에만 필요하다.)

``` js
// 이런 패턴도도 있지만 위에 패턴을 JSlint가 선호한다.
(function () {
  alert('watch out!');
})();
```

이 패턴은 초기화 코드에 유효범위 `샌드박스(sandbox)`를 제공한다는 점에서 유용하다.
페이지가 로드가 완료된 후, 이벤트 핸들러를 등록하거나 객체를 생성하는 등의 초기 설정 작업을 해야 한다. 이 작업은 단 한번만 실행되므로 재사용하기위해 이름이 지정된 함수를 생성할 필요가 없다. 하지만 한편으로는 초기화 단계가 완료될 때까지 사용할 임시 변수들이 필요하다.

``` js
(function () {

  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today = new Date(),
    msg = 'Today is ' + days[today.getDay()] + ', ' + today.getDate();

  console.log(msg); // "Today is 요일, 날짜"
}());
```

즉시 실행 함수로 감싸져 있지 않는다면 `days, today, msg`는 전역 변수가 되어 초기화 코드 이후에도 남아 있다.

### 5-1) 즉시 실행 함수의 매개변수

즉시 실행 함수도 인자를 전달 할 수 있다.

``` js
(function (who, when) {
  console.log("I met " + who + " on " + when);
}("Joe Black", new Date())); // I met Joe Black on Tue Jul 11 2017 23:10:10 GMT+0900 (대한민국 표준시)
```

일반적으로 전역 객체가 즉시 실행 함수의 인자로 전달된다. 따라서 즉시 실행 함수 내에서 `window`를 사용하지 않고도 전역 객체에 접근할 수 있다.

``` js
(function (global) {
  // 전역 객체를 'global'로 참조
}(this));
```

즉시 실행 함수는 인자를 많이 넣는것이 좋지 않다. 위 아래를 왔다 갔다 하기 때문(번거롭다.)

### 5-2) 즉시 실행 함수의 반환 값

다른 함수와 비슷하게, 즉시 실행 함수도 값을 반환할 수 있고 반환된 값은 변수에 할당될 수 있다.

``` js
var result = (function () {
  return 2 + 2;
}()); // 4
```

감싸고 있는 괄호를 생략해서 같은 동작을 구현할 수 있다. 즉시 실행 함수의 반환 값을 변수에 할당할 때는 괄호가 필요 없기 때문이다. 첫 번째 괄호쌍을 생략하면 다음과 같은 형태가 된다.

``` js
var result = function() {
  return 2 + 2; // 4
}();

// 이 예제는 마지막 괄호를 보지 못하면 이 구문의 결과가 함수를 참조한다고 생각할 수 있다.
```

``` js
var result = (function () {
  return 2 + 2;
})(); // 4

// 이것도 같은 결과
```

원시 데이터 값 외에도 모든 타입의 값이 가능, 새로운 함수도 반환 가능
즉시 실행 함수의 유효범위를 사용해 특정 데이터를 비공개 상태로 저장하고 반환되는 내부 함수에서만 접근하도록 할 수도 있다.

``` js
var getResult = (function () {
  var res = 2 + 2;
  return function () { // 함수 반환(클로저)
    return res;
  };
}());
```

위 예제 함수는 즉시 실행 함수에서 미리 계산하여 클로저에 저장해둔 `res`라는 값을 반환

즉시 실행 함수는 객체 프로퍼티를 정의할 때에도 사용
어떤 객체의 프로퍼티가 객체의 생명주기 동안에는 값이 변하지 않고 처음에 값을 정의할 때는 적절한 계산을 위한 작업이 필요하다고 가정해보자.

``` js
var o = {
  message: (function() {
    var who = "me",
      what = "call";
    return what + " " + who;
  }()),
  getMsg: function () {
    return this.message;
  }
};
// 사용 방법
o.getMsg(); // "call me"
o.message(); // "call me"
```

이 예제에서, `o.message`는 함수가 아닌 문자열 프로퍼티이지만 값을 정의하려면 함수가 필요하다.이 함수는 스크립트가 로딩될 때 실행되어 프로퍼티를 정의한다.

### 5-3) 장점과 사용 방법

* 전역 변수를 남기지 않고 상당량의 작업을 할 수 있게 해준다.
* 선언된 모든 변수는 스스로를 호출하는(self-invoking)함수의 지역 변수가 되기 때문에 임시 변수가 전역 공간을 어지럽힐 걱정을 하지 않아도 된다.

> 즉시 실행 함수 패턴은 다른 말로 자기 호출(self-invoking) 또는 자기 실행(self-excuting) 함수라고 부른다. 그 이유는 함수 자신이 선언됨과 동시에 실행되기 때문

* 이 패턴은 북마클릿(bookmarklet)에서도 자주 쓰인다.
* 즉시 실행 함수 패턴을 사용해 개별 기능을 독자적인 모듈로 감쌀 수 있다.
  * 예를 들어 점진적인 개선의 측면에서 약간의 코드를 추가해 페이지에 기능 추가할려고 한다. 이 코드(또는 모듈이나 기능)를 즉시 실행 함수로 감싸고 페이지에 추가된 코드가 있을 때와 없을때 잘 작동하는지 확인한다. 그리고 더 많은 개선 사항을 추가, 제거 개별로 테스트할 수도 있고, 사용자가 비 활성화할 수 있게 하는 등의 작업을 할 수 있다.

다음 템플릿을 활용하면 기능을 단위별로 정의할 수 있다. 이것을 module1이라고 부르자.

``` js
// module1.js에서 정의한 module1
(function () {
  // 모든 module1 코드 ...
}());
```

이 템플릿을 따라 또 다른 모듈로 코딩할 수 있다. 그리고 실제 사이트에 코드를 올릴 때, 어떤 기능이 사용될 준비가 되었는지 결정하고 빌드 스크립트를 사용해 해당하는 파일들을 병합하면 된다.

## 6. 즉시 객체 초기화

> 전역 유효범위가 난잡해지지 않도록 보호하는 또 다른 방법을 앞서 설명한 즉시 실행 함수 패턴과 비슷한 즉시 객체 초기화 패턴이다.

이 패턴은 객체가 생성된 즉시 `init()` 메서드를 실행해 객체를 사용한다. `init()` 함수는 모든 초기화 작업을 처리한다.

``` js
({
  // 여기에 설정 값(설정 상수)들을 정의할 수 있다.
  maxwidth: 600,
  maxheight: 400,

  // 유틸리티 메서드 또한 정의 할수 있다.
  gimmeMax: function () {
    return this.maxwidth + "x" + this.maxheight;
  },

  // 초기화
  init: function () {
    console.log(this.gimmeMax());
    // 더 많은 초기화 작업들...
    // return this; 추가해서 객체의 참조를 유지하고 싶은데 테스트 하는 방법은???
  }
}).init();
```

문법적인 면에서 이 패턴은 객체 리터러를 사용한 일반적인 객체 생성과 똑같이 생각하면 된다. 객체 리터럴도 괄호(그룹연산자)로 감싸는데, 이는 자바스크립트 엔진이 중괄호를 코드 블록이 아니라 객체 리터럴로 인식하도록 지시하는 역할을 한다. 그런 다음 닫는 괄호에 이어 `init()` 메서드를 즉시 호출한다.

객체만 괄호로 감싸는 게 아니라 객체와 `init()` 호출 전체를 괄호 안에 넣을 수도 있다.

``` js
({...}).init();
({...}.init());
```

*이 패턴의 장점은 즉시 실행 함수 패턴의 장점과 동일하다.*

* 단 한번의 초기화 작업을 실행하는 동안 전역 네임스페이스를 보호할 수 있다.
* 코드를 익명 함수로 감싸는 것과 비교하면 이 패턴은 문법적으로 신경써야 할 부분이 좀더 많은 것처럼 보일 수도 있다.
* 그러나 초기화 작업이 복잡하다면 전체 초기화 절차를 구조화는데 도움이 된다.
* 예를 들어 비공개 도우미 함수들을 임시 객체의 프로퍼티로 정의하면, 즉시 실행 함수를 여기저기 흩어 놓고 쓰는 것보다 훨씬 구분하기 쉽다.

#### 단점

* 대부분의 자바스크립트 압축 도구가 즉시 실행 함수 패턴에 비해 효과적으로 압축하지 못할 수도 있다는 것이다.
* 비공개 프로퍼티와 메서드의 이름은 더 짧게 변경되지 않는데 압축 도구의 관점에서는 그런 방식이 안전하기 떄문이다.
* 책을 쓰는 시점(2011) 구글의 클로저 컴파일러의 고급(advanced) 모드만이 즉시 초기화되는 객체의 프로퍼티명을 단축시켜준다.

> 이 패턴은 주로 일회성 작업에 적합하다. `init()`이 완료되고 나면 객체에 접근할 수 없다. `init()`이 완료된 이후에도 객체의 참조를 유지하고 싶다면 `init()`의 마지막에 return this;를 추가하면 된다.

### 7. 초기화 시점의 분기

> 초기화 시점의 분기(로드타임 분기)는 최적화 패턴이다. 어떤 조건이 프로그램의 생명주기 동안 변경되지 않는게 확실할 경우, 조건을 단 한 번만 확인하는 것이 바람직하다. 브라우저 탐지(또는 기능 탐지)가 전형적인 예다.

예를 들어, `XMLHttpRequest`가 내장 객체로 지원되는 걸 확인했다면, 프로그램 실행 중에 브라우저가 바뀌어 난데없이 ActiveX 객체를 다루게 될 리는 없다. 실행 환경은 변하지 않기 때문에, 코드가 XHR 객체를 지원하는지 매번 다시 확인할 필요가 없다. (확인해도 같은 값)

`DOM`엘리먼트의 계산된 스타일을 확인하거나 이벤트 핸들러를 붙이는 작업도 초기화 시점 분기 패턴의 이점을 살릴 수 있는 또 다른 후보들이다. 대부분 개발자들은 이벤트 리스너를 등록하고 해제하는 메서드를 가지는 다음과 같은 유틸리티를 작성해 보았을 것이다.

``` js
var utils = {
  addListener: function (el, type, fn) {
    if(typeof window.addEventListener === 'function') {
        el.addEventListener(type, fn, false);
    } else if (typeof document.attachEvent === 'function') { // IE
        e.attachEvent('on' + type, fn);
    } else { // 구형 브라우저
        el['on' + type] = fn;
    }
  },
  removeListener: function (el, type, fn) {
    // 거의 동일한 코드..
  };
```

위 코드는 비효율적이다. `utils.addListener() 나 utils.removeListener()`를 호출할 때마다 똑같은 확인 작업이 반복해서 실행된다.

초기화 시점 분기를 이용하면, 처음 스크립트를 로딩하는 동안에 브라우저 기능을 한 번만 확인한다. 확인과 동시에 함수가 페이지의 생명주기 동안 어떻게 동작할지를 재정의한다. 다음은 초기화 시점 분기에 대한 접근법을 보여주는 예제다.

``` js
// 변경 이후

// 인터페이스
var utils = {
  addListener: null,
  removeListener: null
};

// 구현
if (typeof window.addEventListener === 'function') {
  utils.addListener = function (el, type, fn) {
    el.addEventListener(type, fn, false);
  };
  utils.removeListener = function (el, type, fn) {
    el.removeEventListener(type, fn, false);
  };
} else if (typeof document.attachEvent === 'function') { //IE
  utils.addListener = function (el, type, fn) {
    el.attachEvent('on' + type, fn);
  };
  utils.removeListener = function (el, type, fn) {
    el.detachEvent('on' + type, fn);
  };
} else { // 구형 브라우저
  utils.addListener = function (el, type, fn) {
    el['on' + type] = fn;
  };
  utils.removeListener = function (el, type, fn) {
    el['on' + type] = null;
  };
}
```

#### 브라우저 탐지에 대한 주의사항

이 패턴을 사용할 때 브라우저의 기능을 섣불리 가정하지 말아야 한다.
예를 들어, 브라우저가 `window.addEventListener`를 지원하지 않는다고 해서 이 브라우저가 IE이고 `XMLHttpRequest`도 지원하지 않을 거라고 가정해서는 안된 다는 얘기다. 어떤 버전에서는 네이티브로 지원했으나 현재는 지원하지 않을 수도 있다.
`addEventListener`와 `removeEventListener`와 같이 여러 기능이 함께 지원되는지를 확인하여 더 안전하게 가정하는 방법도 있지만, 일반적으로 브라우저 기능은 독립적으로 변한다.

**가장 좋은 전략은 초기화 시점의 분기를 사용해 기능을 개별적으로 탐지하는 것이다.**

## 8. 함수 프로퍼티 - 메모이제이션(Memoization) 패턴

> 함수는 객체이기 때문에 프로퍼티를 가질 수 있다. 사실 함수는 처음부터(생성될 때 부터) 프로퍼티와 메서드를 가지고 있다.

예를 들어, 각 함수는 어떤 문법으로 생성하면 자동으로 `length`프로퍼티를 가진다. 이 프로퍼티는 함수가 받는 인자의 개수를 값으로 가진다.

``` js
function func(a, b, c) {}
console.log(func.length); // 3
```

언제든지 함수에 사용자 정의 프로퍼티를 추가할 수 있다. 함수에 프로퍼티를 추가하여 결과(반환 값)을 캐시하면 다음 호출 시점에 복잡한 연산을 반복하지 않을 수 있다. 이런 활용 방법을 ***메모이제이션 패턴***이라고 한다.

``` js
  var myFunc = function (param) {
    if (!myFunc.cache[param]) {
      var result = {};
      // ... 비용이 많이 드는 수행 ...
      myFunc.cache[param] = result;
    }
    return myFunc.cache[param];
  }

  // 캐시 저장공간
  myFunc.cache = {};
```

위 예제는 `myFunc`함수에 `cache`프로퍼티를 생성한다.
`cache`프로퍼티는 함수로 전달된 `param` 매개변수를 키로 사용하고 계산의 결과를 값으로 가지는 객체(해시)다. 결과 값은 필요에 따라 복잡한 데이터 구조로 저장할 수 있다.

`myFunc`함수가 `param`이라는 단 하나의 매개변수를 받는다고 가정한다. 이 매개변수는 문자열과 같은 원시 데이터 타입이라고 가정한다. 만약 더 많은 매개변수와 더 복잡한 타입을 갖는다면 일반적으로 직렬화하여 해결할 수 있다.
예를들어, 객체 인자를 `JSON` 문자열로 직렬화하고 이 문자열을 `cache` 객체에 키로 사용할 수 있다.

``` js
var myFunc = function () {
  var cachekey = JSON.stringify(
    Array.prototype.slice.call(argumnets)), result; // 배열 반환?

  if (!myFunc.cache[cachekey])   {
    result = {};
    // ... 비용이 많이 드는 수행 ...
    myFunc.cache[cachekey = result;
  }
  return myFunc.cache[cachekey];
};
```
