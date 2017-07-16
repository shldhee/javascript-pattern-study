# Chapter3 함수

## 1. 배경 지식

자바스크립트의 함수를 특별하게 만드는 두 가지 중요한 특징

1. ***함수는 일급(first-class) 객체다.***
1. ***함수는 유효범위(scope)를 제공한다.***

**1급객체란?**

* 1급함수는 함수의 인자가 될수 있어야 한다.
* 1급함수는 함수의 리턴이 될수 있어야 한다.
* 1급함수는 변수에 할당 될수 있어야 한다.

**함수는 다음과 같은 특징을 가지는 객체다.**

* 런타임, 즉 프로그램 실행 중에 동적으로 생성할 수 있다.
* 변수에 할당할 수 있고, 다른 변수에 참조를 복사할 수 있으며, 확장가능하고, 몇몇 특별한 경우를 제외하면 삭제 할 수 있다.
* 다른 함수의 인자로 전달할 수 있고, 다른 함수의 반환 값이 될 수 있다.
* 자기 자신의 프로퍼티와 메서드를 가질 수 있다.

``` js
var test_fn1 = function(){ console.log('first class function'); }; // 함수는 변수에 할당 될수있다.
console.log(test_fn1());

var test_fn2 = function(fn){ fn(); }; //함수 인자를 실행

test_fn2(function(){ console.log('나는 익명함수...');}); //함수는 함수의 인자가 될수 있다

var fn_outer = function(){
	console.log('fn_outer 함수 동작...');
return function(){
	console.log('리턴되는 함수가 동작...');
	};
};

var ret_fn = fn_outer();
ret_fn();    // fn_outer함수의 리턴된 함수가 실행된다. 즉 함수는 함수의 리턴이 될수있다.
ret_fn();
```

***자바스크립트에서 함수는 하나의 객체라고 생각하면 된다.***

다음 예제를 보자.

``` js
// 안티패턴
// 데모의 목적으로만 사용
var add = new Function('a, b', 'return a + b');
add(1, 2); // 3을 반환
```

이 코드는 add()는 생성자를 통해 만들었기 때문에 객체라는 사실이 명확하다. *그러나 Function() 생성자의 사용은 좋지 않다.* 코드가 문자열로 전달되고 따옴표를 이스케이프해야 하고 가독성이 좋지 않다.

**두 번째로 중요한 기능은 함수가 유효범위를 제공한다.**

자바스크립트에서는 중괄호({}) 지역 유효범위가 없고 단지 함수 유효범위가 있다.
어떤 변수이건 함수 내에서 `var`로 정의되면 지역 변수이고 함수 밖에서 참조할 수 없다.
중괄호가 지역 유효범위를 제공하지 않는다는 말은 변수를 `if문`, `for문`, `while문` 내에서 `var`로 정의해도, 이 변수가 `if`나 `for`, `while`문의 지역변수가 되지 않는다.

전역 변수를 최소화하는 것이 좋기 때문에 변수의 유효범위를 잘 관리하기 위해서 함수는 없어서는 안될 존재다.

### 1-1) 용어정리

패턴에 대해 이야기할 때 합의된 정확한 이름을 사용하는 것은 코드자체만큼이나 중요하다.

#### 함수 표현식(function expression)

``` js
// 기명 함수 표현식
var add = function add(a, b) {
	return a +  b;
};

var add1 = function add2(a, b) {
	return a +  b;
};

add1(1,2); // var 뒤에껄로 함수 호출
```

이 코드는 `기명 함수 표현식(named function expression)`을 사용한 함수
이름을 생략한 함수 표현식을 `무명 함수 표현식(unnamed function expression)`이라고 한다.
간단하게 `함수 표현식(function expression)`이라고도 하고, `익명 함수(anonymouse function)`라느 말로도 널리 쓰인다.

``` js
// 함수 표현식 (또는 익명 함수)
var add = function (a, b) {
	return a + b;
};
```

* `기명 함수 표현식`에서 두 번째 `add`를 생략하고 `무명 함수 표현식`으로 끝내도, 함수의 정의나 뒤이은 함수의 호출에 영향을 미치지 않는다.
* 유일한 차이점은 함수 객체의 `name`프로퍼티가 빈 문자열이 된다는 것이다.
* `name` 프로퍼티는 ECMA 표준이 아니라 언어의 확장기능이지만 많은 실행 환경에서 사용된다.
* 두 번째 `add`를 그대로 유지한다면 `add.name` 프로퍼티는 문자열 "add"라는 값을 가지게 된다.
* `name`프로퍼티는 파이어버그와 같은 디버거를 사용할 때,
* 그리고 함수 안에서 자기 자신을 재귀적으로 호출할때 유용하다. 이런 용도로 쓸게 아니면 생략해도 된다.

