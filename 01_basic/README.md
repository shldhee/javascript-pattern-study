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
    if (man.hasOwnProperty(i)) {
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

## 4. 내장 생성자 프로토타입 확장하기 / 확장하지 않기

내장 생성자 프로토타입을 확장하지 않는 것이 최선이다.


## 5. switch 패턴

``` js
var inspect_me = 0,
    result = '';

switch (inspcet_me) {
  case 0:
    result = "zero";
    break;
  case 1:
    result = "one";
    break;
  default:
    result = "unknwon";
}


switch (inspcet_me) {
case 0:
  result = "zero";
  break;

/*
  if () {
    blahblah
  }  else {
    blahblah
  }
*/
```

위의 예제에서 지켜진 규칙

* 각 case문을 switch문에 맞추어 정렬 (일반적인 중괄호 내 들여쓰기 규칙에서 벗어나는 방식)
* 각 case문 안에서 코드를 들여쓰기 한다.
* 각 case문은 명확하게 break;로 종료
* break문을 생략하여 통과(fall-through)시키지 않는다. 그런 방법이 최선책이라는 확인이 있다면 해당 case에 반드시 기록을 남긴다.
* 상응하는 case문이 하나도 없을 때는 정상적인 결과가 나올 수 있도록 switch문 마지막에는 default:문을 쓴다.

## 6. 암묵적 타입캐스팅 피하기

자바스크립트는 변수를 비교할 때 암묵적으로 타입캐스팅을 실행한다. 떄문에 `false == 0`이나 `"" == 0`과 같은 비교가 true를 반환한다.
**암묵적 타입캐스팅으로 인한 혼돈을 막기 위해서는, 항상 표현식의 값과 타입을 모두 확인하는 `===`와 `!==` 연산자를 사용해야한다.**

``` js
var zero = 0;
if (zero === false) {
  // zero는 0이고 false가 아니기 떄문에 이 블록은 실행되지 않는다.
}

//안티패턴
if (zero == false) {
  // 이 블록은 실행된다.
}
```

### `eval()` 피하기

``` js
//안티패턴
var property = "name";
alert(eval("obj." + property));

//권장안
var property = "name";
alert(obj[property)]);
```

``` js
//안티패턴
setTimeout("myFunc()", 1000);
setTimeout("myFunc(1, 2, 3)", 1000);

// 권장안
setTimeout(myFunc, 1000);
setTimeout(function () {
  myFunc(1,2,3);
}, 1000);
```

전역 변수로 남아 네임스페이스를 어지럽히는 것은 un뿐이다.

``` js
console.log(typeof un); // 'undefined' 가 기록된다.
console.log(typeof deux); // 'undefined' 가 기록된다.
console.log(typeof trois); // 'undefined' 가 기록된다.

var jsstring = 'var un = 1; console.log(un);';
eval(jsstring); // 1 이 기록된다.

jsstring = 'var deux = 2; console.log(deux);';
new Function(jsstring)(); // 2 가 기록된다

jsstring = 'var trois = 3; console.log(trois);';
(function () {
	eval(jsstring);
})(); // 3 이 기록된다.

// 전역 스코프에서 변수들을 체크해 본다.
console.log(typeof un); // number 가 기록된다.
console.log(typeof un); // undefined 가 기록된다.
console.log(typeof un); // undefined 가 기록된다.
eval() 과 Function 생성자 간의 또 다른 차이는 eval() 은 유효범위 체인에 간섭을 일으킬 수 있지만 Function 은 좀더 봉인되어 있다는 점이 다릅니다.\
Function 은 어디서 실행시키든 상관없이 자신의 유효범위를 가지고 있기 때문에 지역 변수를 덜 오염시킵니다.
```


다음 예제는 eval() 은 그 자신의 바깥쪽 유효범위에 접근하고 수정을 가할 수 있는 반면, Function 은 그럴 수 없습니다.(Function 을 사용하는 것과 new Function 은 동일하다)
``` js
(function () {
	var local = 1;
	eval('local = 3; console.log(local);'); // 3 이 기록된다.

	console.log(local); // 유효범위를 오염시켜 3 이 기록된다.
})();


(function () {
	var local = 1;
	Function('console.log(typeof local);')(); // undefined 가 기록된다.
})();
```

## 7. parseInt()를 통한 숫자 변환

parseInt() 사용하면 문자열로부터 숫자값을 얻을 수 있다. 두 번째 매개변수는 기수를 받는데 대부분 생략하는데 생략하면 안된다.
일관성 없고 예측을 벗어나느 결과를 피하려면 항상 기수 매개변수를 지정해 주어야 한다.

``` js
var month = "06",
    year = "09";
month = parseInt(month, 10);
year = parseInt(year, 10);

var month = "1024";
month = parseInt(month, 10);
year = parseInt(month, 8);
day = parseInt(month, 2);
```

문자열을 숫자로 변환하는 다른 방법

``` js
+"08"
Number("08");

var a = "08";
var b = "08월";
+a; // 8
+b; // NaN
Number(a); // 8
Number(b); // NaN
parseInt(a); // 8
parseInt(b); // 8
```

## 8. 코딩규칙

### 들여쓰기

### 중괄호

중괄호는 생략할 수 있을 때도 항상 써야 한다.

``` js
// 나쁜 습관
for (var i = 0; i < 10; i += 1)
  alert(i);

// 나쁜 습관
for (var i = 0; i < 10; i += 1)
  alert(i);
  alert(i + " is " + ( i % 2 ? "odd" : "even")); // 루프 바깥에 있다.

// 좋은 습관
for (var i = 0; i < 10; i += 1) {
  alert(i);
}
```

if문도 마찬가지이다.

### 여는 중괄호의 위치

자바스크립트는 까다롭지 않아서 세미콜론을 쓰지 않고 행을 종료하면 알아서 대신 세미콜론을 추가 해준다. 이러한 동작 방식은 함수의 반환 값이 객체 리터럴이고 이 객체의 여는 중괄호가 다음행에 올 경우 문제를 일으킬 수 있다.

``` js
function func() { // 예상과 다른 반환 값이 나온다.
  return
  {
    name: "Batman"
  };
}

function func() {
  return undefined;
  {
    name: "Batman"
  }
}

// 올바른
function func () {
  return {
    name: "Batman"
  }
}
```

name 프로퍼티를 가진 객체를 반환하지 않고 자동으로 추가된 세미콜론 떄문에 이 함수는 `undefined`를 반환한다.

### 공백

``` js
for (var i = 0; i < 10; i += 1 )
for (Var i = 0, max = 10; i < max; i += 1)
var a = [1, 2, 3];
var o = {a: 1, b: 2};
myFunc(a, b, c)
function myFunc() {}
var myFunc = function () {};

var d = 0,
    a = b + 1;
if (a && b && c) {
    d = a % c;
    a += d;
}
```

## 9. 명명 규칙

### 생성자를 대문자로 시작하기

``` js
var adam = new Person();
```

### 단어 구분

낙타 표기법(camel case)

``` js
MyConstructor()
myFunciont()
calculateArea()
getFirstName()

변수
first_name
favorite_bands
old_company_name
```

### 그 외의 명명 패턴

상수(값이 변경돼서는 안되는 변수)는 대문자 표시

``` js
var PI = 3.14,
    MAX_WIDTH = 800;
```

비공개 메서드나 프로퍼티명에 접두어로 밑줄을 붙혀 구별하기 쉽게 한다

``` js
ver person = {
  getName: function() {
    return this._getFisrt() + ' ' + this._getLast();
  },
  _getFirst: function () {

  }, //...
}
```

`_getFirst()` 메서드는 실제로는 일반적인 공개 메서드이지만, 밑줄 접두어를 사용함으로써 향후 이 메서드의 동작을 보장할 수 없고 직접 사용해서는 안된다는 사실을 경고하는 것이다.
_private 규칙의 몇 가지 변형 패턴

* name_ 또는 getElements_()와 같이 비공개라는 의미로 밑줄을 끝에 붙인다.
* _projected 프로퍼티에는 밑줄 한 개, __private 프로퍼티에는 밑줄 두 개를 사용
* 파이어폭스에서는 자바스크립트가 공식적으로 지원하지 않는 내부 프로퍼티를 일부 사용 이 프로퍼티명에는 __proto__또는 __parent__처럼 앞뒤로 두 개의 밑줄이 붙어있다.

## 10. 주석 작성

**모든 함수의 매개변수와 반환 값에 대해서는 문서화할 필요가 있다.**

---
## 요약

* 전역변수를 최소화한다. 애플리케이션 당 전역 변수가 한 개만 존재하는 것이 가장 이상적이다.
* 함수 내 var 선언을 한 번만 사용한다. 단일한 위치에 모든 변수를 모아놓고 지켜볼 수 있고,변수 호이스팅으로 인해 발생하는 예기치 못한 부작용을 방지한다.
* for 루프와 for-in 루프, switch문에 대해 살펴보았다.
* 내장 생성자 프로토타입을 확장하지 않는다.
* 코드 작성 규칙 준수
* 생성자, 함수, 변수명에 명명 규칙 준수
