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
