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

클로저를 사용해 구현할 수 있다.

``` js
function Gadget() {
  // 비공개 멤버
  var name = 'iPod';
  // 공개된 함수
  this.getName = function () {
    return name;
  };
}
var toy = new Gadget();

// 'name'은 비공개이므로
console.log(toy.name); //undefined

console.log(toy.getName()) // "iPod" 공개메서드인 getName()을 통해 접근 가능
```

**비공개 멤버를 구현하기 위해 비공개로 유지할 데이터를 함수로 감싸기만 하면 된다. 이 데이터들은 함수의 지역변수로 만들면, 함수 외부에서는 접근할 수 없다.**

### 3-2) 특권(privileged) 메서드

> 비공개 멤버에 접근권한을 가진 (즉 일종의 특권을 부여받은) 공개 메서드를 가리키는 이름일 뿐이다. 앞선 예제에서 `getName()`은 비공개 프로퍼티인 `name`에 *특별한* 접근권한을 가지고 있기 때문에 특권 메서드라고 할 수 있다.

### 3-3) 비공개 멤버의 허점

* 파폭 eval() 생략
* 특권 메서드에서 비공개 변수의 값을 객체 또는 배열로 반환시에는 값이 아닌 참조가 반환되기 때문에, 외부 코드에서 비공개 변수 값을 수정 할 수 있다.

``` js
function Gadget() {
  //비공개 멤버
  var specs = {
    screen_width: 320,
    screen_height: 480,
    color: "white"
  };

  // 공개 함수
  this.getSpecs = function () {
    return specs;
  };
}

var toy = new Gadget(),
    specs = toy.getSpecs(); // `specs`객체에 대한 참조를 반환, `specs`은 감춰진 비공개처럼 보이지만 Gadget사용자에 의해 변경될 수도 있다.

// 비공개 객체가 변경된다.
specs.color = "black";
specs.price = "free";

console.dir(toy.getSpecs());
```

위와 같은 방법을 해결 하기 위해서는 객체나 배열에 대한 참조를 전달할 때 주의를 기울이는 수 밖에 없다.

1. `getSpecs()`에서 아예 새로운 객체를 만들어 사용자에게 쓸모있을 만한 데이터 일부만 담아 반환하는 것. ***최소 권한의 원칙(Principle of Least Authority, POLA)*** 필요 이상으로 권한을 주지 말아야 한다는 뜻
1. 예를 들어 Gadget 사용자가 Gadget이 어떤 상자에 들어맞을지를 알아보고 싶으면 Gadget의 면적만 알려주면 된다. `getDimenstions()`라는 메서드를 만들어 `width`, `height`만을 담은 객체를 반환
1. `getSpecs()`메서드는 필요 없을수도 있다.

모든 데이터를 넘겨야 한다면, 객체를 복사하는 범용 함수를 사용하여 `specs`객체의 복사본을 만든다.

* 주어진 객체의 최상위 프로퍼티만을 복사(얕은 복사, shallow copy)
* 모든 중첩 프로퍼티를 재귀적으로 복사(깊은 복사, deep copy)

### 3-4) 객체 리터럴과 비공개 멤버

객체 리터럴로 객체를 생성한 경우 비공개 멤버 구현하기
익명 즉시 실행 함수를 추가하여 클로저를 만든다.

``` js
var myobj; // 이 변수에 객체 할당
(function () {
  // 비공개 멤버
  var name = "LEE";

  // 공개될 부분을 구현
  // var를 사용하지 않았다는 데 주의하라(전역 변수에서 이미 선언함)

  myobj = {
    // 특권메서드
    getName: function () {
      return name;
    }
  };
}());

myobj.getName();
```

모듈 패턴의 기초가 되는 부분(위와 기본 개념은 동일하지만 약간 다르다.)

``` js
var myobj = (function () {
  // 비공개 멤버
  var name = "LEE";

  //공개될 부분을 구현한다.
  return {
    getName: function() {
      return name;
    }
  };
}());

myobj.getName(); // "LEE"
```

### 3-5) 프로토타입과 비공개 멤버

* 생성자를 사용하여 비공개 멤버를 만들 경우, 생성자를 호출하여 새로운 객체를 만들 때마다 비공개 멤버가 매번 재성성된다는 단점이 있다.
* 생성자 내부에서 `this`에 멤버를 추가하면 이런 문제 발생
* 중복 없애고 메모리를 절약할려면 `prototype`에 추가해야 한다.
* 이렇게 하면 동일한 생성자로 생성한 모든 인스턴스가 공통된 부분을 공유하게 된다.

