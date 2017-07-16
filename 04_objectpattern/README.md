# Chapter4 객체 생성 패턴

> 네임스페이스 패턴, 의존 관계 선언, 모듈 패턴, 샌드박스 패턴 등은 애플리케이션 코드를 정리하고 구조호할 수 있게 도와주고 암묵적 전역의 영향을 약화시킨다. 또한 비공개 멤버와, 특권 멤버, 공개비공개 스태틱 멤버, 객체 상수, 체이닝에 대해서도 다루고, 클래스와 비슷한 방식으로 생성자를 정의하는 방법도 하나 살펴 본다.

## 1. 네임스페이스 패턴

> 프로그램에서 필요로 하는 전역 변수의 개수를 줄이는 동시에 과도한 접두어를 사용하지 않고도 이름이 겹치지 않게 해준다.

전역 객체를 하나 만들고 모든 기능을 이 객체에 추가하면 된다.

``` js
// 수정 전 : 전역 변수 5개,
// 안티 패턴

// 생성자 함수 2개
function Parent() {}
function Child() {}
// 변수 1개
var some_var = 1;
// 객체 2개
var module1 = {};
module.data = {a:1, b:2};
var module2 = {};
```

리팩토링하기 위해 애플리케이션 전용 전역 객체 `MYAPP`을 생성 후 모든 함수와 변수들을 이 전역 객체 프로퍼티로 변경한다.

``` js
// 수정 후 전역 변수 1개,

// 전역 객체
var MYAPP = {};

// 생성자
MYAPP.Parent = function () {};
MYAPP.Child = function () {};

// 변수
MYAPP.some_var = 1;

// 객체 컨테이너(객체만을 담기 위한)
MYAPP.modules = {};

// 객체들을 컨테이너 안에 추가한다.
MYAPP.modules.module1 = {};
MYAPP.modules.module1.data = {a: 1, b: 2};
MYAPP.modules.module2 = {};
```

전역 네임스페이스 객체의 이름은 애플리케이션 이름, 라이브러리의 이름, 도메인명, 회사 이름 중에서 선택, 전역 객체 이름은 모두 대문자로 쓰는 명명 규칙 사용

**장점**

* 코드 내 이름 총둘 방지

**단점**

* 모든 변수, 함수에 접두어 붙혀야됨(용량 커짐)
* 전역 인스턴스가 단 하나뿐이므로 전역 인스턴스를 수정하면 나머지 기능들도 갱신된 상태를 물려 받는다.
* 이름이 중첩되고 길어지므로 프로퍼티 판별하기 위한 검색 작업도 길고 느려진다. 이 단점은 나중에 `샌드박스 패턴`으로 다룰 것이다.

### 1-1) 범용 네임스페이스 함수

프로그램 복잡도가 증가하고 코드의 각 부분들이 별개의 파일로 분리되어 선택적으로 문서에 포함되면 어떤 코드가 특정 네임스페이스나 그 내부의 프로퍼티를 처음으로 정의한다고 가정하기가 위험하다.(즉, 이미 존재할 수도 있으니 미리 살펴보자. 밸리데이션?)

``` js
// 위험!!
var MYAPP = {};
// 개선안
if (typeof MYAPP === "undefined") {
  var MYAPP = {};
}

// 또는 더 짧게 쓰기
var MYAPP = MYAPP || {};
```

MYAPP이 없으면 빈 객체 생생해라.
하지만, 추가 확인 작업때문에 상당량의 중복코드가 생겨 날수 있으므로 재사용 가능한 함수를 만들어 사용한다.(`namespace()`)

``` js
// 네임스페이스 함수 사용
MYAPP.namespace('MYAPP.modules.modules2');

// 위코드는 다음과 같은 결과를 반환

var MAYPP = {
  modules: {
    modeuls2: {}
  }
};
```

다음은 네임스페이스 함수를 구현한 예제

