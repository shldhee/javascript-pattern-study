## 8. Klass

많은 자바스크립트 라이브러리가 클래스를 흉내냈다. 각 구현은 다르지만 공통점은 아래와 같다.

* 클래스의 생성자라고 할 수 있는 메서드에 대한 명명 규칙이 존재, 이 메서들은 자동 호출(`initialize, _init`)등의 이름을 가진다.
* 클래스는 다른 클래스로부터 상속된다.
* 자식 클래스 내부에서 부모 클래스(상위 클래스)에 접근할 수 있는 경로가 존재 한다.

클래스를 모방한 구현 예제

``` js
var Man = klass(null, { // 아무것도 상속받지 않는다. 내부적으로 Object를 상속
  __construct: function (what) {
    console.log("Man's constructor");
    this.name = what;
  },
  getName: function () {
    return this.name;
  }
});

var first = new Man('Adam'); // 'Man's constructor' 출력
first.getName(); // 'Adam'

// 이 클래스를 상속받아 SuperMan 클래스를 만들어보자.

var SuperMan = klass(Man, {
  __construct: function (what) {
    console.log("SuperMans's constructor");
  },
  getName : function() {
    var name = SuperMan.uber.getName.call(this);
    return "I am " + name;
  }
});
```

* `klass()` 함수 대신 `Klass()` 생성자 함수, `Object.prototype`을 확장해서 사용한다.
* `klass()` 함수는 두 개의 매개변수(상속할 부모 클래스, 객체 리터럴 형식으로 표기된 새로운 클래스의 구현)
* PHP에서 가져온 명명 규칙 적용(클래스의 생성자 메서드는 반드시 `__construct`로 이름 정의)

## 8. Klass