``` js
function Gadget() {
  // 비공개 멤버
  var name = 'iPod';
  // 공개 함수
  this.getName = function () {
    return name;
  };
}

Gadget.prototype = (function () {
  // 비공개 멤버
  var browser = "Mobile Webkit";
  // 공개된 프로토타입 멤버
  return {
    getBrowser: function () {
      return browser;
    }
  }
}());

var toy = new Gadget();
console.log(toy.getName()); // 객체 인스턴스의 특권 메서드
console.log(toy.getBrowser()); // 프로토타입의 특권 메서드
```

### 3-6) 비공개 함수를 공개 메서드로 노출시키는 방법

*노출 패턴(revelation pattern)* 은 비공개 메서드를 구현하면서 동시에 공개 메서드로 노출하는 것을 말한다. 객체의 모든 기능이 객체가 수행하는 작업에 필수불가결한 것들이라서 최대한의 보호가 필요한데, 동시에 이 기능들의 유용성 때문에 공개적인 접근도 허용하고 싶은 경우가 있을 수 있다.(객체를 수정못하게 해야하면서 공개적인 접근 가능하게!)

``` js
var myarray;

(function() {
  var astr = "[object Array]",
      toString = Object.prototype.toString;

  function isArray(a) {
    return toString.call(a) === astr;
  }

  function indexOf(haystack, needle) {
    var i = 0,
        max = haystack.length;
    for (; i < max; i++) {
      if (haystack[i] === needle) {
        return i;
      }
    }
    return -1;
  }

  myarray = {
    isArray: isArray,
    indexOf: indexOf,
    inArray: indexOf
  };
}());

myarray.isArray([1,2]);
myarray.isArray({0:1});
myarray.indexOf(["a","b","c"],"c"); // 2
myarray.indexOf(["a","b","c"],"c"); // 2
```

위 코드에서 비공개 변수 2개, 비공개 함수 2개, `isArray()`,`indexOf()`가 존재
마지막 부분에서 공개적인 접근을 허용이 가능한 기능들을 모아둔 `myarray`객체가 있다.
비공개 함수는 `indexOf()`는 `indexOf`,`inArray` 2개의 이름으로 노출되어있다.

공개된 메서드인 `indexOf()`에 예기치 못한 일이 생기더라고 비공개 함수인 `indexOf()`는 안전하게 보호되기 떄문에 `inArray()`는 정상적으로 작동할 것이다.

## 4. 모듈 패턴

> 모듈 패턴은 늘어나는 코드를 구조화하고 정리하는데 도움이 되기 때문에 널리 쓰인다. 각 기능들을 블랙박스처럼 다루면서도 소프트웨어 개발 중에 (끊임 없이 변하는) 요구사항에 따라 기능을 추가하거나 교체하거나 삭제하는 것도 자유롭게 할 수 있다.

모듈 패턴은 다음 패턴들 여러 개를 조합한 것이다.

* 네임스페이스 패턴
* 즉시 실행 함수
* 비공개 멤버와 특권 멤버
* 의존 관계 선언

``` js
MYAPP.namespace('MYAPP.utilities.array'); // 네임스페이스 설정하여 유용한 배열 메서드를 제공하는 유틸리티 모듈 예제를 만들어 보자.

// 그 다음 모듈 정의
// 공개 여부를 제한해야 한다면 즉시 실행 함수를 사용해 비공개 유효범위를 만들면 된다.

MYAPP.utilities.array = (function () {
  //의존관계
  var uobj = MYAPP.utilities.object,
      ulang = MYAPP.utilities.lang,

      // 비공개 프로포티
      array_string = "[object Array]",
      ops = Object.prototype.toString;

    // 비공개 메서드들
    // ...

    // var 선언을 마친다.

    // 필요하면 일회성 초기화 절차를 실행한다.
    // ...

    // 공개 API
    return {
      inArray: function (needle, haystack) {
        for (var i =0, max = haystack.length; i <max; i += 1 ) {
          if (haystack[i] === needle) {
            return true;
          }
        }
      },

      isArray: function (a) {
        return ops.call(a) === array_string;
      }

      // ... 더 필요한 메서드와 프로퍼티를 여기 추가한다.
    }
}());
```

***모듈 패턴은 특이 점점 늘어만 가는 코드를 정리할 때 널리 사용되며 매우 추천***

### 4-1) 모듈 노출 패턴