``` js
// debugger;
var MYAPP = MYAPP || {};

MYAPP.namespace = function (ns_string) {
  var parts = ns_string.split('.'),
      parent = MYAPP,
      i;

  // 처음에 중복되는 전역 객체명은 제거한다.
  if( parts[0] === "MYAPP") {
    parts = parts.slice(1); // MYAPP을 제외한 배열 반환
  }

  for (i = 0; i< parts.length; i += 1) {
    // 프로퍼티가 존재하지 않으면 생성한다.
    // 객체 대괄호 표기법 이용할때는 표현식이거나 예약어일때
    // 1. MYAPP.modules === undefined
    // 2. MYAPP.modules.module2 === undefined
    if (typeof parent[parts[i]] === 'undefined') {
      // 1. MYAPP.modules = {};
      // 2. MYAPP.modules.module2 = {};
      parent[parts[i]] = {};
    }
    // 1. parent = MYAPP.modules;
    // 2. parent = MYAPP.modules.module2;
    parent = parent[parts[i]];
  }
  return parent; // parent로 리턴하는 이유??
  //return MYAPP; ??
}
console.log(MYAPP.namespace('MYAPP.modules.module2'));
console.log(MYAPP);

// 반환 값을 지역 변수에 할당
var module2 = MYAPP.namespace('MYAPP.modules.module2');
module2 === MYAPP.modules.module2; // true

// 첫 부분의 'MYAPP'을 생략하고도 쓸 수 있다.
MYAPP.namespace('modules.module51');
```

## 2. 의존 관계 선언

> 자바스크립트 라이브러리들은 대게 네임스페이스를 지정하여 모듈화되어 있기 때문에, 필요한 모듈만 골라서 쓸 수 있다. 이 때 함수나 모듈 내 최상단에, 의존 관계에 있는 모듈을 선언하는 것이 좋다. **즉 지역 변수를 만들어 원하는 모듈** 을 가리키도록 선언

``` js
var myFunction = function () {
  // 의존 관계에 있는 모듈들
  var event = YAHOO.util.Event,
      dom = YAHOO.util.Dom;
  // 이제 event와 dom이라는 변수 사용
};
```

**장점**

* 의존 관계가 명시적으로 선언되어 있기 때문에 코드를 사용하는 사람이 페이지내에 반드시 포함시켜야 하는 스크립트 파일이 무엇인지 알 수 있다. (YAHOO를 보고 아는것???)
* `dom`과 같은 지역 변수는 `YAHOO`와 같은 전역 변수보다 언제나 더 빠르며 `YAHOO.util.DOM`처럼 전역 변수의 중첩 프로퍼티와 비교하면 더 말할 것도 없다.(`dom`이 `YAHOO`,`YAHOO.util.DOM`보다 더 빠르다??) 전역 객체 판별을 단 한번만 수행하고, 그다음 부터는 지역 변수 사용
* 고급 압축 도구는 지역 변수명에 대해서는 `event`를 `A`라는 글자 하나로 축약한다. 하지만 전역 변수명 변경은 위험하기 때문에 축약하지 않는다.(지역변수만 축약..?)

의존 관계 선언 패턴의 효과 비교

``` js
function test1() {
  alert(MYAPP.modules.m1);
  alert(MYAPP.modules.m2);
  alert(MYAPP.modules.m51);
}

// 압축된 test1의 본문
alert(MYAPP.modules.m1);alert(MYAPP.modules.m2);alert(MYAPP.modules.m51)

의존 관계 선언 패턴 사용
function test2() {
  var modules = MYAPP.modules;
  alert(modules.m1);
  alert(modules.m2);
  alert(modules.m51);
}

// 압축된 test2의 본문
var a = MYAPP.modules;alert(a.m1);alert(a.m2);alert(a.m51);
```

## 3. 비공개 프로퍼티와 메서드

> 다른 언어와 달리 자바스크립트에서는 `private, protected, public` 프로퍼티와 메서드를 나타내는 별도의 문법이 없다. 객체의 모든 멤버는 `public`, 즉 공개되어 있다.

``` js
var myobj = {
  myprop: 1,
  getProp: function () {
    return this.myprop;
  }
};
console.log(myobj.myprop); // myprop 공개
console.log(myobj.getProp()); // getProp() 공개
```

생성자 함수를 사용해 객체를 생성할 떄도 모든 멤버가 공개된다.

``` js
function Gadget() {
  this.name = 'iPod';
  this.stretch = function() {
    return 'iPad';
  };
}

var toy = new Gadget();
console.log(toy.name); 'name' 공개
console.log(toy.stretch()); 'stretch()' 공개
```

### 3-1) 비공개(private) 멤버