#### 함수 선언문(function declaration)

``` js
function foo() {
	// 함수 본문
}
```

함수 표현식의 결과를 변수에 할당하지 않을 경우 기명 함수 표현식과 함수 선언문은 비슷해 보인다. 생성하는 문맥을 보지 않고서는 구분할 수 없다.
세미콜론이 붙는지 여부에 따라 그 둘의 문법적인 차이가 있다.
함수 선언문에는 세미콜론이 필요하지 않지만 함수표현식에는 필요하다.
**항상 세미콜론을 사용하자.**

### 1-2) 선언문 vs 표현식: 이름과 호이스팅

함수 선언문과 함수 표현식 중 어떤 것을 사용해야 될까?
**함수 선언문을 사용할 수 없는 경우를 생각하면 쉽게 풀린다.**

``` js
// 함수 표현식을 callMe 함수의 인자로 전달한다.
callMe(function () {
	// 이 함수는 무명 함수(익명 함수) 표현식이다.
});

// 기명 함수 표현식을 callMe 함수의 인자로 전달한다.
callMe(function me() {
	// 이 함수는 "me"라는 기명 함수 표현식이다.
});

// 함수 표현식을 객체의 프로퍼티로 저장한다.
var myobject = {
	say: function () {
		// 이 함수는 함수 표현식이다.
	}
};
```

***함수 선언문은 전역 유효범위나 다른 함수의 본문 내부, 즉 '프로그램 코드'에만 쓸 수 있다.***
* 변수, 프로퍼티에 할당할 수 없다.(var 빼면 기명 함수 표현식과 같은데.......?)
* 함수 호출시 인자로 함수를 넘길 때도 사용할 수 없다.

``` js
// 전역 유효범위
function foo() {}
	function local() {
		// 지역 유효범위
		function bar() {}
			return bar;
	}
```

#### 함수의 name 프로퍼티

`name프로퍼티`는 표준이 아니다.
`함수 선언문`과 `기명 함수 표현식`을 사용하면 `name 프로퍼티`가 정의된다.
반면 `무명 함수 표현식`의 `name 프로퍼티`값은 경우에 따라 다르다.
IE는 `undefined` Chorme은 `변수값`

``` js
function foo() {} // 함수 선언문
var bar = function () {}; // 함수 표현식
var baz = function baz() {}; // 기명 함수 표현식

foo.name; // "foo"
bar.name; // X ""  O "bar"
baz.name; // "baz"
```

`name프로퍼티`는 파이어버그, 디버거에서 코드를 디버깅할 때 유용
함수 내에서 발생한 에러를 보여주어야 할 때, 디버거가 `name 프로퍼티`값을 확인하여 이름표로 사용
함수 내부에서 자신을 재귀적으로 호출할 떄도 사용하기도 한다.

***함수 선언문보다 함수 표현식을 선호한 이유는, 함수 표현식을 사용하면 함수가 다른 객체들과 마찬가지로 객체의 일종이며 어떤 특별한 언어 구성요소가 아니라는 사실이 좀더 드러나기 떄문***

### 1-3) 함수 호이스팅

``` js
function foo() {
	alert('global foo');
}
function bar() {
	alert('global bar');
}

function hoistMe() {
	console.log(typeof foo); // "function" 호이스팅 변수 및 함수 둘다 됨
	console.log(typeof bar); // "undefined" 호이스팅 변수만 되고 함수는 안됨

	foo(); // "local foo"
	bar(); // TypeError: bar is not a function

	// 함수 선언문 : 변수 'foo'와 정의된 함수 모두 호이스팅
	function foo() {
		alert('loca; foo');
	}

	// 함수 표현식 : 변수 'bar'는 호이스팅 되지만 정의된 함수는 호이스팅 되지 않는다.
	var bar = function () {
		alert('local bar');
	};
}
hoistMe();
```

**함수 호이스팅**은 함수 이름을 먼저 처리하기 때문에 일어나는 현상이므로 **함수 선언**에만 적용
**함수 표현식**은 변수를 통해서만 함수를 참조하기 때문에 호이스팅이 되지 않는다.

## 2. 콜백 패턴

> 함수는 객체다. 즉 함수를 다른 함수에 인자로 전달할 수 있다. `introduceBugs()` 함수를 `writeCode()`함수의 인자로 전달하면, 아마도 `writeCode()`는 어느 시점에 `introduceBugs()`를 실행(또는 호출) 할것이다. 이 때 `introduceBugs()`를 콜백함수 또는 콜백이라고 한다.

``` js
function writeCode(callback) {
	// 어떤 작업 수행
	callback();
	// ...
}

function introduceBugs() {
	// 버그를 만든다.
}
writeCode(introduceBugs);
```