이 장에서 비공개 멤버와 관련된 패턴을 살펴보면서 이미 노출 패턴을 다른 바 있다. 모듈 패턴도 비슷한 방식으로 편성할 수 있다. **즉 모든 메서드를 비공개 상태로 유지하고, 최종적으로 공객 API를 갖출 때 공개할 메서드만 골라서 노출하는 것이다.**

앞 예제는 다음과 같이 수정 할 수 있다.

```js
MYAPP.utilities.array = (function () {
  //의존관계
  var uobj = MYAPP.utilities.object,
      ulang = MYAPP.utilities.lang,

      // 비공개 프로포티
      inArray = function (haystack, needle) {
        for (var i = 0, max = haystack.length; i < max; i += 1) {
          if (haystack[i] === needle) {
            return i;
          }
        }
        return -1;
      },
      isArray = function (a) {
        return ops.call(a) === array_string;
      };
      // var 선언을 마친다.
  // 공개 API 노출
  return {
    isArray: isArray,
    indexOf: inArray
  }
}());
```

sdf

### 4-2) 생성자를 생성하는 모듈(한 번 더 보 기!)

생성자 함수를 사용해 겍체를 만든다. 모듈을 감싼 즉시 실행 함수가 마지막에 객체가 아니라 함수를 반환하게 하면 된다.
다음 모듈 패턴 예제는 생성자 함수인 `MYAPP.utilities.Array`를 반환한다.

``` js
MYAPP.namespace('MYAPP.utilities.Array');

MYAPP.utilities.Array = (function() {
  // 의존 관계 선언
  var uobj = MYAPP.utilities.object,
      ulang = MYAPP.utilities.lang,
      // 비공개 프로퍼티와 메서드들을 선언한 후.....
      Constr;

      // var 선언을 마친다.

  // 필요하면 일회성 초기화 절차를 실행
  // ...

  // 공개 API - 생성자 함수
  Constr = function (o) {
    this.elements = this.toArray(o);
  };

  // 공개 API - 프로토타입
  Constr.prototype = {
    constructor: MYAPP.utilities.Array,
    version: "2.0",
    toArray: function (obj) {
      for (var i = 0, a = [], len = obj.length; i < len; i += 1 ) {
        a[i] = obj[i];
      }
      return a;
    }
  };

  // 생성자 함수를 반환
  // 이 함수가 새로운 네임스페이스에 할당
  return Constr;
}());

// 이 생성자 함수는 다음과 같이 사용한다.

var arr = new MYAPP.utilities.Array(obj);
```

### 4-3) 모듈에 전역 변수 가져오기

모듈을 감싼 즉시 실행 함수에 인자를 전달하는 형태. 어떠한 값이라고 가능하지만 보통 전역 변수에 대한 참조 또는 전역 개체 자체를 전달. 이렇게 전역 변수를 전달하면 즉시 실행 함수 내에서 지역 변수로 사용할 수 있게 되기 때문에 탐색 작업이 좀 더 빨라진다.

``` js
MYAPP.utilities.module = (function (app, global) {
  // 전역 객체에 대한 참조와
  // 전역 애플리케이션 네임스페이스 객체에 대한 참조가 지역 변수화 된다.
}(MYAPP, this));
```

## 5. 샌드박스 패턴

샌드박스 패턴은 네임스페이스 패턴의 다음과 같은 단점을 해결한다.

*   애플리케이션 전역 객체가 단 하나의 전역 변수에 의존한다. 따라서 네임스페이스 패턴으로는 동일한 애플리케이션이나 라이브러리의 두 가지 버전을 한 페이지에서 실행시키는 것이 불가능하다. (여러 버전들이 모두 `MYAPP`이라는 동일한 전역 변수명을 쓰기 떄문)
*   `MYAPP.utilities.array`와 같이 점으로 연결된 긴 이름을 써야 하고 런타임에는 탐색 작업을 거쳐야 한다.

샌드박스 패턴은 어떤 모듈이 다른 모듈과 그 모듈의 샌드박스에 영향을 미치지 않고 동작할 수 있는 환경을 제공한다.

### 5-1) 전역 생성자

네임스페이스 패턴에서는 전역 객체가 하나다.

샌드박스 패턴의 유일한 전역은 생성자다. 이것을 `Sandbox()`라고 하자. 이 생성자를 통해 객체들을 생성할 것이다.

그리고 이 생성자에 콜백 함수를 전달해 해당 코드를 샌드박스 내부 환경으로 격리 시킬것이다.

``` js
new Sandbox(function (box) {
  // code...
});
```

`box`객체는 네임스페이스 패턴에서의 `MYAPP`과 같은 것이다. 코드가 동작하는데 필요한 모든 라이브러리 기능들이 여기에 들어간다.

