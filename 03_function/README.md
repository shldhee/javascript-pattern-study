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
