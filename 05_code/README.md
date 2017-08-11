# Chapter5 코드 재사용 패턴

> 코드 재사용에 있어 가장 먼저 떠오르는건 상속이다. 이번 장도 상속에 상댱항을 할애했다. 상속에 대해 공부하지만 우리는 코드를 재사용하고자 하는것이다. 상속은 목표에 이르는 하나의 방법이지 유일한 방법이 아니다. 다른 객체와 합성하는 방법, 믹스-인 객체를 사용하는 방법, 기술적으로는 어떤 것도 영구히 상속하지 않으면서 필요한 기능만 빌려와서 재사용하는 방법 등을 살펴볼 것이다.
**클래스 상속보다 객체 합성을 우선시하라**

## 1. 클래스 방식 vs 새로운 방식의 상속 패턴

클래스방식이란?
자바스크립트에는 클래스가 없지만 생성자 함수와 new 연산자 문법을 이용하면 클래스를 사용하는 문법과 비슷하게 작동 사용할 수 있다.

``` js
// JAVA
Person adam = new Person();

// JAVASCRIPT
var adam = new Person();
```

클래스 관점에서 생각하고 클래스를 전제한 상속패턴을 `클래스 방식`

클래스에 생각할 필요가 없는 나머지 모든 패턴은 `새로운 방식`

새로운 방식의 패턴을 선택하는 것이 좋다.

우선 클래스 방식의 패턴을 살펴보자.

## 2. 클래스 방식의 상속을 사용할 경우 예상되는 산출물

클래스 방식의 상속을 구현할 때의 목표

`Child()`라는 생성자 함수로 생성된 객체들이 다른 생성자 함수인 `Parent()`의 프로퍼티를 가지도록 하는 것

``` js
// 부모 생성자
function Parent(name) {
  this.name = name || 'Adam';
}

// 생성자의 프로토타입에 기능을 추가
Parent.prototype.say = function () {
  return this.name;
};

// 아무 내용이 없는 자식 생성자
function Child(name) {}

// 여기서 상속의 마법이 일어난다.
inherit(Child, Parent);
```

`inherit()`함수는 언어에 내장되어 있지 않기 때문에 직접 구현한다.
이 함수의 범용적인 구현 방법을 몇 가지 살펴보자.

## 3. 클래스 방식의 상속 패턴#1 - 기본 패턴

가장 널리 쓰이는 기본적인 방법은 `Parent()` 생성자를 사용해 객체를 생성한 다음, 이 객체를 `Child()`의 프로토타입에 할당하는 것이다.

재사용 가능한 `inherit()`함수의 첫 번째 구현 예제는 다음과 같다.

``` js
function inherit(C, P) {
  C.prototype = new P();
}
```

prototype 프로퍼티가 함수가 아니라 객체를 가리키게 하는것이 중요(`P()`가 아니라 `new P()`)

이렇게 구현한 후에 `new Child()`를 사용해 객체를 생성하면, 프로토타입을 통해 `Parnet()` 인스턴스의 기능을 물려받게 된다.

``` js
var kid = new Child();
kid.say(); // "Adam"
```

### 3-1) 프로토타입 체인 추적

기본 패턴을 사용하면 부모 객체의 프로포토타입에 추가된 프로퍼티, 메서드(`say()`), 부모 객체 자신의 프로퍼티(`this`에 추가된 인스턴스 프로퍼티 위 예제 : `name`)도 모두 물려 받는다.

``` js
var p = new Parent();

/*
  p객체에는 say()메서드가 존재 하지 않는다.
  p객체에서 say()메서드 접근시에는 __proto__(Parent() 생성자 함수의 프로토타입 프로퍼티를 가리킨다.)라는 숨겨진 링크를 통해 Parent.prototype에 접근하여 say()메서드를 접근 할 수 있다.
*/
```

`inherit()` 함수 사용후 `var kid = new Child()`로 새로운 객체를 생성할 경우

`Child()`와 `Child.prototype`에는 아무것도 없다.
따라서 `new Child()`로 생성된 객체 역시 `__proto__`라는 숨겨진 링크 빼고는 비어 있다.
이때 `__proto__`는 `inherit()`함수안에서 생성된  `new Parent()`객체를 가리킨다.