`introduceBugs()`가 `writeCode()`의 인자로 괄호 없이 전달되었다. 괄호를 붙히면 함수가 실행되지만 붙히지 않으면 참조만하고 실행은 추후 `writeCode()`가 해준다.

### 2-1) 콜백 예제

``` js
var findNodes = function () {
	var i = 10000, // 긴 루프
		nodes = [], // 결과를 저장할 배열
		found; // 노드 탐색 결과
	while (i) {
		i -= 1;
		// 이 부분에 복잡한 로직
		nodes.push(found);
	}
	return nodes;
}
```

이 함수는 범용으로 쓸 수 있도록 실제 엘리멘트에는 어떤 작업도 하지 않고 단지 DOM 노드의 배열을 반환하기만 하도록 유지하는게 좋다. 노드를 수정하는 로직은 다른 함수에 두자.

``` js
var hide = function (nodes) {
	var i = 0, max = nodes.length;
	for (; i < max; i += 1) {
		nodes[i].style.display = "none";
	}
};
// 함수 실행
hide(findNdoes());
```

`findNodes()`에서 반환된 노드의 배열에 대해 `hide()`가 다시 루프를 돌기 때문에 비효율적이다.
`findNodes()`에서 노드를 선택하고 바로 숨긴다면 루프를 2번돌지 않아 효율적이다. 노드를 숨기는 로직의 실행을 콜백 함수에 위임하고 이 함수를 `findNodes()`에 전달한다.

``` js
// findNodes()가 콜백을 받도록 리팩터링한다.
var findNodes = function (callback) {
	var i = 10000,
		nodes = [],
		found;

	// 콜백 함수를 호출할 수 있는지 확인한다.
	if (typeof callback ~== "function") {
		callback = false;
	}

	while (i) {
		i -= 1;
		// 이곳에 복잡한 로직을 구현

		// 여기서 콜백을 실행
		if (callback) {
			callback(found);
		}

		nodes.push(found);
	}
	return nodes;
}
```

이 구현 방법은 직관적이다. `findNodes()`에는 실행하는 작업 하나만 추가되었고, 콜백은 생략 가능해서 리팩터링 이전과 동일하게 사용 가능
`hide()`의 구현은 노드들을 순회할 필요가 없어져 더 간단하다.

``` js
// 콜백함수
var hide = function (node) {
	node.style.display = "none";
};

// 노드를 찾아서 바로 숨긴다.
findNodes(hide);
```

콜백함수는 이미 존재하는 함수로 쓸 수도 있지만, 함수를 호출할 떄 익명 함수를 생성해서 쓸 수 있다.

``` js
// 익명 함수를 콜백으로 전달한다.
findNodes(function (node) {
	node.style.display = "block";
});
```
### 2-2) 콜백과 유효범위

콜백이 일회성의 익명 함수나 전역 함수가 아니고 *객체의 메서드*인 경우
만약 콜백 메서드가 자신이 속해있는 객체를 참조하기 위해 `this`를 사용하면 예상치 않게 동작할 수 있다.

``` js
// myapp이라는 객체의 메서드인 paint() 함수를 콜백으로 사용

var myapp = {};
myapp.color = "green";
myapp.paint = function (node) {
	node.style.color = this.color;
};

// findNodes() 함수는 이런 식으로 작동

var findNodes = function (callback) {
	// ...
	if (typeof callback === "function") {
		callback(found);
	}
	// ...
};
```

* `findNodes(myapp.paint)` 호출 시 `findNodes()`가 전역 함수이므로 `this`는 전역 객체를 차조
* 따라서 `this.color`가 정의되지 않아 정상적으로 동작하지 않는다.
* 만약 `findNodes()`가 `dom.findNodes()`라는 객체의 메서드라면, 콜백 내부의 `this`는 `dom`을 참조


*문제 해결을 위해 콜백 함수와 함께 콜백이 속해 있는 객체를 전달*

``` js
findNodes(myapp.paint, myapp);
// 전달 받은 객체를 바인딩하도록 findNodes() 또한 수정

var findNdoes = function (callback, callback_obj) {
	//...
	if (typeof callback === "function") {
		callback.call(callback_obj, found);
	}
	// ...
};
```

`call()`,`apply()` 추후 살펴봄

콜백으로 사용될 메서드와 겍체를 전달할 때, 메서드를 문자열로 전달할 수도 있다.
이렇게 하면 객체르 두 번 반복하지 않아도 된다.

``` js
findNodes(myapp.paint, myapp);

다음과 변경 가능

findNodes("paint", myapp);

이 두 가지 방법에 모두 대응하는 findNodes()를 다음과 같이 정의할 수 있다.

var findNodes = function (callback, callback_obj) {
	if(typeof callback === "string") {
		callback = callback_obj[callback];
	}

	//...
	if(typeof callback === "function") {
		callback.call(callbackobj, found);
	}

	//...
}
```