*   `new`를 강제하는 패턴을 활용하여 객체를 생성할 떄 `new`를 쓰지 않아도 되게 만든다.
*   `Sandbox()` 생성자가 선택적인 인자를 하나 이상 받을 수 있게 한다. 이 인자들은 객체를 생성하는 데 필요한 모듈의 이름을 지정한다. 우리는 코드의 모듈화를 지향하고 있으므로 `Sandbox()`가 제공하는 기능 대부분이 실제로는 모듈안에 담겨지게 될 것이다.

[new를 강제하는 패턴][3362e803]

  [3362e803]: https://github.com/shldhee/javascript-pattern-study/blob/master/02_literal_constructor/README.md#3-new를-강제하는-패턴 "3장"

객체를 초기화는 코드
`new`를 쓰지 않고 `ajax`와 `event`를 사용하는 객체를 만들 수 있다.

``` js
Sandbox(['ajax', 'event'], function (box) {
  // console.log(box);
});

위 예제와 비슷하지만 모듈 이름을 개별적인 인자로 전달

Sandbox('ajax', 'dom', function (box) {
  // console.log(box);
});
```

'쓸 수 있는 모듈을 모두 사용한다'는 의미로 와일드카드 `*` 인자를 사용하면 어떨까? 편의를 위해 모듈명을 누락시키면 샌드박스가 자동으로 `*` 를 가정하도록 하자.

``` js
Sandbox('*', function (box) {
  // console.log(box);
})

Sandbox(function (box) {
  // console.log(box);
});
```

샌드박스 객체의 인스턴스를 여러 개 만드는 예제
인스턴스 중첩도 가능하며 이 때 두 인스턴스간의 간섭 현상을 일어나지 않는다.

``` js
Sandbox('dom', 'event', function(box) {
  // dom과 event를 가지고 작업하는 코드
  Sandbox('ajax', function (box) {
    // 샌드박스된 box 객체를 또 하나 만든다.
    // 이"box"객체는 바깥쪽 함수의 "box"객체와는 다르다.

    // ...

    // ajax를 사용하는 작업 완료
  });

  // 더 이상 ajax 모듈의 흔적은 찾아볼 수 없다.

});
```

* 샌드박스 패턴을 사용하면 콜백 함수로 코드를 감싸기 때문에 전역 네임스페이스를 보호할 수 있다.
* 필요하다면 함수가 곧 객체라는 사실을 활용하여 `Sandbox()` 생성자의 '스테틱'프로퍼티에 데이터를 저장할 수 도 있다.
* 원하는 유형별로 모듈의 인스턴스를 여러 개 만들 수도 있다. 이 인스턴스들은 각각 독립적으로 동작하게 된다.

### 5-2) 모듈 추가하기

생성자를 구현하기 전에 모듈을 어떻게 추가할 수 있는지 살펴보자.
`Sandbox()` 생성자 함수 역시 객체이므로, `modules`라는 프로퍼티를 추가할 수 있다. 이 프로퍼티는 키-값의 쌍을 담은 객체이다.

* 모듈의 이름이 **키**
* 각 모듈을 구현한 함수가 **값**

``` js
Sandbox.modules = {};

Sandbox.modules.dom = function (box) {
  box.getElement = function () {};
  box.getStyle = function () {};
  box.foo = "bar";
};

Sandbox.modules.event = function (box) {
  // 필요에 따라 다음과 같이 Sandbox 프로토타입에 접근 할 수 있다.
  // box.constructor.prototype.m = "mmm";
  box.attachEvent = function () {};
  box.detachEvent = function () {};
};

Sandbox.modules.ajax = function (box) {
  box.makeRequest = function () {};
  box.getResponse = function () {};
};
```

`dom, event, ajax` 모듈 추가. 모든 라이브러리와 복잡한 웹 애플리케이션에서 흔히 사용되는 기능들이다.
각 모듈을 구현하는 함수들이 현재의 인스턴스 `box`를 인자로 받아들인 다음 이 인스턴스에 프로퍼티와 메서드를 추가하게 된다.

### 5-3) 생성자 구현

이제 `Sandbox()` 생성자를 구현해보자.

