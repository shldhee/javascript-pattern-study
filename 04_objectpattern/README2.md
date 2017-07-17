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
