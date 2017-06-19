# Chapter1 기초

## 유지보수 가능한 코드 작성

* 읽기 쉽다.
* 일관적이다.
* 예측가능하다.
* 한사람이 작성한 것처럼 보인다.
* 문서화되어 있다.

## 1. 전역 변수 최소화

``` js
myglobal = "hello"; // 안티패턴
console.log(myglobal); // "hello"
console.log(window.myglobal); // "hello"
console.log(window["myglobal"]); // "hello"
console.log(this.myglobal); // "hello"
```

### 전역 변수의 문제점

모든 전역 변수는 동일한 전역 네임스페이스 안에 존재하기 떄문에, 애플리케이션 내의 다른 영역에서 목적이 다른 전역 변수를 동일한 이름으로 정의할 경우 서로 덮어쓰게 된다.

**전역 변수 만들기가 쉬운 이유**

* 자바스크립트에서는 변수를 선언하지 않고도 사용할 수 있다.
* 자바스크립트에서는 암묵전 전역(implied globals)이라는 개념이 있다. 즉 선언하지 않고 사용한 변수는 자동으로 전역 객체의 프로퍼티가 되어, 명시적으로 선언된 전역 변수와 별 차이없이 사용한다

``` js
function sum(x, y) {
    // 안티패턴 : 암묵적 전역
    result = x + y;
    return result;
}
```

result가 선언되지 않은 상태로 사용되었고 함수 호출 후 전역 네임스페이스에 result라는 변수가 남아 있다.
var를 사용하여 변수를 작성해라

```js
function sum(x ,y) {
    var result = x + y;
    return result;
}
```

```js
function foo() { // 안티패턴 사용하지 말것
    var a = b = 0;
    // === var a = (b = 0);
    // var a, b; a = b = 0; // 모두 지역변수
}
```

a는 지역 변수 b는 전역 변수가 된다. 이유는 평가가 오른쪽에서 왼쪽으로 진행되기 떄문
`b = 0`를 먼저 실행 한다. 이때 b는 선언되지 않은 상태
반환값 0이 `var a` 지역변수에 할당

### var 선언을 빼먹었을 때의 부작용

var를 사용한 변수에 delete 연산자를 사용 불가능 var를 사용하지 않은 암묵적 전역 변수에 사용 가능

``` js
var global_var = 1;
global_novar = 2; // 안티패턴
(function () { // 안티패턴
    global_fromfunc = 3;
}());

// delete
delete global_var; // false
delete global_novar; // true
delete global_fromfunc; // true

// check
typeof global_var; / "number"
typeof global_novar; // "undefined"
typeof global_fromefunc; // "undefined"
```

### 전역 객체에 대한 접근

window를 사용하지 않고 this를 통해 전역객체에 접근

``` js
var global = (function() {
    return this;
}());
```

### 단일 var 패턴

함수 상단에서  var 선언을 한번 만 쓰는 패턴

* 함수에서 필요로 하는 모든 지역 변수를 한군데서 찾을 수 있다.
* 변수를 선언하기 전에 사용할 때 발생하는 로직상의 오류를 막아준다.(호이스팅(hoisting))
* 변수를 먼저 선언한 후에 사용해야 한다는 사실을 상기시키기 때문에 전역 변수를 최소화하는데 도움이 된다.
* 코드량이 줄어든다.

``` js
function func() {
    var a = 1,
        b = 2,
        sum = a + b,
        myobject = {},
        i,
        j,
} // 초기화
```

``` js
function updateElement() { // DOM참조시 지역 변수들 하나의 선언문에 모아놓기
    var el = document.getElementById("result"),
        style = el.style;
}
```

### 호이스팅(hoisting) : 분산된 var 선언의 문제점

``` js
// 안티패턴
myname = "global";
function func() {
    alert(myname); // "undefined"
    var myname = "local";
    alert(myname); // "local"
}
```

위 코드는 아래와 같은 동작으로 실행된다.

``` js
myname = "global";
function func() {
    var myname;
    alert(myname); // "undefined"
    myname = "local"
    alert(myname); // "local"
}
```

## 2. for 루프

for 루프 최적화하기 위해서 배열(또는 콜렉션)의 length를 캐시해야 한다.

```js
for (var i = 0; max = myarray.length; i < max; i++ ) { // i++ 대신 i += 1권장
    // myarray[i]를 다루는 코드
}
```

for문에는 2가지 변형 패턴이 있다. 이 패턴들은 다음과 같은 미세 최적화를 시도

* 변수를 하나 덜 쓴다.(max가 없다.)
* 카운트를 거꾸로 하여 0으로 내려간다. 0 과 비교하는 것이 배열의 length 또는 0이 아닌 값과 비교하는 것보다 대개 더 빠르다.

첫 번째 변형 패턴
``` js
var i, myarray = [];

for (i = myarray.length; i--;) {
    // myarray[i]를 다루는 코드
}
```

두 번째 변형 패턴은 while loop
``` js
var myarray = [],
    i = myarray.length;

while (i--) {
    // myarray[i]를 다루는 코드
}
```

## 3. for-in 루프

배열이 아닌 객체를 순회할때 사용 열거하는 순서 정해져 있지 않다. 고유프로퍼티만 순회하기 위해 `hasOwnProperty()` 메서드 사용

``` js
// 객체
var man = {
    hands: 2,
    legs: 2,
    heads: 1
};

if (typeof Object.prototype.clone === "undefined") {
    Object.prototype.clone = function () {};
}
```

``` js
for (var i in man) {
    if (man.hasOwnPropery(i)) {
        console.log(i, ";", man[i]);
    }
}
```

``` js
for (var i in man) { // 안티패턴
    console.log(i, ":", man[i]);
}
```

``` js
for (var i in man) {
    if(Object.prototype.hasOwnProperty.call(man, i)) {
        console.log(i, ":", man[i]);
    }
} // man객체가 hasOwnProperty를 재정의해도 활용 가능
// 프로퍼티 탐색이 Object까지 멀리 거슬러 올라가지 않게 하려면 지역 변수 사용하여 메서드 '캐시'

var i,
    hasOwn = Object.prototype.hasOwnProperty;
    for (i in man) {
        if(hasOwn.call(man, i)) {
            console.log(i, ":", man[i]);
        }
    }
```