``` js
function Sandbox() {
  // arguments를 배열로 바꾼다.
  var args = Array.prototype.slice.call(arguments),
      // 마지막 인자는 콜백 함수다.
      callback = args.pop(),
      // 모듈은 배열로 전달될 수도 있고 개별 인자로 전달될 수도 있다.
      modues = (args[0] && typeof args[0] === "string") ? args : args[0],
      i;

      // 함수가 생성자로 호출되도록 보장한다.
      if (!(this instancof Sandbox)) {
        return new Sandbox(modules, callback);
      }

      // this에 필요한 프로퍼티들을 추가한다.
      this.a = 1;
      this.b = 2;

      // 코어 `this`객체에 모듈을 추가한다.
      // 모듈이 없거나 "*"이면 사용 가능한 모든 모듈을 사용한다는 의미다.
      if (!modules || modules === '*' || modules[0] === '*') {
        modules = [];
        for (i in Sandbox.modules) {
          if (Sandbox.modules.hasOwnProperty(i)) {
            modules.push(i);
          }
        }
      }

      // 필요한 모듈을 초기화한다.
      for ( i = 0; i < modules.length; i++ ) {
        Sandbox.modules[modules[i]](this);
      }

      // 콜백 함수를 호출
      callback(this);
}

// 필요한 프로토타입 프로퍼티들을 추가
Sandbox.prototype = {
  name: "My Application",
  version: "1.0",
  getName: function () {
    return this.name;
  }
};
```

이 구현에서 핵식점인 사항들

* `this`가 `Sandbox`의 인스턴스인지 확인하고, 그렇지 않으면 (즉 `Sandbox()`가 `new`없이 호출되었다면) 함수를 생성자로 호출한다.
* 생성자 내부에서 `this`에 프로퍼티를 추가. 생성장의 프로토타입에도 프로퍼티를 추가할 수 있다.
* 필요한 모듈은 배열로도, 개별적인 인자로도 전달 가능, `*`와일드카드를 사용하거나, 쓸수 있는 모듈을 모두 쓰겠다는 의미로 생략할 수도 있다.
  * 이 예제에서는 필요한 기능을 다른 파일로부터 로딩하는 것까지는 구현하지 않았지만, 이러한 선택지도 확실히 고려해보아야 한다.
* 필요한 모듈을 모두 파악한 다음에는 각 모듈을 초기화한다. 다시 말해 각 모듈을 구현한 함수를 호출한다.
* 생성장의 마지막 인자는 콜백 함수다. 이 콜백 함수는 맨 마지막에 호출되며, 새로 생성된 인스턴스가 인자로 전달된다. 이 콜백 함수가 실제 사용자의 샌드박스이며 필요한 기능을 모두 갖춘 상태에서 `box`객체를 전달받게 된다.

[블로그 참조][ref3]

  [ref3]: http://realmojo.tistory.com/77 "블로그 참조"

## 6. 스태틱 멤버

스태틱 프로퍼티와 메서드란 인스턴스에 따라 달라지지 않는 프로퍼티와 메서드를 말한다. 클래스 기반의 언어에서는 별도의 문법을 통해 스태틱 멤버를 생성하여 클래스 자체의 멤버인 것처럼 사용한다. 예를 들어
`MathUtils`클래스에 `max()`라는 스태틱 메서드가 있다면 `MathTuils.max(3,5)`와 같은 식으로 호출이 가능하다.
**이것은 공개 스태틱 멤버의 예로, 클래스의 인스턴스를 생성하지 않고도 사용 할 수 있다.**
**비공개 스태틱 멤버는 클래스 사용자에게는 보이지 않지만 클래스의 인스턴스들은 모두 함께 사용할 수 있다.**

### 6-1) 공개 스태틱 멤버

자바스크립트에는 스태틱 멤버를 표기하는 별도의 문법이 존재하지 않는다. 그러나 생성자에 프로퍼티를 추가함으로써 클래스 기반 언어와 동일한 문법을 사용할 수 있다. **생성자도 다른 함수와 마찬가지로 객체이고 그 자신의 프로퍼티를 가질 수 있기 떄문에 이러한 구현이 가능하다.** 앞 장에서 다룬 메모이제이션 패턴도 이처럼 함수에 프로퍼티를 추가하는 개념에 착안한 것이다.

[메모제이션 패턴][66fc6b8b]

  [66fc6b8b]: https://github.com/shldhee/javascript-pattern-study/tree/master/03_function#8-함수-프로퍼티---메모이제이션memoization-패턴 "메모제이션 패턴"

다음 예제는 `Gadget`이라는 생성자에 스태틱 메서드인 `isShiny()`와 일반적인 인스턴스 메서드인 `setPrice()`를 정의한 것이다.
**`isShiny()`는 특정 `Gadget` 객체를 필요로 하지 않기 떄문에 스태틱 메서드라 할 수 있다.**
모든 `Gadget`이 빛나는지 알아내는 데는 특정한 하나의 `Gadget`이 필요하지 않는것과 같다.(아무거나 하나의 `Gadget`만 있으면 된다는 뜻인듯?)
**반면 개별 `Gadget`들의 가격은 다를 수 있기 떄문에 `setPrice()` 메서드를 쓰려면 객체가 필요하다**