### 2-3) 비동기 이벤트 리스너

> 콜백 패턴은 다양하게 사용 된다. 예를 들어 페이지의 엘리먼트에 이벤트 리스너를 붙이는 것, 실제로는 이벤트가 발생했을 때 호출될 콜백 함수의 포인터를 전달하는 것이다.

다음은 `document`의 `click` 이벤트 리스너로 `console.log()` 콜백 함수를 전달하는 예제

``` js
document.addEventListener("click", console.log, false);
```

자바스크립트가 이벤트 구동형 프로그래밍에 적합한 이유는 프로그램이 비동기적으로, 달리 말하면 무작위로 동작할 수 있게 하는 콜백 패턴 덕분인다.

비동기 이벤트 구동형 방식인 자바스크립트는 호출할 콜백 함수를 제공한다.
어떤 이벤트는 영영 발생하지 않을 수도 있기 때문에 때로는 콜백함수가 필요 이상으로 많을 수도 있다.
예를 들어 사용자가 `바로 구매` 버튼을 절대로 클릭하지 않는다면 시용카드 번호 형식의 유효성 검사하는 함수는 끝내 호출되지 않는다.

### 2-4) 타임아웃

> 또 다른 콜백 패턴의 실전 예제는 브라우저의 `window` 객체에 의해 제공되는 타임아웃 메서드들인 `setTimeout()`과 `setInterval()`이다. 이 메서들도 콜백함수를 받아서 실행시킨다.

``` js
var thePlot = function () {
	console.log('500ms later...');
};
setTimout(thePlot, 500);
```

***`thePlot`가 괄호 없이 변수로 전달되었다.***
이 함수를 곧바로 실행하지 않고 `setTimeout()`이 나중에 호출할 수 있도록 포인터 전달

### 2-5) 라이브러리에서의 콜백

* 소프트웨어 라이브러리에 들어갈 코드는 가능한 범용적이고 재사용할 수 있어야 한다.
* 콜백은 이런 일반화에 도움이 될 수 있다.
* 생각할 수 있는 모든 기능을 예측, 구현할 필요는 없다.
* 이는 라이브러리를 쓸데 없이 부풀릴 뿐 대부분의 사용자는 그런 커다란 기능들의 덩어리르 절대 필요하지 않는다.
* 핵심 기능에 집중하고 콜백 형태로 `연결고리(hook)`을 제공하라.
* 콜백 함수를 화룡하면 라이브러리 메서드를 만들고 확장하고 가다듬을 수 있다.

## 3. 함수 반환하기

> 함수는 객체이기 떄문에 반환 값을 사용할 수 있다. 즉 함수의 실행 결과로 꼭 어떤 데이터 값이나 배열을 반활할 필요는 없다는 뜻이다. 보다 특화된 함수를 반환할 수도 있고, 입력 값에 따라 필요한 함수를 새로 만들어낼 수도 있다.

``` js
// 이 함수는 일회적인 초기화 작업(alert(1)??)을 수행한 후 반환 값(return 뒤) 만든다.
var setup = function () {
	alert(1);
	return function () {
		alert(2);
	};
};

// setup 함수 사용
var my = setup(); // alert 1출력
my(); // alert 2 출력
```

 `setup()`은 반환된 함수를 감싸고 있기 때문에 ***클로저***를 생성한다.
 클로저는 반환 되는 함수에서는 접근할 수 있지만 코드 외부에서 접근할 수 없기 떄문에, 비공개 데이터 저장을 위해 사용할 수 있다.

 ***클로저***
 > 특정 함수가 참조하는 변수들이 선언된 렉시컬 스코프는 계속 유지되는데, 그 함수와 스코프를 묶어서 클로저라고 한다.

 ``` js
 // 호출시마다 값 증가
 var setup = function () {
	var count = 0;
	return function () {
		return (count += 1);
	};
};

// 사용 방법
var next = setup();
next(); // 1
next(); // 2
next(); // 3
 ```

 ## 4. 자기 자신을 정의하는 함수

 > 함수는 동적으로 정의할 수 있고 변수에 할당할 수 있다. 새로운 함수를 만들어 이미 다른 함수를 가지고 있는 변수에 할당한다면, 새로운 함수가 이전 함수를 덮어쓰게 된다. 이전 함수 포인터가 새로운 함수를 가리키도록 재사용

``` js
var scareMe = function () {
	alert("Boo!");
	scareMe = function () {
		alert("Doblue boo!");
	};
};

// 자기 자신을 정의하는 함수를 사용
scareMe(); // Boo!
scareMe(); // Double boo!
```