`kid.say()`를 실행하면 먼저 `new Child()`객체를 탐색 `say()`없으면 그 다음, `new Parent()`객체 탐색 `say()`없으면 그 다음, `Parent.prototype`을 탐색하여 `say()`메서드를 찾는다.

`say()`메서드 안에 `this.name`에 대한 참조값을 찾기 위해 다시 탐색을 시작한다.
`this`는 `Child()`객체를 가리키는데 없으므로 아까와 같이 탐색한다.
`new Parent()`객체에 `name`이 있으므로 `Adam`이라는 값을 얻게 된다.

#### 상속 후 자식 객체에 프로퍼티를 추가했을 때의 프로토타입 체인

``` js
var kid = new Child();
kid.name = "Patrick";
kid.say(); // Patrick;

/*
  kid.name값을 변경하면 new Parent() 객체의 name 프로퍼티를 변경하지 않고 new Child() 객체의 name 프로퍼티를 생성하게 된다.
  따라서 kid.say()를 실행하면 `new Child()`객체에서 바로 찾을 수 있다.
*/

delete kid.name;

/*
  kid, 즉 new Child()객체에서 name프로퍼티를 삭제했으므로 kid.say() 실행시 `new Parent()`객체에서 name 프로퍼티를 찾는다.
*/
```

### 3-2) 패턴 #1의 단점

이 패턴의 단점

* 부모 객체의 `this`에 추가된 객체 자신의 프로퍼티와 프로토타입 프로퍼티를 모두 물려받게 된다는 점이다.

대부분 객체 자신의 프로퍼티는 특정 인스턴스에 한정되어 재사용할 수 없기 때문에 필요가 없다.

재사용 가능한 멤버는 프로토타입에 추가해야 한다는 것이 구성 요소를 만드는 일반 원칙이다.

* `inherit()`함수는 인자를 처리하지 못한다. 즉 자식 생성자에 인자를 넘겨도 부모 생성자에 전달하지 못한다.

``` js
var s = new Child('Seth');
s.say(); // "Adam"
```

## 4. 클래스 방식의 상속 패턴#2 - 생성자 빌려쓰기

이 패턴은 자식에서 부모로 인자를 전달하지 못했던 패턴 #1의 문제를 해결한다.
부모 생성자 함수의 `this`에 자식 객체를 바인딩한 다음, 자식 생성자가 받은 인자들을 모두 넘겨준다.

``` js
function Child(a, b, c, d) {
  Parent.apply(this, argumnets);
}
```

* 부모 생성자 함수 내부의 `this`에 추가된 프로퍼티만 물려 받는다.
* 프로토타입에 추가된 멤버는 상속되지 않는다.
* 자식 객체는 상속된 멤버의 복사본을 받게 된다. 참조를 물려받은 패턴 #1과는 다르다.

패턴#1과 차이점을 알아보자.

``` js
// 부모 생성자
function Article() {
  this.tags = ['js', 'css'];
}
var article = new Article();

// 클래스 방식의 패턴 #1을 사용해 article 객체를 상속하는 blog 객체를 생성한다.
function BlogPost() {}
BlogPost.prototype = article; // 이미 인스턴스가 존재하기 때문에 'new Article()'을 쓰지 않았다.
var blog = new BlogPost();

// 생성자 빌려쓰기 패턴을 사용해 article을 상속하는 page 객체를 생성한다.
function StaticPage() {
  Article.call(this);
}
var page = new StaticPage();

console.log(article.hasOwnProperty('tags')); // true 원본
console.log(blog.hasOwnProperty('tags')); // false 참조
console.log(page.hasOwnProperty('tags')); // true 복사
```

상속된 `tags` 프로퍼티를 수정할 때의 차이점

``` js
blog.tags.push('html'); // js css html 참조이므로(같은 배열 가리킴) 공유중
page.tags.push('php'); // php 복사본이므로 별개임
console.log(article.tags.join(', ')); // "js, css, html"
```

### 4-1) 프로토타입 체인

앞에서 살펴본 `Parent()`와 `Child()` 생성자에 이 패턴을 적용했을 때 프로토타입 체인을 살펴보자.