``` js
// 생성자
var Gadget = function () {};

// 스태틱 메서드
Gadget.isShiny = function () {
  return "you bet";
};

// 프로토타입에 일반적인 함수를 추가했다.
Gadget.prototype.setPrice = function (price) {
  this.price = price;
};
```

메서드 호출 비교
**스태틱 메서드인 `isShiny()`는 생성자를 통해 직접 호출**
**일반적인 메서드인 `setPrice()`는 인스턴스를 통해 호출**

``` js
// 스태틱 메서드를 호출하는 방법
Gadget.isShiny(); // "you bet";

// 인스턴스를 생성한 후 메서드를 호출 , 인스턴스 메서드
var iphone = new Gadget();
iphone.setPrice(500);
```

인스턴스 메서드를 스태틱 메서드와 같은 방법으로 호출하면 동작하지 않는다.
스태틱 메서드 역시 인스터스인 `iphone` 객체를 사용해 호출하면 동작하지 않는다.

``` js
typeof Gadget.setPrice; // "undefined"
typeof iphone.isShiny; // "undefined"
```

스태틱 메서드가 인스턴스를 통해 호출했을 때도 동작한다면 편리한 경우가 있을 수 있다.
이 때는 간단하게 프로토타입에 새로운 메서드를 추가하는 것만으로 쉽게 구현할 수 있다.
이 새로운 메서드는 원래의 스태틱 메서드를 가리키는 일종의 퍼사드 역할을 한다.

``` js
Gadget.prototype.isShiny = Gadget.isShiny;
iphone.isShiny(); // "you bet"
```

**이런 경우네는 스태틱 메서드 안에서 `this`를 사용할 때 주의를 기울여야 한다.**
`Gadget.isShiny()`를 호출했을 때 `isShiny()`내부의 `this`는 `Gadget`생성자를 가리키지만
`iphone.isShiny()`를 호출했을 때 `this`는 `iphone`을 가리키게된다.

마지막으로 스태틱한 방법으로도, 스태틱하지 않은 방법으로도 호출될 수 있는 어떤 메서드를 호출 방식에 따라 살짝 다르게 동작하게 하는 예제를 살펴보자. 메서드가 어떻게 호출되었는지 판별하기 위해서 instanceof 연산자를 활용한다.

``` js
// 생성자
var Gadget = function (price) {
	this.price = price;
}

// 스태틱 메서드
Gadget.isShiny = function () {

	// 다음은 항상 동작한다.
	var msg = "you bet";

	if (this instancof Gadget) {
		// 다음은 스태틱 하지 않은 방식으로 호출되었을 때만 작동한다.
		msg += ", it costs $" + this.price + '!';
	}

	returm msg;
};

// 프로토타입에 일반적인 메서드를 추가한다.
Gadget.prototype.isShiny = function () {
	return Gadget.isShiny.call(this);
};
```

스태틱 메서드 호출 시

``` js
Gadget.isShiny(); // "you bet"
```

인스턴스 메서드 호출

``` js
var a = new Gadget('499.99');
a.isShiny(); // "you bet, it costs $499.99!"
```

### 6-2) 비공개 스태틱 멤버

비공개 스태틱이란?

* 동일한 생성자 함수로 생성된 객체들이 공유하는 멤버다.(프로토타입 아닌가...?)
* 생성자 외부에서는 접근할 수 없다.

먼저 클로저 함수를 만들고, 비공개 멤버를 이 함수로 감싼 후, 이 함수를 즉시 실행한 결과로 새로운 함수를 반환하게 한다. 반환되는 함수는 Gadget 변수에 할당되어 새로운 생성자가 될 것이다.

``` js
var Gadget = (function() {
	// 스태틱 변수/프로퍼티
	var counter = 0; // 비공개 멤버

	// 생성자의 새로운 구현 버전을 반환한다.
	return function () { // 클로저 함수
		console.log(counter += 1);
	};
}()); // 즉시 실행한다.
```

새로운 `Gadget` 생성자는 단순히 비공개 `coutner` 값을 증가시켜 출력한다. 몇 개의 인스턴스를 만들어 테스트해보면 실제로 모든 인스턴스가 동일한 `counter`값을 공유하고 있음을 확인할 수 있다.