이 패턴은 함수가 어떤 초기화 준비 작업을 단 한번만 수행할 경우 유용하다.
불필요한 작업을 반복할 이유가 없기 떄문에 함수의 일부는 더 이상 쓸모가 없다.
이런 경우, 함수가 자기 자신을 재정의하여 구현 내용을 갱신할 수 있다.

**간단히 말해 재정의된 함수의 작업량이 적기 때문에 이 패턴은 애플리케이션 성능에 도움이 된다.**

* `게으른 함수 선언`
최초 사용 시점 점까지 함수를 완전히 정의하지 않고 있다가 호출된 이후에는 더 게을러져서 더 적게 일하기 때문이다.

단점은 자기 자신을 재정의한 이후에는 이전에 원본 함수에 추가했던 프로퍼티들을 모두 찾을 수 없게 된다는 점이다. 또한 함수가 다른 이름으로 사용된다면, 예를 들어 다른 변수에 할당되거나, 객체의 메서드로써 사용되면 재정의된 부분이 아니라 원본 함수의 본문이 실행된다.

``` js
// 1. 새로운 프로퍼티 추가
scareMe.property = "properly"

// 2. 다른 이름으로 할당
var parnk = scareMe;

// 3. 메서드로 사용
var spooky = {
	boo: scareMe
};

// 새로운 이름으로 호출한다.
prank(); // "Boo!"
prank(); // "Boo!"
console.log(prank.proeprty); // "properly"

// 메서드로 호출
spooky.boo(); // "Boo!"
spooky.boo(); // "Boo!"
console.log(spooky.boo.property); // "properly"

// 자기자신을 재정의한 함수 사용
scareMe(); // Double boo!
scareMe(); // Double boo!
console.log(scareMe.property); // undefined
```

함수가 새로운 변수에 할당되면 예상과 달리 자기 자신을 정의하지 않는다.
`prank()`가 호출 될때마다 알림으로 "Boo!"가 출력
또한 전역 `scareMe()` 함수를 덮어썼는데도 `prank()` 자신은 여전히 `property` 프로퍼티를 포함한 이전의 정의를 참조. *전역 `scareMe()` 함수를 덮어쓴다라는게 무슨말??????*
`spooky`객체의 `boo()` 메서드로 함수가 사용될때에도 똑같은 일이 일어난다.
이 모든 호출들은 계속해서 전역 `scareMe()`포인터를 덮어 쓴다.
마지막에 전역 `scareMe()`가 호출되었을 때 비로소,`Dobule boo`출력
`scareMe.property`도 더 이상 참조할 수 없다.

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
    Array.prototype.slice.call(arguments)), result; // 배열 반환?

  if (!myFunc.cache[cachekey])   {
    result = {};
    // ... 비용이 많이 드는 수행 ...
    myFunc.cache[cachekey] = result;
  }
  return myFunc.cache[cachekey];
};

// 캐시 저장공간
myFunc.cache = {};
```

직렬화하면 객체를 식별할 수 없게 되는 것을 주의하라. 만약 같은 프로퍼티를 가지는 두 개의 다른 객체를 직렬화하면, 이 두 객체는 같은 캐시 항목을 공유하게 될 것이다.

이 함수를 작성하는 다른 방법으로 함수 이름을 하드코딩하는 대신 `arguments.callee`를 사용해 함수를 참조할 수 있다.

*ECMAScript 5스트릭트 모드에서 허용되지 않는다.*

``` js
var myFunc = function (param) {
	var f = arguments.callee, result;

	if(!f.cache[param]) {
		result = {};
		// ... 비용이 많이 드는 수행 ...
		f.cache[param] = result;
	}
	return f.cache[param];
};

// 캐시 저장공간
myFunc.cache = {};
```

## 9. 설정 객체 패턴

> 설정 객체 패턴은 좀더 꺠끗한 API를 제공하는 방법이다. 라이브러리나 다른 프로그램에서 사용할 코드를 만들 때 특히 유용하다.

소프트웨어를 개발하고 유지보수하는 과정에서 요구사항이 변경되는 것은 어쩔 수 없는 현실이다.
`addPerson()`이라는 함수를 작성한다고 가정해보자. 이 함수는 이름과 성을 전달받아 목록에 사람을 추가한다.

``` js
function addPerson(first, last) {...}

//실제로는 생일도 저장해야되고, 성별, 주소도 선택적으로 저장할 필요하다는 것을 나중에 알게 되었다. 따라서 함수를 변경하여 새로운 매개변수를 추가했다.(선택적인 매개변수는 마지막에 위치)

function addPerson(first, last, gender, address) {..}