``` js
// 부모 생성자
function Parent(name) {
  this.name = name || 'Adam';
}

// 프로토타입에 기능을 추가한다.
Parent.prototype.say = function () {
  return this.name;
}

// 자식생성자
function Child(name) {
  Parent.apply(this, arguments);
}

var kid = new Child("Patrick");
kid.name; // "Patrick"
typeof kid.say; // "undefined"

/*
  new Parent()객체의 __proto__는 Parent.prototype(say()메서드 존재)을 가리킨다.
  new Child()객체의 __proto__는 Child.prototype(빈 객체)을 가리킨다.
  따라서 Parent()와 Child 객체 사이에 링크가 존재하지 않는다.
*/
```

이 패턴은 `kid`는 자기 자신의 `name`프로퍼티를 가지지만 `say()`메서드는 상속 받을 수 없다.
여기서의 상속은 부모가 가진 자신만의 프로퍼티를 자식의 프로퍼티로 복사해주는 일회서 동작이며, `__proto__`라는 링크는 유지되지 않는다.

### 4-2) 생성자 빌려쓰기를 적용한 다중 상속

``` js
function Cat() {
  this.legs = 4;
  this.say = function() {
    return "meaowww";
  }
}

function Bird() {
  this.wings = 2;
  this.fly = true;
}

function CatWings() {
  Cat.apply(this);
  Bird.apply(this);
}

var jane = new Catwings();
console.dir(jane); // Cat, Bird
/*
  jane객체의 프로퍼티 : fly, legs, wings, say
  중복 프로퍼티가 존재하면 마지막 프로퍼티 값으로 덮어쓰게 된다.
*/
```

### 4-3) 생성자 빌려쓰기 패턴의 장단점

#### 장점

* 부모 생성자 자신의 멤버에 대한 복사본을 가져올 수 있다는 것은 장점(자식이 실수로 부모의 프로퍼티를 덮어쓰는 위험을 방지)

#### 단점

* 프로토타입이 상속되지 않는다. (재사용되는 메서드와 프로퍼티는 프로토타입에 추가해야 되는데 안된다.)

## 5. 클래스 방식의 상속 패턴 #3 - 생성자 빌려쓰고 프로토타입 지정해주기

앞에 두 패턴을 결합

1. 부모 생성자를 빌려온다.
1. 자식의 프로토타입이 부모 생성자를 통해 생성된 인스턴스를 가리키도록 지정한다.

``` js

// 1.
function Child(a, b, c, d) {
  Parent.apply(this, arguments);
}

// 2.
Child.prototype = new Parent();
```

자식 객체는 부모가 가진 자신만의 프로퍼티의 복사본을 가지고 부모의 프로토타입 멤버로 구현된 재상용 가능한 기능들에 대한 참조도 물려 받는다.

즉 부모가 가진 모든 것을 상속하는 동시에, 부모의 프로퍼티를 덮어쓸 위험 없이 자신만의 프로퍼티를 마음놓고 변경할 수 있다.

* 부모의 생성자를 비효율적으로 두 번 호출하는 점이 단점이다. *

``` js
// 부모 생성자
funciton Parent(name) {
  this.name = name || 'Adam';
}

// 프로토타입에 기능 추가
Parent.prototype.say = function () {
  return this.name;
};

// 자식 생성자
function Child(name) {
  Parent.apply(this, arguments); // name 1번 상속
}
Child.prototype = new Parent();  // name 2번 상속

var kid = new Child("Patrick");
kid.name; // "Patrick"
kid.say(); // "Patrick"
delete kid.name; // name 지워도 2번째 상속된거에 남아있다.
kid.say(); // "Adam"
```

## 6. 클래스 방식의 상속 패턴 #4 - 프로토타입 공유

패턴 #3에서 부모 생성자를 2번 호출한 것과는 달리, 이번 패턴은 부모 생성자를 한번도 호출하지 않는다.

원칙적으로 재사용할 멤버는 `this`가 아니라 프로토타입에 추가되어야 한다. 따라서 상속되어야 하는 모든 것들도 프로토타입 안에 존재해야 한다.

