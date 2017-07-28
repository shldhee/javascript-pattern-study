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