//이 시점에서 이미 함수는 길어지고 있다. 이떄 또 username 또한 선택 사항이 아닌, 반드시 필수로 저장해야 한다는 사실을 알게 되었다. 이제 함수를 호출 할때는 선택적인 매개변수도 전달해야 하며, 매개변수의 순서가 뒤섞이지 않게 주의해야 한다.

addPerson("Lee", "Kim", new Date(), null, null, "batman");

// 많은 수의 매개변수를 전달하기는 불편하다. 모든 매개변수를 하나의 객체로 만들어 대신 전달하는 방법이 낫다. 이 객체를 설정(configuration)을 뜻하는 conf라고 지정하자.

addPerson(conf);

// 그러면 함수의 사용자는 다음과 같이 conf를 선언할 수 있다.
var conf = {
	username: "batman",
	first: "Lee",
	last: "Kim"
};

addPerson(conf);
```

**설정 객체의 장점은 다음과 같다.**

* 매개변수와 순서를 기억할 필요가 없다.
* 선택적인 매개변수를 안전하게 생략할 수 있다.
* 읽기 쉽고 유지보수하기 편하다.
* 매개변수를 추가하거나 제거하기가 편하다.

**설정 객체의 단점**

* 매개변수의 이름을 기억해야 한다.
* 프로퍼티 이름은 압축되지 않는다.

이 패턴은 함수가 `DOM` 엘리먼트를 생성할 때나 엘리먼트의 CSS 스타일을 지정할 때 유용하다. 엘리먼트와 스타일은 많은 수의 어트리뷰트와 프로퍼티를 가지며 대부분은 선택적인 값이기 떄문

## 10. 커리(Curry)

### 10-1) 함수 적용

> 순수한 함수형 프로그래밍 언어에서, 함수는 불려지거나 호출된다고 표현하기보다 적용(apply)된다고 표현한다. 자바스크립트에서도 Function.prototype.apply()를 사용하면 함수를 적용할 수 있다. 자바스크립트의 함수는 객체이기 떄문에 메서드를 가진다.

``` js
// 함수를 정의한다.
var sayHi = function (who) {
	return "Hello" + (who ? ", " + who : "") + "!";
};

// 함수 호출
sayHi(); // "Hello"
sayHi('world'); // "Hello, world!"

// 함수 적용(apply)
sayHi.apply(null, ["hello"]); // "Hello, hello!"
```

**함수를 적용하는 것과 호출하는 것 모두 결과는 동일하다.**
`apply()`는 두 개의 매개변수를 받는다.
* 첫 번째는 이 함수 내에 `this`와 바인딩할 객체
* 두 번째는 배열 또는 인자(arguments)로 함수 내부에서 배열과 비슷한 형태의 `arguments`객체로 사용된다.
* 첫 번째 매개변수가 `null`이면, `this`는 전역객체를 가리킨다.
* 즉 함수를 특정 객체의 메서드로서가 아니라 일반적인 함수로 호출할 때와 같다.

함수가 객체의 메서드일 때는, (위 예제처럼) `null`을 전달하지 않는다. 다음은 `apply()`의 첫 번째 인자로 객체를 전달하는 예제다.

``` js
var alien = {
	sayHi: function (who) {
		return "Hello" + (who ? ", " + who : "") + "!";
	}
};

alien.sayHi('world'); // "Hello, world!"
sayHi.apply(alien, ["humans"]); // "Hello, humans!"
```

이 코드에서, `sayHi()`내부의 `this`는 `alien`을 가리킨다. 앞선 예제에서 `this`는 전역객체를 가리킨다.

함수 호출은 함수 적용을 가리키는 문법 설탕(syntatic sugar)

`Function.prototype`객체엔 `call()` 메서드도 있다.
함수의 매개변수가 단 하나일 떄는 굳이 배열을 만들지 않고 요소 하나만 지정하는 방법이 더 편하기 때문에 `call()`을 쓰는게 더 나을 때도 있다.

``` js
//배열을 만들지 않은 두 번째 방법이 더 효과적이다.
sayHi.apply(alien, ["humans"]); // "Hello, humans!"
sayHi.call(alien, "humans"); // "Hello, humans!"
```

10-2) 부분적인 적용

> 함수의 호출이 실제로는 인자의 묶음을 함수에 적용하는 것임을 알게 되었다. 인자전부가 아니라 일부 인자만 전달하는 것이 가능할까? 이것은 사실 수학 함수를 직접 계살할 때 쓰는 방법과 비슷하다.

두 개의 숫자 x와 y를 더하는 `add()` 함수가 있다고 해보자. 다음 코드는 x가 5이고 y가 4라고 했을때, 정답을 찾아내는 방법을 보여준다.

``` js
// 설명 목적 자바스크립트에서는 유효하지 않다.