``` js
function inherit(C, P) {
  C.prototype = P.prototype; // 부모의 프로토타입을 똑같이 자식의 프로토타입으로 지정한다.
}
```

부모와 자식 객체가 모두 동일한 프로토타입을 공유하며 `say()`메서드에도 똑같은 접근 권한을 가진다. 그러나 자식 객체는 `name` 프로퍼티를 물려받지 않는다.

단점은 상속된 프로토타입을 수정할 경우 연결된 모든 객체에 영향을 준다.

## 7. 클래스 방식의 상속패턴 #5 - 임시 생성자

이 패턴은 프로토타입 체인의 이점은 유지하면서, 동일한 프로토타입을 공유할때의 문제를 해결하기 위해 부모와 자식의 프로토타입 사이에 직접적인 링크를 끊는다.

``` js
function inherit(C, P) {
  var F = function () {}; // 빈 함수 F()가 부모와 자식 사이에어서 프록스(proxy) 기능을 맡는다.
  F.prototype = P.prototype; // F()의 prototype 프로퍼티는 부모의 프로토타입을 가리킨다.
  C.prototype = new F();
}
```

패턴#1과는 다르게 동작한다. `new Child()`의 `__proto__`가 바로 `Parent.prototype`을 링크 연결 되지 않고 `new F()`와 링크 연결되었다. `new F()`는 빈 객체이므로 자식이 프로토타입의 프로퍼티만을 물려 받는다.

``` js
var kid = new Child();
kid.name; // undefined

/*
  name은 부모 자신의 프로퍼티, 상속 과정에서 new parent()를 호출한 적이 없기 때문에 이 이프로퍼티는 생성조차 되지 않았다.
*/

kid.say();

/*
  new Child()의 없으므로 __proto__ 링크 타고 -> new F()에도 없으므로 __proto__ 링크 타고 -> Parent.prototype의 say()를 탐색하여 쓴다.
*/
```

### 7-1) 상위클래스 저장

이 패턴을 기반으로 하여, 부모 원본에 대한 참조를 추가할 수도 있다.

이 프로퍼티는 `uber`라고 부를것이다.(임의 지정)

``` js
function inherit(C, P) {
  var F = function () {};
  F.prototype = P.prototype;
  C.prototype = new F();
  C.uber = P.prototype; // 부모 프로토타입 저장
}
```

### 7-2) 생성자 포인터 재설정

생성자 포인터를 재설정하지 않으면 모든 자식 객체들의 생성자는 `Parent()`로 지정되어 있다.

``` js
// 부모와 자식을 두고 상속관계를 만든다.
function Parent() {}
function CHild() {}
inherit (Child, Parent);

// 생성자를 확인해본다.
var kid = new Child();
kid.constructor.name; // "Parent"
kid.constructor === Parent; // true
```

`constructor`프로퍼티

* 런타임 객체 판별에 유용(자주 사용하지 않는다.)
* 정보성으로만 사용되는 프로퍼티
* 따라서 원하는 생성자 함수를 가리키도록 재설정해도 기능에는 영향을 미치지 않는다.

최종 버전

``` js
function inherit(C, P) {
  var F = funciton () {};
  F.prototype = P.prototype;
  C.prototype = new F();
  C.uber = P.prototype;
  C.prototype.constructor = C;
}
```

> 이 패턴은 프록시 함수 또는 프록시 생성자 활용 패턴으로 불리기도 한다. 임시 생성자가 결국은 부모의 프로토타입을 가져오는 프록시로 사용되기 때문이다.

최종 버전의 최적화 방안은 상속이 필요할 때마다 임시(프록시) 생성자가 생성되지 않게 하는 것이다. 임시 생성자는 한 번만 만들어두고 임시 생성자의 프로토타입만 변경해도 충분하다.

즉시 실행 함수를 활용하면 프록시 함수를 클로저 안에 저장할 수 있다.

``` js
var inherit = (function () {
  var F = function () {}; // 처음 inherit 함수 호출 시에만 작동, 임시 생성자 F() 한번만 생성
  return function (C, P) {
    F.prototype = P.prototype; // 임시 생성자의 프로토타입만 변경
    C.prototype = new F();
    C.uber = P.prototype;
    C.prototype.constructor = C;
  }
}());
```