``` js
var g1 = new Gadget(); // 1
var g2 = new Gadget(); // 2
var g3 = new Gadget(); // 3
```

객체당 1씩 `counter`를 증가시키고 있기 때문에 이 스태틱 프로퍼티는 `Gadget` 생성자를 통해 생성된 개별 객체의 유일성을 식별하는 ID가 될 수 있다. 유일한 식별자는 쓸모가 많으니 특권 메서드로 노출 시켜도 좋지 않을까?
앞선 예제에 덧붙여 비공개 스태틱 프로퍼티에 접근할 수 있는 `getLastId()`라는 특권 메서드를 추가해보자.

``` js
// 생성자
var Gadget = (function () {
	// 스태틱 변수/프로퍼티
	var counter = 0,
	    NewGadget;

	// 이 부분이 생성자를 새롭게 구현한 부분이다.
	NewGadget = function () {
		counter += 1;
	};

	// 특권 메서드
	NewGadget.prototype.getLastId = function () {
		return counter;
	};

	// 생성자를 덮어쓴다.
	return newGadget; // 원래는 this인데 newGadget으로 덮어쓴다.???
}());

var iphone = new Gadget();
iphone.getLastId(); // 1

var ipod = new Gadget();
ipod.getLastId(); // 2

var ipad = new Gadget();
ipad.getLastId(); // 3
```

공개/비공개 스태틱 프로퍼티는 상당히 편리하다. 특정 인스턴스에 한정되지 않는 메서드와 데이터를 담을 수 있고 인스턴스별로 매번 재생성되지도 않는다. 싱글톤 패턴을 다룰 때 스태틱 프로퍼티 사용


## 7. 객체 상수

ES5이하에서는 상수가 없지만 ES6부터는 `const` 문을 통해 상수를 생성할 수 있다.
명명 규칙을 사용하여 값이 변경되지 말아야 하는 변수명을 모두 대문자로 쓴다.
이 규칙은 실제로 자바스크립트 내장객체에서도 사용된다.

``` js
Math.PI; // 3.1415...
Math.SQRT2; // 1.4142...
Number.MAX_VALUE; // 1.7976.....
```

사용자 정의 상수에도 동일한 명명 규칙을 적용하여, 생성자 함수에 스태틱 프로퍼티로 추가하면 된다.

``` js
// 생성자
var Widget = function () {
	// 생성자의 구현내용...
};

// 상수

Widget.MAX_HEIGHT = 320;
Widget.MAX_WIDTH = 480;
```

객체 리터럴로 생성한 객체에도 동일한 명명 규칙을 적용할 수 있다.
**즉 대문자로 쓴 일반적인 프로퍼티를 상수로 간주하는 것이다.**

실제로도 값이 변경되지 않게 하고 싶다면, 비공개 프로퍼티를 만든 후, 값을 설정하는 메서드(`setter`)없이 값을 반환하는 메서드(`getter`)만 제공하는 방법도 고려해볼 만하다. 그러나 대부분의 경우 명명 규칙만으로도 충분하다.

다음 예제는 아래 메서드를 제공하는 범용 `constant` 객체를 구현한 것이다.
***`sum(name, value)`***
새로운 상수를 정의한다.

***`isDefined(name)`***
특정 이름의 상수가 있는지 확인한다.

***`get(name)`***
상수의 값을 가져온다.

* 상수 값을 원세 데이터 타입만 허용
* 선언하려는 상수의 이름이 `toString`,`hasOwnProperty` 등 내장 프로퍼티의 이름과 겹치지 않도록 보장
* 모든 상수의 이름 앞에 임의로 생성된 접두어 붙인다.

``` js
var constant = (function () {
	var constants = {},
	    ownProp = Object.prototype.hasOwnProperty,
			allowed = {
				string: 1,
				number: 1,
				boolean: 1
			},
			prefix = (Math.random() + "_").slice(2);
	return {
		set: function (name, value) {
			if (this.isDefined(name)) {
				return false;
			}
			if (!ownProp.call(allowed, typeof value)) { //궁금...? 어떤걸 넣어도 다 되는거 같은데..
				return false;
			}
			constants[prefix + name] = value;
			return true;
		},
		isDefined: function (name) {
			return ownProp.call(constants, prefix + name);
		},
		get: function (name) {
			if (this.isDefined(name)) {
				return constants[prefix + name];
			}
			return null;
		}
	};
}());
constant.isDefined("maxwidth");
constant.set("maxwidth");
constant.isDefined("maxwidth");
constant.get("maxwidth");
```