// 이런 함수가 있다.
function add(x, y) {
	return x + y;
}

// 인자들이 알고 있다.
add(5, 4);

// 1단계 - 하나의 인자를 대체 하낟.
function add(5, y) {
	return 5 + y;
}

// 2단계 - 나머지 인자를 대체한다.
function add(5, 4) {
	return 5 + 4;
}
```

이 코드는 1단계, 2단계는 유효한 자바스크립트가 아니지만 이 문제를 직접 푸는 방법이라고 할 수 있다. 먼저 첫 번째 인자 값인 함수 내의 미지수 x를 우리가 알고 있는 값인 5로 대체. 나머지 인자에 대해서도 동일한 과정 반복
이 예제의 1단계에서 부분적인 적용이 수행되었다. 첫 번째 인자만을 적용한 상태이며, 부분적인 적용을 실행하면 결과(정답)가 나오는 대신 또 다른 함수가 나온다.
다음 코드는 가상의 `partialApply()` 메서드 사용법을 보여분다.

``` js
var add = function (x, y) {
	return x + y;
};

// 모든 인자 적용
add.apply(null, [5, 4]); // 9
// 인자를 부분적으로만 적용
var newadd = add.partialApply(null, [5]);
// 새로운 함수에 인자를 적용
newadd.apply(null, [4]); // 9
```

예제에서 보는 것 처럼, 부분적인 적용을 실행한 결과는 또다른 함수이며, 이 함수는 다른 인자 값을 적용하여 호출할 수 있다. 이것은 사실 `add(5)(4)`와 같다.

다시 말해, `add(5,4)`는 `add(5)(4)`를 대신하는 문법 설탕이라고 생각할 수 있다.

자바스크립트의 함수는 기본적으로 이렇게 동작하지 않는다. 그러나 자바스크립트는 굉장히 동적이기 때문에 이렇게 동작하도록 만들 수 있다.

#### 함수가 부분적인 적용을 이해하고 처리할 수 있도록 만드는 과정을 커링이라고 한다.

## 10-2) 커링(Curring)

> 함수를 어떻게 커링할 수 있을까? 다른 함수형 언어에서는 커링 기능이 언어 자체에 내장되어 있어 모든 함수가 기본적으로 커링된다.

자바스크립트에서는 `add()` 함수를 수정하여 부분 적용을 처리하는 커링 함수로 만들 수 있다.

``` js
// 커링된 add()
// 부분적인 인자의 목록을 받는다.
function add(x, y) {
	var oldx = x, oldy = y;
	if (typeof oldy === "undefined") { // 부분적인 적용
		return function (newy) {
			return oldx + newy;
		};
	}
  // 전체 인자를 적용
	return x + y;
}

// 테스트
typeof add(5); // "function"
add(3)(4); // 7

// 새로운 함수를 만들어 저장
var add2000 = add(2000);
add2000(10); // 2010
```

* 처음 `add()` 호출할때, `add`가 반환하는 내부 함수에 클로저를 만든다.
* 클로저는 `x`와 `y`값을 `oldx`와 `oldy`에 저장
* 첫 번째 변수인 `oldx`는 내부 함수가 실행될 때 사용
* 부분적인 적용이 없고 `x`,`y` 둘다 전달되었따면, 함수는 단순히 이 둘을 더한다.
* `add()`는 설명을 위해 장황히 구현 다음 예제는 더 간단하다.

``` js
// 커링된 add
// 부분적인 인자의 목록을 받는다.
function add(x, y) {
	if (typeof y === "undefined") {
		return function (y) {
			return x + y;
		};
	}
	// 전체 인자를 적용
	return x + y;
}
```

* `oldx`,`oldy`가 없다
* `x`는 암묵적으로 클로저에 저장, 이전 예제에서 `newy`라는 새로운 변수를 만들었던 것돠는 달리 지역 변수 `y`를 재사용한다.
* `add()` 자체가 부분적인 적용을 처리한다.

조금 더 범용적인 방식으로 처리 할 수 있을까? 다시 말해, 어떤 함수라도 부분적인 매개변수를 받는 새로운 함수로 변형할 수 있을까? 다음의 예제는 이를 수행하는 범용 함수를 보여준다.

범용 커링 함수의 코드는 다음과 같다.
``` js
function schonfinkelize(fn) {

	var slice = Array.prototype.slice,
	    stored_args = slice.call(arguments, 1); // slice, split, splice 공부

	return function () {

		var new_args = slice.call(arguments),
		    args = stored_args.concat(new_args);

		return fn.apply(null, args);
	};
}
```

`schonfinkelize()` 처음 호출 될때, 지역 변수 `slice`에 `slice()` 메서드에 대한 참조를 저장하고, `stored_args`에 인자를 저장한다. **이떄 첫 번째 인자는 커링될 함수이기 떄문에 떼어 낸다.** 그리고 새로운 함수를 반환한다. 반환된 새로운 함수는 호출되었을 때 클로저를 통해 이전에 비공개로 저장해 둔 `stored_args`와 `slice` 참조에 접근할 수 있다. 새로운 함수는 이미 일부 적용된 인자인 `stored_args`와 새로운 `new_args`를 합친 다음, 클로저에 저장되어 있는 원래의 함수 `fn`에 적용하기만 하면 된다.
  어떤 함수라도 커링할 수 있는 범용적인 도구를 갖추었으니, 몇 가지 테스트를 실행해보자.

``` js
// 일반 함수
function add(x, y) {
	return x + y;
}

// 함수를 커링하여 새로운 함수를 얻는다.
var newadd = schonfinkelize(add, 5);
newadd(4); // 9

// 반환되는 새로운 함수를 바로 호출할 수도 있다.
schonfinkelize(add, 6)(7); // 13

// 함수를 변형시키는 schonfinkelize()에 매개변수를 한 개만 쓸 수 있거나 커링을 한 단계만 할 수 있는 건 아니다. 더 많은 사용 예제를 살펴보자.

// 일반 함수
function add(a ,b ,c , d, e) {
	return a + b + c + d + e;
}

// 여러 개의 인자를 사용할 수도 있다.
schonfinkelize(add, 1, 2, 3)(5, 5); // 16

// 2단계의 커링
var addOne = schonfinkelize(add, 1);
addOne(10, 10, 10, 10); // 41
var addSix = schonfinkelize(addOne, 2 , 3);
addSix(5, 5); // 16
```

### 10-3) 커링을 사용해야 할 경우

> 어떤 함수를 호출할 때 대부분의 매개변수가 항상 비슷하다면, 커링의 적합한 후보라고 할 수 있따. 매개변수 일부를 적용하여 새로운 함수를 동적으로 생성하면 이 함수는 반복되는 매개변수를 내부적으로 저장하여, 매번 인자를 전달하지 않아도 원본 함수가 기대하는 전체 목록을 미리 채워놓을 것이다.

## 11. 요약

> 이 장은 함수에 관한 배경지식과 용어에 대해 다루었다.

### 함수의 두 가지 특징

#### 1. 함수는 일급 객체다. 값으로 전달될 수 있고, 프로퍼티와 메서드를 확장할 수 있다.

#### 2. 함수는 지역 유효범위를 제공한다. 다른 중괄호 묶음은 그렇지 않다. 로컬 변수의 선언은 로컬 유효범위의 맨 윗부분으로 호이스팅된다는 점도 기억해두어야 한다.

### 함수를 생성하는 문법

#### 1. 기명 함수 표현식

#### 2. 함수 표현식.(위와 동일하지만 이름만 없는 것) 익명 함수라고도 한다.

#### 3. 함수 선언문. 다른 언어의 함수 문법과 유사하다.

### 여러 가지 유용한 패턴

#### 1. API 패턴 : 함수에 더 좋고 깔끔한 인터페이스를 제공할 수 있게 도와준다.

 * 콜백 패턴 - 함수를 인자로 전달
 * 설정 객체 - 함수에 많은 수의 매개변수를 전달할 때 통제를 벗어나지 않도록 해준다.
 * 함수 반환 - 함수의 반환 값이 또 다시 함수일수있다.
 * 커링 - 원본 함수와 매개변수 일부를 물려받는 새로운 함수를 생성

#### 2. 초기화 패턴 : 웹페이지와 애플리케이션에서 매우 흔히 사용되는 초기화와 설정 작업을, 전역 네임스페이스를 어지럽히지 않고 임시 변수를 사용해 좀더 깨끗하고 구조화된 방법으로 수행할 수 있게 도와준다.

 * 즉시 실행 함수  - 정의되자마자 실행한다.
 * 즉시 객체 초기화 - 익명 객체 내부에서 초기화 작업을 구조화한 다음 즉시 호출 할 수 있는 메서드를 제공
 * 초기화 시점의 분기 - 최초 코드 실행 시점에 코드를 분기하여, 애플리케이션 생명 주기 동안 계속해서 분기가 발생하지 않도록 막아준다.

#### 3. 성능 패턴 : 코드의 실행속도를 높이는 데 도움을 준다.

 * 메모이제이션 패턴 - 함수 프로퍼티를 사용해 계산된 값을 다시 계산되지 않도록한다.
 * 자기선언 함수 - 자기 자신을 덮어씀으로써 두 번째 호출 이후부터는 작업량이 줄어들게 만든다.