## 8. 체이닝 패턴

**체이닝 패턴이란 객체에 연쇄적으로 메서드를 호출할 수 있도록 하는 패턴이다.** 즉 여러 가지 동작을 수행할 때, 먼저 수행한 동작의 반환 값을 변수에 할당한 후 다음작업을 할 필요가 없기 때문에, 호출을 여러 줄에 걸쳐 쪼개지 않아도 된다.

``` js
myobj.method1("hello").method2().method3("world").method4();
```

만약 메서드에 의미있는 반환 값이 존재하지 않는다면, 현재 작업중인 객체 인스터스인 `this`를 반환하게 한다. 이렇게 하면 객체의 사용자는 앞선 메서드에 이어 다음 메서드를 바로 호출할 수 있다.

``` js
var obj = {
	  value: 1,
		increment: function() {
			this.value++;
			return this;
		},
		add: function (v) {
			this.value += v;
			return this;
		},
		shout: function () {
			alert(this.value);
		}
};

// 메서드 체이닝 호출
obj.increment().add(3).shout();
```

### 8-1) 체이닝 패턴의 장단점

#### 장점

1. 코드량이 줄고 코드가 간결해져 하나의 문장처럼 읽을 수 있다.
2. 함수를 쪼개는 방법을 생각하게 된다.
3. 장기적으로 유지보수에 유리하다

#### 단점

1. 디버깅하기가 어렵다. 라인은 발견할 수 있으나 그 라인에 수많은 일이 있다.

어쨌든 이 패턴을 알아두면 좋다.
**어떤 메서드가 명백히 의미있는 반환 값을 가지지 않는다면 항상 `this`를 반환하게 한다.**
이 패턴은 `jQuery`라이브리러 등에서 사용된다.
`DOM API`를 보면, `DOM`의 요소들도 체이닝 패턴을 사용하는 경향이 있다.

``` js
document.getElementByTagName('head')[0].appendChild(newnode);
```

## 9. method() 메서드

예제도 안되고 안쓰는듯?

생성자 본문 내에서 인스턴스 프로퍼티를 추가할 수 있다는 점에서, 생성자 함수의 사용법은 자바에서 클래스를 사용하는 것과 비슷하다. 그러나 `this`에 인스턴스 메서드를 추가하게 되면 인스턴스마다 메서드가 재생성되어 메모리를 잡아 먹으므로 비효율적이다.

**따라서 재사용 가능한 메서드는 생성자의 `prototype` 프로퍼티에 추가되어야 한다.**
그런데 `prototype`이 다른 개발자들에게는 낯선 개념일수 있기 때문에, `method()`라는 메서드 속에 숨겨두는 것이다.

***언어에 장식적으로 추가한 달콤한 편의 기능을 가리켜 종종 `문법 설탕`***
여기서는 `method()`라는 메서드를 `설탕 메서드`라고 할 수 있다.

`method()`라는 문법 설탕을 사용해 '클래스'를 정의하는 방법

``` js
var Person = function (name) {
	this.name = name;
}.
	method('getName', function () {
	  return this.name;
}).
	method('setName', function (name) {
		this.name = name;
		return this.
	});
```

생략

## 10. 요약

**객체 리터럴과 생성자 함수에서 더 나아가 객체를 생성하는 다양한 패턴들을 살펴보았다.**

* 전역 공간을 꺠끗하게 유지하고 코드를 구조화하여 정리하도록 도와주는 **네임스페이스 패턴**
* 간단하면서도 놀랄 만큼 유용한 **의존 관계 선언 패턴**
* **비공개 패턴**을 보면서 비공개 멤버, 특권 메서드, 비공개 멤버를 구현할 때 신경써야 할 경우들, 객체 리터럴을 사용하면서 비공개 멤버를 구현하는 방법, 비공개 메서드를 공개 메서드처럼 노출하는 방법 등을 다루었다.
* 긴 네임스페이스의 대안으로 **샌드박스 패턴**
* 객체 상수, 공개/비공개 스태틱 멤버, 체이닝 패턴

## 11. 의문점

1. 샌드박스 패턴
1. 6-1) 공개 스태틱 멤버
  모든 Gadget이 빛나는지 알아내는 데는 특정한 하나의 Gadget이 필요하지 않는것과 같다.(아무거나 하나의 Gadget만 있으면 된다는 뜻인듯?)
1. 6-2) 비공개 스태틱 멤버
  동일한 생성자 함수로 생성된 객체들이 공유하는 멤버다.(프로토타입 아닌가...?)
1. method() 사용안하는듯?
